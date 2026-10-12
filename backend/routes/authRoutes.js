const express = require('express');
const router = express.Router();

/**
 * Pre-configured role accounts for Suguna College of Engineering
 * Username pattern: @7150<name>
 * Password pattern: <dept><name first 4 letter> (e.g. ITraja, ITmyth, ITrame, ITpriy)
 */
let USERS_DB = [
  {
    id: "USR-001",
    username: "@7150rajagopal",
    email: "principal@sugunacollege.edu",
    altEmails: ["principal@institution.edu"],
    password: "ITraja",
    altPasswords: ["admin123", "password123"],
    name: "Dr. S. Rajagopal",
    role: "principal",
    roleLabel: "Principal & Academic Director",
    avatar: "🏛️",
    phone: "+91 9842100001",
    degree: "Ph.D in Computer Science & Engineering",
    collegeId: "SCE-PRIN-001",
    dob: "1974-04-12",
    address: "Suguna Campus Quarters, Coimbatore - 641014",
    department: "Suguna College Administration",
    deptCode: "ALL",
    designation: "Principal & Superadmin"
  },
  {
    id: "USR-HOD-IT",
    username: "@7150mythili",
    email: "hod.it@sugunacollege.edu",
    altEmails: ["hod.it@institution.edu"],
    password: "ITmyth",
    altPasswords: ["hod123"],
    name: "Dr. Mythili",
    role: "hod",
    roleLabel: "Head of Department (Information Technology)",
    avatar: "👩‍🏫",
    phone: "+91 9842100002",
    degree: "Ph.D in Information & Communication Engineering",
    collegeId: "SCE-HOD-IT-01",
    dob: "1980-07-25",
    address: "42, Bharathi Colony, Peelamedu, Coimbatore",
    department: "Information Technology",
    deptCode: "IT",
    teacherId: "T101",
    designation: "Professor & HOD"
  },
  {
    id: "USR-HOD-AIDS",
    username: "@7150kavitha",
    email: "hod.aids@sugunacollege.edu",
    altEmails: ["hod.aids@institution.edu"],
    password: "AIDSkavi",
    altPasswords: ["ITkavi", "hod123"],
    name: "Dr. R. Kavitha",
    role: "hod",
    roleLabel: "Head of Department (AI & Data Science)",
    avatar: "🤖",
    phone: "+91 9842100003",
    degree: "Ph.D in Machine Learning & AI",
    collegeId: "SCE-HOD-AD-01",
    dob: "1982-10-18",
    address: "18, Nehru Nagar, Kalapatti Road, Coimbatore",
    department: "Artificial Intelligence & Data Science",
    deptCode: "AIDS",
    teacherId: "T201",
    designation: "Professor & HOD"
  },
  {
    id: "USR-HOD-CSE",
    username: "@7150rajasekaran",
    email: "hod.cse@sugunacollege.edu",
    altEmails: ["hod.cse@institution.edu"],
    password: "CSEraja",
    altPasswords: ["ITraja", "hod123"],
    name: "Dr. S. Rajasekaran",
    role: "hod",
    roleLabel: "Head of Department (Computer Science & Engg)",
    avatar: "💻",
    phone: "+91 9842100004",
    degree: "Ph.D in Distributed Systems",
    collegeId: "SCE-HOD-CS-01",
    dob: "1978-02-14",
    address: "9, Saravanampatti Main Road, Coimbatore",
    department: "Computer Science & Engineering",
    deptCode: "CSE",
    teacherId: "T301",
    designation: "Professor & HOD"
  },
  {
    id: "USR-STAFF-IT1",
    username: "@7150gayathiri",
    email: "gayathiri.it@sugunacollege.edu",
    altEmails: ["gayathiri@suguna.edu.in", "ramesh.it@sugunacollege.edu"],
    password: "ITgaya",
    altPasswords: ["staff123", "ITrame"],
    name: "Prof. Gayathiri",
    role: "staff",
    roleLabel: "Assistant Professor (Information Technology)",
    avatar: "👩‍🏫",
    phone: "+91 9842100011",
    degree: "M.E, Ph.D in Information Technology",
    collegeId: "SCE-IT-101",
    dob: "1989-06-15",
    address: "12, Gandhipuram, Coimbatore",
    department: "Information Technology",
    deptCode: "IT",
    teacherId: "T102",
    designation: "Assistant Professor"
  },
  {
    id: "USR-STAFF-IT2",
    username: "@7150suganya",
    email: "suganya.it@sugunacollege.edu",
    altEmails: ["suganya@suguna.edu.in", "priya.it@sugunacollege.edu"],
    password: "ITsuga",
    altPasswords: ["staff123", "ITpriy"],
    name: "Prof. Suganya",
    role: "staff",
    roleLabel: "Assistant Professor (Information Technology)",
    avatar: "👩‍💼",
    phone: "+91 9842100012",
    degree: "M.Tech in Software Engineering",
    collegeId: "SCE-IT-102",
    dob: "1991-08-20",
    address: "14, Lakshmi Mills Colony, Coimbatore",
    department: "Information Technology",
    deptCode: "IT",
    teacherId: "T103",
    designation: "Assistant Professor"
  },
  {
    id: "USR-STAFF-CSE1",
    username: "@7150ada",
    email: "ada.cse@sugunacollege.edu",
    password: "CSEada",
    altPasswords: ["ITada", "staff123"],
    name: "Dr. Ada Lovelace",
    role: "staff",
    roleLabel: "Professor (Computer Science & Engineering)",
    avatar: "👩‍🔬",
    phone: "+91 9876543212",
    degree: "Ph.D in Algorithm Design",
    collegeId: "SCE-CSE-103",
    dob: "1988-06-20",
    address: "55, Hope College Road, Coimbatore",
    department: "Computer Science & Engineering",
    deptCode: "CSE",
    teacherId: "T302",
    designation: "Professor"
  },
  {
    id: "USR-STAFF-AIDS1",
    username: "@7150turing",
    email: "alan.turing@sugunacollege.edu",
    password: "AIDSturi",
    altPasswords: ["staff123"],
    name: "Prof. Alan Turing",
    role: "staff",
    roleLabel: "Professor (AI & Data Science)",
    avatar: "👨‍🔬",
    phone: "+91 9842100020",
    degree: "M.Sc, D.Phil",
    collegeId: "SCE-AIDS-102",
    dob: "1985-05-12",
    address: "22, AI Technopark, Coimbatore",
    department: "Artificial Intelligence & Data Science",
    deptCode: "AIDS",
    teacherId: "T202",
    designation: "Distinguished Professor"
  },
  {
    id: "USR-HOD-MCT",
    username: "@7150balasubramanian",
    email: "hod.mct@sugunacollege.edu",
    password: "MCTbala",
    altPasswords: ["hod123"],
    name: "Dr. P. Balasubramanian",
    role: "hod",
    roleLabel: "Head of Department (Mechatronics)",
    avatar: "⚙️",
    phone: "+91 9842100005",
    degree: "Ph.D in Robotics & Automation",
    collegeId: "SCE-HOD-MT-01",
    dob: "1979-08-30",
    address: "15, Ganapathy, Coimbatore",
    department: "Mechatronics Engineering",
    deptCode: "MCT",
    teacherId: "T401",
    designation: "Professor & HOD"
  },
  {
    id: "USR-STAFF-MCT1",
    username: "@7150suresh",
    email: "suresh.v@sugunacollege.edu",
    password: "MCTsure",
    altPasswords: ["staff123"],
    name: "Prof. Suresh V.",
    role: "staff",
    roleLabel: "Assistant Professor (Mechatronics)",
    avatar: "👨‍🔧",
    phone: "+91 9842100025",
    degree: "M.E (Mechatronics)",
    collegeId: "SCE-MCT-102",
    dob: "1991-03-14",
    address: "33, Peelamedu, Coimbatore",
    department: "Mechatronics Engineering",
    deptCode: "MCT",
    teacherId: "T402",
    designation: "Assistant Professor"
  },
  {
    id: "USR-HOD-MECH",
    username: "@7150saravanan",
    email: "hod.mech@sugunacollege.edu",
    password: "MECHsara",
    altPasswords: ["hod123"],
    name: "Prof. K. Saravanan",
    role: "hod",
    roleLabel: "Head of Department (Mechanical)",
    avatar: "🔧",
    phone: "+91 9842100006",
    degree: "M.E, Ph.D in Thermal Engineering",
    collegeId: "SCE-HOD-ME-01",
    dob: "1981-12-05",
    address: "77, Vadavalli, Coimbatore",
    department: "Mechanical Engineering",
    deptCode: "MECH",
    teacherId: "T501",
    designation: "Associate Professor & HOD"
  },
  {
    id: "USR-STAFF-MECH1",
    username: "@7150prakash",
    email: "m.prakash@sugunacollege.edu",
    password: "MECHprak",
    altPasswords: ["staff123"],
    name: "Prof. M. Prakash",
    role: "staff",
    roleLabel: "Assistant Professor (Mechanical)",
    avatar: "👨‍🏭",
    phone: "+91 9842100026",
    degree: "M.E (Manufacturing)",
    collegeId: "SCE-MECH-102",
    dob: "1992-09-17",
    address: "4, Singanallur, Coimbatore",
    department: "Mechanical Engineering",
    deptCode: "MECH",
    teacherId: "T502",
    designation: "Assistant Professor"
  },
  {
    id: "USR-HOD-ECE",
    username: "@7150devi",
    email: "hod.ece@sugunacollege.edu",
    password: "ECEdevi",
    altPasswords: ["hod123"],
    name: "Dr. M. Devi",
    role: "hod",
    roleLabel: "Head of Department (ECE)",
    avatar: "📡",
    phone: "+91 9842100007",
    degree: "Ph.D in VLSI & Signal Processing",
    collegeId: "SCE-HOD-ECE-01",
    dob: "1983-04-22",
    address: "12, RS Puram, Coimbatore",
    department: "Electronics & Communication",
    deptCode: "ECE",
    teacherId: "T601",
    designation: "Professor & HOD"
  },
  {
    id: "USR-STAFF-ECE1",
    username: "@7150anand",
    email: "k.anand@sugunacollege.edu",
    password: "ECEanan",
    altPasswords: ["staff123"],
    name: "Prof. K. Anand",
    role: "staff",
    roleLabel: "Assistant Professor (ECE)",
    avatar: "👨‍💻",
    phone: "+91 9842100027",
    degree: "M.E (VLSI Design)",
    collegeId: "SCE-ECE-102",
    dob: "1990-01-19",
    address: "61, Saibaba Colony, Coimbatore",
    department: "Electronics & Communication",
    deptCode: "ECE",
    teacherId: "T602",
    designation: "Assistant Professor"
  }
];

