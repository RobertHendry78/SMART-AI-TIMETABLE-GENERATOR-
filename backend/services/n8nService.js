/**
 * n8n Automation Service
 * Dispatches webhooks to n8n workflow engine upon faculty leave & AI substitute assignments.
 */

const http = require('http');
const https = require('https');

let lastDispatchStatus = {
  lastAttempt: null,
  lastSuccess: null,
  statusCode: null,
  lastMessage: 'Ready - No webhooks dispatched yet',
  totalDispatches: 0
};

/**
 * Returns active configuration and health status
 */
function getWebhookStatus() {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/faculty-leave';
  return {
    configuredUrl: webhookUrl,
    enabled: process.env.N8N_ENABLED !== 'false',
    ...lastDispatchStatus
  };
}

/**
 * Dispatches payload to n8n via HTTP POST
 * Uses non-blocking timeout so timetable backend never stalls if n8n is offline.
 *
 * @param {Object} payload 
 * @returns {Promise<Object>}
 */
async function dispatchToN8N(payload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/faculty-leave';
  
  lastDispatchStatus.lastAttempt = new Date().toISOString();
  lastDispatchStatus.totalDispatches++;

  console.log(`[n8n Automation] Sending webhook to: ${webhookUrl}`);
  console.log(`[n8n Automation] Event: ${payload.event || 'GENERIC_EVENT'}`);

  return new Promise((resolve) => {
    try {
      const urlObj = new URL(webhookUrl);
      const postData = JSON.stringify(payload);

      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'Smart-AI-Timetable-Dispatcher/1.0',
          'X-Institution': 'Smart-Academic-Institution'
        },
        timeout: 4000 // 4s timeout
      };

      const req = client.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          lastDispatchStatus.statusCode = res.statusCode;
          lastDispatchStatus.lastSuccess = res.statusCode >= 200 && res.statusCode < 300 ? new Date().toISOString() : lastDispatchStatus.lastSuccess;
          lastDispatchStatus.lastMessage = `Response received: HTTP ${res.statusCode}`;

          console.log(`[n8n Automation] Webhook response HTTP ${res.statusCode}`);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            body: responseBody
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        lastDispatchStatus.statusCode = 408;
        lastDispatchStatus.lastMessage = 'Timeout: n8n workflow did not respond within 4 seconds';
        console.warn(`[n8n Automation] Webhook request timed out`);
        resolve({ success: false, error: 'Request timeout' });
      });

      req.on('error', (err) => {
        lastDispatchStatus.statusCode = 0;
        lastDispatchStatus.lastMessage = `Connection error: ${err.message}`;
        console.warn(`[n8n Automation] Webhook could not reach ${webhookUrl}: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      req.write(postData);
      req.end();
    } catch (err) {
      lastDispatchStatus.statusCode = 500;
      lastDispatchStatus.lastMessage = `Invalid Webhook URL or Config: ${err.message}`;
      console.error(`[n8n Automation] Error constructing webhook:`, err);
      resolve({ success: false, error: err.message });
    }
  });
}

/**
 * High-level helper to trigger automated n8n notifications when a teacher takes leave
 */
async function notifySubstituteAssignment(leaveData, substitutes = []) {
  const payload = {
    event: 'FACULTY_LEAVE_AUTO_SUBSTITUTE',
    timestamp: new Date().toISOString(),
    institution: 'Smart Academic Institution',
    faculty: {
      id: leaveData.teacherId || 'T-UNKNOWN',
      name: leaveData.teacherName || 'Faculty Member',
      department: leaveData.department || 'Academic Department',
      email: leaveData.email || `${(leaveData.teacherName || 'faculty').toLowerCase().replace(/[^a-z]/g, '')}@institution.edu`
    },
    leaveDetails: {
      day: leaveData.day,
      reason: leaveData.reason || 'Personal / Sick Leave',
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
    },
    substitutionsCount: substitutes.length,
    substitutes: substitutes.map(sub => ({
      period: sub.period,
      time: sub.time || `Period ${sub.period}`,
      className: sub.className,
      subject: sub.subject,
      substituteFaculty: sub.substituteTeacherName || sub.substituteName,
      substituteId: sub.substituteTeacherId || sub.substituteId,
      substituteEmail: `${(sub.substituteTeacherName || 'sub').toLowerCase().replace(/[^a-z]/g, '')}@institution.edu`
    })),
    notificationChannels: ['Email', 'SMS / Mobile App', 'Institution Portal'],
    generatedBy: 'Smart AI Timetable Generator v2.5'
  };

  return dispatchToN8N(payload);
}

module.exports = {
  dispatchToN8N,
  notifySubstituteAssignment,
  getWebhookStatus
};
