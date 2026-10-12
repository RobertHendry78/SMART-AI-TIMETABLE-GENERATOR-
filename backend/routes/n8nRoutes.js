/**
 * n8n Automation Routes
 * API endpoints to manage, monitor, and test n8n workflow triggers
 */

const express = require('express');
const router = express.Router();
const n8nService = require('../services/n8nService');

// Get current n8n webhook status
router.get('/status', (req, res) => {
  const status = n8nService.getWebhookStatus();
  return res.status(200).json({
    success: true,
    data: status
  });
});

// Trigger a test alert to verify the n8n pipeline is receiving payloads
router.post('/trigger-test', async (req, res) => {
  const testLeave = {
    teacherId: 'T101',
    teacherName: 'Dr. Robert Langdon',
    department: 'Computer Science & Engineering',
    day: 'Monday',
    reason: 'Medical Leave - AI Auto-Trigger Test'
  };

  const testSubstitutes = [
    {
      period: 1,
      time: '09:00 AM - 09:50 AM',
      className: 'CSE - Year 3 - Sec A',
      subject: 'Data Structures & Algorithms',
      substituteTeacherName: 'Prof. Alan Turing',
      substituteTeacherId: 'T103'
    },
    {
      period: 3,
      time: '11:00 AM - 11:50 AM',
      className: 'CSE - Year 2 - Sec B',
      subject: 'Database Systems',
      substituteTeacherName: 'Dr. Ada Lovelace',
      substituteTeacherId: 'T102'
    }
  ];

  try {
    const result = await n8nService.notifySubstituteAssignment(testLeave, testSubstitutes);
    return res.status(200).json({
      success: true,
      message: 'Test webhook dispatched to n8n workflow engine',
      deliveryResult: result,
      status: n8nService.getWebhookStatus()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch test webhook',
      error: error.message
    });
  }
});

// Process leave & execute intelligent substitute allocation via n8n single workflow
router.post('/allocate-substitute', async (req, res) => {
  try {
    const payload = req.body;
    const result = await n8nService.dispatchToN8N(payload);
    let parsedData = result.body;
    try {
      if (typeof result.body === 'string') {
        parsedData = JSON.parse(result.body);
      }
    } catch (e) {}

    return res.status(200).json({
      success: result.success,
      status: result.status,
      data: parsedData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to execute n8n allocation',
      error: error.message
    });
  }
});

// Real leave notification endpoint called by frontend or admin
router.post('/notify-leave', async (req, res) => {
  const { leaveData, substitutes } = req.body;

  if (!leaveData) {
    return res.status(400).json({
      success: false,
      message: 'leaveData is required'
    });
  }

  try {
    const result = await n8nService.notifySubstituteAssignment(leaveData, substitutes || []);
    return res.status(200).json({
      success: true,
      message: 'n8n Workflow notified successfully',
      deliveryResult: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error delivering notification to n8n',
      error: error.message
    });
  }
});

// 100% Free WhatsApp Alert Dispatch
router.post('/whatsapp-alert', async (req, res) => {
  const payload = req.body;
  try {
    const result = await n8nService.dispatchToN8N({
      event: 'WHATSAPP_ALERT_DISPATCH',
      ...payload,
      timestamp: new Date().toISOString()
    });
    return res.status(200).json({
      success: true,
      message: 'WhatsApp alert dispatched to n8n pipeline (100% Free)',
      deliveryResult: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch WhatsApp alert to n8n',
      error: error.message
    });
  }
});

// List all pre-built n8n workflow templates
router.get('/workflows', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const workflowsDir = path.join(__dirname, '../../n8n/workflows');

  try {
    if (!fs.existsSync(workflowsDir)) {
      return res.status(200).json({ success: true, workflows: [] });
    }
    const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));
    const workflowList = files.map(file => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(workflowsDir, file), 'utf8'));
        return {
          fileName: file,
          name: content.name || file,
          nodesCount: (content.nodes || []).length,
          downloadUrl: `/api/automation/workflows/${file}`
        };
      } catch (e) {
        return { fileName: file, name: file, nodesCount: 0, downloadUrl: `/api/automation/workflows/${file}` };
      }
    });

    return res.status(200).json({ success: true, workflows: workflowList });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Fetch a specific n8n workflow template JSON
router.get('/workflows/:fileName', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const safeName = path.basename(req.params.fileName);
  const filePath = path.join(__dirname, '../../n8n/workflows', safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Workflow file not found' });
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return res.status(200).json(content);
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Invalid JSON format in workflow' });
  }
});

module.exports = router;
