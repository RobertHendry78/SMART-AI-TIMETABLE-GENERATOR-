/**
 * Supabase REST API Routes
 * Endpoints for testing, configuring, syncing, and reading Supabase cloud records.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const supabaseService = require('../config/supabase');

// Check Supabase connection status
router.get('/status', async (req, res) => {
  const status = supabaseService.getStatus();
  res.json({
    success: true,
    data: status
  });
});

// Test connection to Supabase
router.post('/test', async (req, res) => {
  const { url, key } = req.body;
  const result = await supabaseService.testConnection(url, key);
  res.json({
    success: result.connected,
    ...result
  });
});

// Configure / Update Supabase credentials in runtime
router.post('/configure', async (req, res) => {
  const { url, key } = req.body;
  if (!url || !key) {
    return res.status(400).json({ success: false, message: 'Both url and key are required' });
  }

  const result = await supabaseService.testConnection(url, key);
  res.json({
    success: result.connected,
    message: result.connected ? 'Supabase configured and connected successfully!' : 'Credentials saved, but could not connect: ' + (result.error || ''),
    details: result
  });
});

// Fetch all timetables from Supabase
router.get('/timetables', async (req, res) => {
  const result = await supabaseService.getTimetablesFromSupabase();
  res.json(result);
});

// Save timetable to Supabase
router.post('/timetables', async (req, res) => {
  const payload = req.body;
  const result = await supabaseService.saveTimetableToSupabase(payload);
  res.json(result);
});

// Get n8n automation logs from Supabase
router.get('/logs', async (req, res) => {
  const result = await supabaseService.getAutomationLogs();
  res.json(result);
});

// Log an automation event
router.post('/logs', async (req, res) => {
  const result = await supabaseService.logAutomationToSupabase(req.body);
  res.json(result);
});

// Read and return the SQL schema for 1-click copying
router.get('/schema', (req, res) => {
  try {
    const schemaPath = path.join(__dirname, '../../supabase/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      return res.json({ success: true, schema: sqlContent });
    }
    return res.status(404).json({ success: false, message: 'Schema file not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