// Helper to normalize username
function normalizeUsername(str) {
  if (!str) return '';
  let clean = str.trim().toLowerCase();
  if (!clean.startsWith('@')) {
    clean = '@' + clean;
  }
  return clean;
}

/**
 * POST /api/auth/register
 * Step 1: staff name, phone, mail id, degree, college id no, date of birth, address, department
 * Step 2: user name (@7150name), password (ITname first 4 letter), confirm
 */
router.post('/register', async (req, res) => {
  const {
    name,
    phone,
    email,
    degree,
    collegeId,
    dob,
    address,
    department,
    deptCode,
    username,
    password,
    role
  } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, username, and password are required for registration.'
    });
  }

  const cleanUsername = normalizeUsername(username);
  const cleanEmail = (email || '').trim().toLowerCase();

  // Check if username or email already registered
  const existing = USERS_DB.find(u => 
    normalizeUsername(u.username) === cleanUsername || 
    (cleanEmail && u.email.toLowerCase() === cleanEmail)
  );

  if (existing) {
    return res.status(409).json({
      success: false,
      message: `User with username "${cleanUsername}" or email "${cleanEmail}" is already registered. Please login.`
    });
  }

  const userRole = (role || 'staff').toLowerCase();
  const assignedDept = department || 'Information Technology';
  const assignedCode = deptCode || (assignedDept.includes('Computer') ? 'CSE' : assignedDept.includes('AI') ? 'AIDS' : 'IT');

  const newUser = {
    id: `USR-${Date.now()}`,
    username: cleanUsername,
    email: cleanEmail || `${cleanUsername.replace('@', '')}@sugunacollege.edu`,
    password: password.trim(),
    name: name.trim(),
    role: userRole,
    roleLabel: userRole === 'principal' ? 'Principal & Academic Director' :
               userRole === 'hod' ? `Head of Department (${assignedDept})` :
               `Faculty / Staff (${assignedDept})`,
    avatar: userRole === 'principal' ? '🏛️' : userRole === 'hod' ? '👨‍🏫' : '👩‍🏫',
    phone: phone || '',
    degree: degree || 'M.Tech',
    collegeId: collegeId || `SCE-${assignedCode}-${Math.floor(100 + Math.random() * 900)}`,
    dob: dob || '',
    address: address || '',
    department: assignedDept,
    deptCode: assignedCode,
    designation: userRole === 'principal' ? 'Principal' : userRole === 'hod' ? 'Professor & HOD' : 'Assistant Professor',
    created_at: new Date().toISOString()
  };

  USERS_DB.unshift(newUser);

  // Automatically sync registered staff/hod into Supabase faculty table
  if (userRole === 'staff' || userRole === 'hod') {
    try {
      const { getSupabase } = require('../config/supabase');
      const supabase = getSupabase();
      if (supabase) {
        const facId = `FAC-${assignedCode}-${Date.now().toString().slice(-4)}`;
        await supabase.from('faculty').upsert([{
          id: facId,
          name: newUser.name,
          department: assignedDept,
          designation: newUser.designation,
          email: newUser.email,
          phone: newUser.phone,
          status: 'active',
          is_active: true,
          max_weekly_hours: 18,
          max_periods: 6
        }], { onConflict: 'email' });
      }
    } catch (facErr) {
      console.warn('[Auth Register] Supabase faculty sync warning:', facErr.message);
    }
  }

  const { password: _, altPasswords: __, ...safeUser } = newUser;
  return res.status(201).json({
    success: true,
    message: `Account registered successfully for ${newUser.name}! You can now login.`,
    user: safeUser,
    token: `token_${newUser.id}_${Date.now()}`
  });
});

