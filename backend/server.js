/**
 * Smart AI Time Table Generator - Express.js REST API Server
 * Features:
 * - MongoDB Connection with in-memory resilient fallback
 * - REST APIs for Timetable Generation, Role Auth & Faculty Leaves
 * - n8n Automation Webhook Integration for substitute alerts
 * - Static frontend hosting for unified Docker deployments
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env from project root (parent of /backend)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve modern React UI bundle from frontend/dist (with fallback)
const frontendDistDir = fs.existsSync(path.join(__dirname, '../frontend/dist'))
  ? path.join(__dirname, '../frontend/dist')
  : path.join(__dirname, '../client/dist');
app.use(express.static(frontendDistDir));


// API Routes
const timetableRoutes  = require('./routes/timetableRoutes');
const authRoutes       = require('./routes/authRoutes');
const n8nRoutes        = require('./routes/n8nRoutes');
const supabaseRoutes   = require('./routes/supabaseRoutes');
const facultyRoutes    = require('./routes/facultyRoutes');
const leaveRoutes      = require('./routes/leaveRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');
const subjectRoutes    = require('./routes/subjectRoutes');

app.use('/api', timetableRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/automation', n8nRoutes);
app.use('/api/supabase', supabaseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectRoutes);

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart AI Timetable Generator API',
    version: '2.5.0',
    n8nWebhook: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/faculty-leave'
  });
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistDir, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ Smart AI Time Table Generator Server running!`);
  console.log(`📡 Local API:     http://localhost:${PORT}/api`);
  console.log(`🌐 Web Interface: http://localhost:${PORT}`);
  console.log(`🤖 n8n Webhook:   ${process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/faculty-leave'}`);
  console.log(`☁️  Database:      Supabase → ${process.env.SUPABASE_URL || 'NOT CONFIGURED'}`);
  console.log(`====================================================`);
});
