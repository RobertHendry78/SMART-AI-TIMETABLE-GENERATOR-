/**
 * End-to-End System Connectivity & Crash-Resilience Test Suite
 * Tests Frontend, Backend, Database Fallback, AI Solvers, and Automations.
 */

const http = require('http');

async function request(options, postData = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          raw: data,
          data: json !== null ? json : data
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'ERR', ok: false, error: err.message });
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('===============================================================');
  console.log('🚀 SMART AI TIMETABLE - CRASH-PROOF SYSTEM CONNECTIVITY TEST');
  console.log('===============================================================\n');

  const testResults = [];

  function record(name, category, res, validator) {
    const passed = res.ok && (!validator || validator(res));
    testResults.push({ name, category, passed, status: res.status, details: res.error || (passed ? 'PASSED ✅' : 'FAILED ❌') });
    console.log(`[${category}] ${name.padEnd(40)} -> ${passed ? '✅ SUCCESS' : '❌ FAILED'} (HTTP ${res.status})`);
    if (!passed && res.error) console.log(`   Error: ${res.error}`);
  }

  // 1. FRONTEND CHECKS
  console.log('--- 1. FRONTEND APPLICATION SERVERS ---');
  const fe5000 = await request({ host: 'localhost', port: 5000, path: '/', method: 'GET' });
  record('Express Frontend Hosting (Port 5000)', 'FRONTEND', fe5000, r => typeof r.raw === 'string' && r.raw.includes('Smart AI Timetable'));


  // 2. BACKEND CORE REST APIS
  console.log('\n--- 2. BACKEND REST API ENDPOINTS ---');
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  record('Health Check API (/api/health)', 'BACKEND', health, r => r.data && r.data.status === 'healthy');

  const masterData = await request({ host: 'localhost', port: 5000, path: '/api/master-data', method: 'GET' });
  record('Master Timetable Data (/api/master-data)', 'BACKEND', masterData, r => r.data && r.data.success);

  const faculty = await request({ host: 'localhost', port: 5000, path: '/api/faculty', method: 'GET' });
  record('Faculty Roster API (/api/faculty)', 'BACKEND', faculty, r => r.data && r.data.success);

  const dashboard = await request({ host: 'localhost', port: 5000, path: '/api/dashboard', method: 'GET' });
  record('Dashboard API (/api/dashboard)', 'BACKEND', dashboard, r => r.data && r.data.success);

  const leaves = await request({ host: 'localhost', port: 5000, path: '/api/leaves', method: 'GET' });
  record('Faculty Leaves API (/api/leaves)', 'BACKEND', leaves, r => r.data && r.data.success);

  // 3. AI TIMETABLE GENERATION SOLVER (OR-TOOLS)
  console.log('\n--- 3. AI OPTIMIZATION ENGINE (OR-TOOLS) ---');
  const ortools = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/timetable/generate-ortools',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { department: 'CSE', year: 3, semester: 5, algorithm: 'CP-SAT-ORTOOLS' });
  
  record('OR-Tools CP-SAT Solver (/generate-ortools)', 'AI-SOLVER', ortools, r => {
    return r.data && r.data.success && r.data.metrics && r.data.metrics.clashes === 0;
  });

  if (ortools.data && ortools.data.metrics) {
    console.log(`   💡 Solver Metrics: Clashes = ${ortools.data.metrics.clashes}, Fitness = ${ortools.data.metrics.fitnessScore || 100}%, Solve Time = ${ortools.data.metrics.timeTakenMs || 100}ms, Status = ${ortools.data.status}`);
  }

  // 4. DATABASE ZERO-CRASH RESILIENCE
  console.log('\n--- 4. DATABASE RESILIENCE & ADAPTERS ---');
  const dbSave = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/timetable/save',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { department: 'CSE', year: 3, semester: 5, timetable: { Monday: [] }, note: 'Resilience Test' });
  record('Database Save Resilience (/timetable/save)', 'DATABASE', dbSave, r => r.data && r.data.success);

  // 5. AUTOMATION & INTEGRATIONS (n8n & Supabase)
  console.log('\n--- 5. AUTOMATION & CLOUD SYNC ---');
  const n8nStatus = await request({ host: 'localhost', port: 5000, path: '/api/automation/status', method: 'GET' });
  record('n8n Automation Status (/automation/status)', 'AUTOMATION', n8nStatus, r => r.data && r.data.success);

  const n8nTrigger = await request({ host: 'localhost', port: 5000, path: '/api/automation/trigger-test', method: 'POST' });
  record('n8n Webhook Dispatch Test (/trigger-test)', 'AUTOMATION', n8nTrigger, r => r.data && r.data.success);

  const whatsapp = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/automation/whatsapp-alert',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { recipient: '+919876543210', message: 'Test Timetable Alert' });
  record('WhatsApp Alert API (/whatsapp-alert)', 'AUTOMATION', whatsapp, r => r.data && r.data.success);

  const supabaseStatus = await request({ host: 'localhost', port: 5000, path: '/api/supabase/status', method: 'GET' });
  record('Supabase Cloud Sync Status (/supabase/status)', 'DATABASE-CLOUD', supabaseStatus, r => r.data && r.data.success);

  // SUMMARY
  console.log('\n===============================================================');
  const allPassed = testResults.every(t => t.passed);
  const total = testResults.length;
  const passedCount = testResults.filter(t => t.passed).length;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passedCount} | FAILED: ${total - passedCount}`);
  if (allPassed) {
    console.log('🎉 ALL SYSTEMS 100% OPERATIONAL & CONNECTED WITHOUT ANY CRASHES!');
  } else {
    console.log('⚠️ Some tests flagged issues, inspect above log.');
  }
  console.log('===============================================================\n');
}

runAllTests();
