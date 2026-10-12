# ⚡ Smart AI Time Table Generator

An automated, intelligent school and college timetable scheduling system powered by **Artificial Intelligence & Constraint Satisfaction Programming (CSP)**.

Eliminates manual scheduling errors, avoids teacher clashes and room collisions, dynamically reassigns qualified substitute teachers when faculty members take leave, integrates with **MongoDB**, triggers **n8n Automation Workflows**, and deploys seamlessly via **Docker Compose**.

---

## 🌟 Key Capabilities

1. **100% Conflict-Free Guarantee (0 Clashes)**:
   - Evaluates teacher availability, classroom capacity, and period limits simultaneously using Constraint Satisfaction heuristics (MRV & Forward Checking).
   - Guarantees zero double-booking for teachers, rooms, and student sections.
2. **Dynamic AI Substitute Teacher & Leave Engine**:
   - Mark any faculty member absent with 1 click.
   - The AI engine calculates multi-factor candidate scores based on subject expertise (+35 pts), department compatibility (+20 pts), and fair workload balancing.
   - Schedules are dynamically updated with an amber badge, and an automated alert is triggered.
3. **Role-Based Portals (Principal, HOD, Staff)**:
   - 🏛️ **Principal Login**: Full institution-wide administration, AI timetable generation, and master matrix.
   - 🎓 **HOD Login**: Departmental schedule, faculty leave approvals, and substitute allocations.
   - 👩‍🏫 **Staff / Faculty Login**: Personal faculty schedule, free periods tracking, substitution duty alerts, and leave application.
   - **1-Click Quick Demo Login** buttons for instant evaluation.
4. **n8n Workflow Automation Pipeline**:
   - Built-in webhook dispatcher automatically notifies students and substitute teachers via Email and SMS when leaves occur.
   - Complete workflow definition included in `n8n/workflows/faculty_substitute_alert.json`.
5. **MongoDB Database Persistence**:
   - Complete Mongoose schemas for Teachers, Subjects, Classrooms, Leaves, and Timetables.
   - Resilient architecture: automatic fallback to in-memory mode if running in standalone browser mode.
6. **Multi-Container Docker Deployment**:
   - Production-ready `docker-compose.yml` orchestrating `backend`, `mongodb`, and `n8n`.
7. **Clean Executive Light Theme by Default**:
   - Modern, professional soft light palette with dark mode toggle.
   - Neutral academic branding (`Smart Academic Institution`, `@institution.edu`).
8. **Export & Print**:
   - One-click print-ready PDF generator with institutional header.
   - Export to CSV/Excel for spreadsheet analysis.

---

## 🔑 Demo Login Accounts

| Role | User ID / Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| 🏛️ **Principal** | `principal@institution.edu` | `admin123` | Full Superadmin (AI Generator, Master Matrix, All Leaves) |
| 🎓 **HOD (AI & DS)** | `hod.aids@institution.edu` | `hod123` | Department Timetables, Faculty Leaves & Substitutes |
| 👩‍🏫 **Staff (CS)** | `priya.s@institution.edu` | `staff123` | Personal Timetable, Workload & Leave Applications |
| 👨‍💼 **Staff (Networks)** | `anand.k@institution.edu` | `staff123` | Personal Timetable, Workload & Leave Applications |

*(Tip: In the web interface, you can click any of the 1-Click Quick Login chips to test without typing passwords!)*

---

## 🐳 Docker Deployment (Recommended for Full Stack)

To run the complete system (Backend API + MongoDB Database + n8n Automation Engine) with a single command:

```bash
# 1. Start all containers in the background
docker compose up -d

# 2. View running services
docker compose ps

# 3. View live server logs
docker compose logs -f
```

