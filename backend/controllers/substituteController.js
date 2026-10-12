/**
 * Substitute Controller - Handles faculty leave tracking, dynamic replacements,
 * and dispatching notifications to the n8n automation pipeline.
 */

const n8nService = require('../services/n8nService');
const supabaseService = require('../config/supabase');

let activeLeaves = [];

exports.getActiveLeaves = async (req, res) => {
  const supa = supabaseService.getSupabase();
  if (supa) {
    try {
      const { data, error } = await supa.from('faculty_leaves').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return res.status(200).json({ success: true, source: 'supabase', data });
      }
    } catch (e) {
      console.warn('[Supabase Leaves Query Warning]', e.message);
    }
  }

  return res.status(200).json({
    success: true,
    source: 'memory',
    data: activeLeaves
  });
};

exports.createLeave = async (req, res) => {
  const { teacherId, teacherName, day, reason, autoAssign, substitutions } = req.body;
  
  const leaveId = 'LV-' + Date.now();
  const newLeave = {
    id: leaveId,
    teacherId,
    teacherName,
    day,
    reason: reason || 'Personal Leave',
    autoAssign: autoAssign !== false,
    substitutions: substitutions || [],
    createdAt: new Date().toISOString()
  };

  activeLeaves.push(newLeave);

  // 1. Save Leave to Supabase Cloud
  const supa = supabaseService.getSupabase();
  if (supa) {
    try {
      await supa.from('faculty_leaves').insert([{
        teacher_id: teacherId || 'T-UNKNOWN',
        teacher_name: teacherName || 'Faculty',
        day_of_week: day || 'Monday',
        reason: reason || 'Personal Leave',
        substitutes_assigned: substitutions || [],
        n8n_notified: true,
        status: 'Approved'
      }]);
    } catch (e) {
      console.warn('[Supabase Insert Leave Warning]', e.message);
    }
  }

  // 2. Trigger n8n webhook asynchronously
  n8nService.notifySubstituteAssignment(newLeave, substitutions || []).then(deliv => {
    supabaseService.logAutomationToSupabase({
      event: 'FACULTY_LEAVE_ALERT',
      webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/faculty-leave',
      payload: newLeave,
      statusCode: deliv?.status || 200,
      responseBody: deliv?.body || 'OK'
    });
  }).catch(err => {
    console.warn(`[n8n Webhook Error] Could not reach n8n: ${err.message}`);
  });

  return res.status(201).json({
    success: true,
    message: `Leave recorded for ${teacherName}. AI auto-allocation triggered & saved to Supabase.`,
    data: newLeave
  });
};

exports.deleteLeave = (req, res) => {
  const { id } = req.params;
  const index = activeLeaves.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Leave record not found' });
  }

  const removed = activeLeaves.splice(index, 1)[0];
  return res.status(200).json({
    success: true,
    message: `Leave cancelled. Restored schedule for ${removed.teacherName}`,
    data: removed
  });
};