/**
 * POST /api/auth/login
 * Supports login via username (@7150name) or email, with password
 */
router.post('/login', (req, res) => {
  const { username, email, password, role } = req.body;
  const loginIdentifier = (username || email || '').trim();

  if (!loginIdentifier || !password) {
    return res.status(400).json({ success: false, message: 'Username / Email and Password are required.' });
  }

  const normId = loginIdentifier.toLowerCase();
  const normUser = normalizeUsername(loginIdentifier);

  const user = USERS_DB.find(u => {
    const matchUser = u.username && (normalizeUsername(u.username) === normUser || u.username.toLowerCase() === normId);
    const matchEmail = u.email && (u.email.toLowerCase() === normId || (u.altEmails && u.altEmails.map(e => e.toLowerCase()).includes(normId)));
    const matchPass = (u.password === password) || (u.altPasswords && u.altPasswords.includes(password));
    return (matchUser || matchEmail) && matchPass;
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Username/Email or Password. Default format: Username "@7150<name>" and Password "IT<first 4 letters>".'
    });
  }

  if (role && user.role !== role) {
    return res.status(403).json({
      success: false,
      message: `Account is registered as ${user.role.toUpperCase()}, not ${role.toUpperCase()}. Please select the correct role tab.`
    });
  }

  const { password: _, altPasswords: __, ...safeUser } = user;
  return res.status(200).json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user: safeUser,
    token: `token_${user.id}_${Date.now()}`
  });
});

/**
 * PUT /api/auth/user/:id
 * Update user profile details
 */
router.put('/user/:id', (req, res) => {
  const { id } = req.params;
  const idx = USERS_DB.findIndex(u => u.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const updates = req.body;
  delete updates.password; // Do not overwrite password directly here unless specified

  USERS_DB[idx] = {
    ...USERS_DB[idx],
    ...updates,
    id // keep id
  };

  const { password: _, altPasswords: __, ...safeUser } = USERS_DB[idx];
  return res.json({
    success: true,
    message: 'Profile details updated successfully!',
    user: safeUser
  });
});

/**
 * GET /api/auth/users
 */
router.get('/users', (req, res) => {
  const safeUsers = USERS_DB.map(({ password, altPasswords, ...u }) => u);
  return res.status(200).json({ success: true, data: safeUsers });
});

module.exports = router;
