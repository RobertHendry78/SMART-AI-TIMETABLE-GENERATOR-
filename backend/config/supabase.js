/**
 * Supabase Cloud Database Client & Configuration
 * Provides seamless connection to Supabase PostgreSQL with in-memory fallback.
 */

const { createClient } = require('@supabase/supabase-js');

let supabaseInstance = null;
let currentConfig = {
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '',
  connected: false,
  lastChecked: null,
  error: null
};

// In-memory local fallback store
const localStore = {
  timetables: [],
  faculty: [],
  subjects: [],
  leaves: [],
  automation_logs: []
};

/**
 * Initialize or get active Supabase client
 */
function getSupabase(customUrl = null, customKey = null) {
  const url = customUrl || currentConfig.url || process.env.SUPABASE_URL;
  const key = customKey || currentConfig.key || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    if (!supabaseInstance || customUrl || customKey) {
      try {
        supabaseInstance = createClient(url, key, {
          auth: { persistSession: false }
        });
        currentConfig.url = url;
        currentConfig.key = key;
        currentConfig.connected = true;
        currentConfig.error = null;
      } catch (err) {
        currentConfig.connected = false;
        currentConfig.error = err.message;
        supabaseInstance = null;
      }
    }
  }

  return supabaseInstance;
}

/**
 * Test connectivity with Supabase project
 */
async function testConnection(testUrl = null, testKey = null) {
  const startTime = Date.now();
  const url = testUrl || currentConfig.url || process.env.SUPABASE_URL;
  const key = testKey || currentConfig.key || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      connected: false,
      message: 'Supabase URL or Key not configured. Using local in-memory persistence mode.',
      mode: 'LOCAL_FALLBACK',
      latencyMs: 0
    };
  }

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    
    // Attempt lightweight ping by querying public.timetables or public.faculty
    const { data, error } = await client.from('timetables').select('id').limit(1);

    const latencyMs = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, we still know the credentials and API endpoint are valid!
      if (error.message && (error.message.includes('relation') || error.message.includes('does not exist'))) {
        currentConfig.connected = true;
        currentConfig.lastChecked = new Date().toISOString();
        return {
          connected: true,
          message: 'Connected to Supabase! (Note: Run schema.sql in Supabase SQL editor to create tables).',
          schemaNeeded: true,
          latencyMs
        };
      }
      throw error;
    }

    currentConfig.connected = true;
    currentConfig.lastChecked = new Date().toISOString();
    currentConfig.error = null;
    supabaseInstance = client;

    return {
      connected: true,
      message: 'Successfully connected to Supabase Cloud Database!',
      latencyMs,
      timestamp: currentConfig.lastChecked
    };
  } catch (err) {
    currentConfig.connected = false;
    currentConfig.error = err.message;
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message}`,
      error: err.message,
      latencyMs: Date.now() - startTime
    };
  }
}

/**
 * Save / Upsert timetable to Supabase
 */
async function saveTimetableToSupabase(timetablePayload) {
  const client = getSupabase();
  
  if (client) {
    try {
      const record = {
        institution_name: timetablePayload.institutionName || 'Smart Academic Institution',
        academic_preset: timetablePayload.preset || 'college',
        academic_year: timetablePayload.academicYear || '2025-2026',
        schedule_data: timetablePayload.scheduleData || {},
        conflict_count: timetablePayload.conflictCount || 0,
        fitness_score: timetablePayload.fitnessScore || 100.0,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client.from('timetables').insert([record]).select();
      if (!error && data) {
        return { success: true, source: 'SUPABASE_CLOUD', data: data[0] };
      }
    } catch (err) {
      console.warn('[Supabase] Sync failed, storing locally:', err.message);
    }
  }

  // Local fallback
  const localItem = {
    id: 'local-' + Date.now(),
    ...timetablePayload,
    savedAt: new Date().toISOString()
  };
  localStore.timetables.unshift(localItem);
  return { success: true, source: 'LOCAL_STORE', data: localItem };
}

/**
 * Fetch timetables from Supabase
 */
async function getTimetablesFromSupabase() {
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client.from('timetables').select('*').order('created_at', { ascending: false }).limit(10);
      if (!error && data) {
        return { success: true, source: 'SUPABASE_CLOUD', count: data.length, data };
      }
    } catch (err) {
      console.warn('[Supabase] Fetch error:', err.message);
    }
  }

  return { success: true, source: 'LOCAL_STORE', count: localStore.timetables.length, data: localStore.timetables };
}

/**
 * Record an n8n webhook automation log into Supabase
 */
async function logAutomationToSupabase(logPayload) {
  const client = getSupabase();

  const record = {
    event_type: logPayload.event || 'N8N_AUTOMATION',
    webhook_url: logPayload.webhookUrl || 'unknown',
    payload: logPayload.payload || {},
    response_status: logPayload.statusCode || 200,
    response_body: logPayload.responseBody || 'OK',
    execution_time_ms: logPayload.durationMs || 50,
    status: (logPayload.statusCode >= 200 && logPayload.statusCode < 300) ? 'SUCCESS' : 'FAILED',
    created_at: new Date().toISOString()
  };

  if (client) {
    try {
      const { data, error } = await client.from('automation_logs').insert([record]).select();
      if (!error) {
        return { success: true, source: 'SUPABASE_CLOUD', data };
      }
    } catch (err) {
      console.warn('[Supabase] Automation log insert failed, saving in local memory:', err.message);
    }
  }

  localStore.automation_logs.unshift(record);
  return { success: true, source: 'LOCAL_STORE', data: record };
}

/**
 * Get recent automation logs
 */
async function getAutomationLogs() {
  const client = getSupabase();

  if (client) {
    try {
      const { data, error } = await client.from('automation_logs').select('*').order('created_at', { ascending: false }).limit(25);
      if (!error && data) {
        return { success: true, source: 'SUPABASE_CLOUD', data };
      }
    } catch (err) {
      console.warn('[Supabase] Logs query failed:', err.message);
    }
  }

  return { success: true, source: 'LOCAL_STORE', data: localStore.automation_logs };
}

module.exports = {
  getSupabase,
  testConnection,
  saveTimetableToSupabase,
  getTimetablesFromSupabase,
  logAutomationToSupabase,
  getAutomationLogs,
  getStatus: () => ({ ...currentConfig, localCounts: {
    timetables: localStore.timetables.length,
    logs: localStore.automation_logs.length
  }})
};