### Services Available After Docker Start:
- 🌐 **Web Application & REST API**: [http://localhost:5000](http://localhost:5000)
- 🤖 **n8n Workflow Automation Engine**: [http://localhost:5678](http://localhost:5678)
- 🍃 **MongoDB Database**: `mongodb://localhost:27017/smart_timetable_db`

To stop all services:
```bash
docker compose down
```

---

## 🤖 n8n Workflow Setup & Importing

To activate the automated substitute alert pipeline in n8n:
1. Open [http://localhost:5678](http://localhost:5678) in your browser.
2. In the n8n interface, click **Workflows** → **Import from File...**.
3. Select the pre-configured workflow file:
   `n8n/workflows/faculty_substitute_alert.json`
4. Click **Publish / Activate** in n8n.
5. In the Timetable UI, click the **🤖 n8n Workflows** button in the header and click **Send Live Test Webhook** to test!

---

## 🚀 Alternative Ways to Run

### Option 1: Instant Standalone Browser Launch (Zero-Setup)
No installations required. Open the web interface immediately in any web browser:
1. In PowerShell:
   ```powershell
   Start-Process "C:\Users\sameer\.gemini\antigravity-ide\scratch\smart-ai-timetable-generator\public\index.html"
   ```
   Or double-click `public/index.html` in Windows File Explorer.

### Option 2: Local Node.js Development Server
```bash
# Install dependencies
npm install

# Optional: Seed sample faculty, subjects, and classrooms into MongoDB
npm run seed

# Start server
npm run dev
# Server will run at http://localhost:5000
```

### Option 3: Python Google OR-Tools AI Solver
```bash
cd python_ai
pip install -r requirements.txt
python ai_solver.py
```

---

## 📁 Complete Project Structure

```
smart-ai-timetable-generator/
│
├── public/                       # Zero-dependency browser web interface
│   ├── index.html                # Light Theme UI, Role Login, n8n Hub, Modals
│   ├── styles/
│   │   ├── main.css              # Light/dark design system & glassmorphism
│   │   ├── timetable.css         # Grid layouts, slot cards, substitute badges
│   │   └── animations.css        # Visual radar sweep, pulse & shimmer
│   └── js/
│       ├── app.js                # State management, n8n webhook dispatcher
│       ├── auth.js               # Multi-role authentication & session state
│       ├── aiSolver.js           # CSP Algorithm (Forward checking, MRV heuristic)
│       ├── substituteEngine.js   # Dynamic leave manager & substitute ranker
│       ├── sampleData.js         # Realistic College & School presets
│       ├── notificationCenter.js # Real-time alerts & unread badges
│       ├── dragDropEngine.js     # Drag-and-drop period swapping & clash guard
│       └── exporter.js           # PDF print & CSV export utilities
│
├── backend/                      # Node.js + Express REST API
│   ├── server.js                 # Server entry point with MongoDB & n8n routes
│   ├── Dockerfile                # Backend container definition
│   ├── package.json              # Backend dependencies
│   ├── seed.js                   # Database seeder script for MongoDB
│   ├── config/db.js              # MongoDB Mongoose connection with resilient fallback
│   ├── models/                   # Mongoose schemas (Teacher, Subject, Classroom, Timetable)
│   ├── controllers/              # REST controllers (Timetable, Leave/Substitute)
│   ├── routes/                   # API routes (Auth, Timetable, Automation)
│   └── services/                 # n8n webhook dispatcher service
│
├── n8n/
│   └── workflows/
│       └── faculty_substitute_alert.json  # Importable n8n workflow pipeline
│
├── python_ai/                    # Google OR-Tools CP-SAT solver
│   ├── ai_solver.py              # Discrete constraint programming formulation
│   └── requirements.txt          # Python dependencies
│
├── docs/                         # Academic documentation kit
│   ├── PROJECT_REPORT.md         # Full project report with SRS & architecture
│   └── SYSTEM_DESIGN.md          # ER & Data Flow Diagrams
│
├── Dockerfile                    # Multi-stage production container
├── docker-compose.yml            # Multi-service compose (backend, mongodb, n8n)
├── .dockerignore                 # Container build exclusions
├── .env.example                  # Environment configuration template
├── package.json                  # Root runner scripts
└── README.md
```

---

## 🎓 Academic Submission & College Presentation Notes
- **Title**: Smart AI Time Table Generator & Dynamic Faculty Substitute Engine
- **Keywords**: Artificial Intelligence, Constraint Satisfaction Programming (CSP), MRV Heuristic, Forward Checking, MongoDB, Express, Docker, n8n Workflow Automation.
- Fully documented in the `docs/` folder with complete Software Requirements Specification (SRS), Entity-Relationship (ER) models, and system flowcharts.
