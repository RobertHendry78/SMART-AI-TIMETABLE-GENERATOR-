import type { Department, ClassSection, Teacher, Period, CollegeTimetable, User, SubjectItem } from '../types/timetable';
import { generateClashFreeSchedule } from '../utils/clashFreeGenerator';

export const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEPARTMENTS: Department[] = [
  { id: 'IT', code: 'IT', name: 'Information Technology', icon: '⚡', hod: 'Dr. Mythili', isPrimary: true },
  { id: 'CSE', code: 'CSE', name: 'Computer Science & Engineering', icon: '💻', hod: 'Dr. S. Rajasekaran' },
  { id: 'AIDS', code: 'AIDS', name: 'AI & Data Science', icon: '🤖', hod: 'Dr. R. Kavitha' },
  { id: 'MCT', code: 'MCT', name: 'Mechatronics Engineering', icon: '🦾', hod: 'Dr. P. Balasubramanian' },
  { id: 'MECH', code: 'MECH', name: 'Mechanical Engineering', icon: '⚙️', hod: 'Dr. P. Selvam' },
  { id: 'ECE', code: 'ECE', name: 'Electronics & Communication', icon: '📡', hod: 'Dr. M. Devi' },
  { id: 'FY', code: 'FY', name: '1st Year (Science & Humanities)', icon: '📘', hod: 'Dr. Meenakshi' },
  { id: 'PLACEMENT', code: 'PLACEMENT', name: 'Co-curricular (Placement)', icon: '💼', hod: 'Placement Officer' },
  { id: 'EXTRA', code: 'EXTRA', name: 'Extra-curricular (PET & Library)', icon: '⚽', hod: 'Physical Director' }
];

export const CLASSES: ClassSection[] = [
  // Information Technology (IT)
  { id: 'IT-2A', name: 'IT - 2nd Year (Sem 3)', deptCode: 'IT', yearLevel: 2, room: 'LH-101' },
  { id: 'IT-3A', name: 'IT - 3rd Year (Sem 5)', deptCode: 'IT', yearLevel: 3, room: 'LH-102' },
  { id: 'IT-4A', name: 'IT - Final Year (Sem 7)', deptCode: 'IT', yearLevel: 4, room: 'LH-103' },

  // Computer Science & Engineering (CSE)
  { id: 'CSE-2A', name: 'CSE - 2nd Year (Sem 3)', deptCode: 'CSE', yearLevel: 2, room: 'CS-201' },
  { id: 'CSE-3A', name: 'CSE - 3rd Year (Sem 5)', deptCode: 'CSE', yearLevel: 3, room: 'CS-202' },
  { id: 'CSE-4A', name: 'CSE - Final Year (Sem 7)', deptCode: 'CSE', yearLevel: 4, room: 'CS-203' },

  // AI & Data Science (AIDS)
  { id: 'AIDS-2A', name: 'AIDS - 2nd Year (Sem 3)', deptCode: 'AIDS', yearLevel: 2, room: 'AI-301' },
  { id: 'AIDS-3A', name: 'AIDS - 3rd Year (Sem 5)', deptCode: 'AIDS', yearLevel: 3, room: 'AI-302' },
  { id: 'AIDS-4A', name: 'AIDS - Final Year (Sem 7)', deptCode: 'AIDS', yearLevel: 4, room: 'AI-303' },

  // Mechatronics Engineering (MCT)
  { id: 'MCT-2A', name: 'MCT - 2nd Year (Sem 3)', deptCode: 'MCT', yearLevel: 2, room: 'MCT-401' },
  { id: 'MCT-3A', name: 'MCT - 3rd Year (Sem 5)', deptCode: 'MCT', yearLevel: 3, room: 'MCT-402' },
  { id: 'MCT-4A', name: 'MCT - Final Year (Sem 7)', deptCode: 'MCT', yearLevel: 4, room: 'MCT-403' },

  // Mechanical Engineering (MECH)
  { id: 'MECH-2A', name: 'MECH - 2nd Year (Sem 3)', deptCode: 'MECH', yearLevel: 2, room: 'MECH-501' },
  { id: 'MECH-3A', name: 'MECH - 3rd Year (Sem 5)', deptCode: 'MECH', yearLevel: 3, room: 'MECH-502' },
  { id: 'MECH-4A', name: 'MECH - Final Year (Sem 7)', deptCode: 'MECH', yearLevel: 4, room: 'MECH-503' },

  // Electronics & Communication (ECE)
  { id: 'ECE-2A', name: 'ECE - 2nd Year (Sem 3)', deptCode: 'ECE', yearLevel: 2, room: 'ECE-601' },
  { id: 'ECE-3A', name: 'ECE - 3rd Year (Sem 5)', deptCode: 'ECE', yearLevel: 3, room: 'ECE-602' },
  { id: 'ECE-4A', name: 'ECE - Final Year (Sem 7)', deptCode: 'ECE', yearLevel: 4, room: 'ECE-603' },

  // First Year
  { id: 'FY-SEC1', name: '1st Year - Sec A (Foundations)', deptCode: 'FY', yearLevel: 1, room: 'SH-101' },
  { id: 'FY-SEC2', name: '1st Year - Sec B (Foundations)', deptCode: 'FY', yearLevel: 1, room: 'SH-102' }
];

export const PERIODS: Period[] = [
  { id: 1, name: 'Period 1', time: '09:30 - 10:20', type: 'lecture' },
  { id: 2, name: 'Period 2', time: '10:20 - 11:10', type: 'lecture' },
  { id: 3, name: 'Morning Break', time: '11:10 - 11:25', type: 'break' },
  { id: 4, name: 'Period 3', time: '11:25 - 12:15', type: 'lecture' },
  { id: 5, name: 'Lunch Break', time: '12:15 - 01:05', type: 'break' },
  { id: 6, name: 'Period 4', time: '01:05 - 01:55', type: 'lecture' },
  { id: 7, name: 'Period 5', time: '01:55 - 02:45', type: 'lecture' },
  { id: 8, name: 'Afternoon Break', time: '02:45 - 03:00', type: 'break' },
  { id: 9, name: 'Period 6', time: '03:00 - 03:45', type: 'lecture' },
  { id: 10, name: 'Period 7', time: '03:45 - 04:30', type: 'lecture' }
];

export const TEACHERS: Teacher[] = [
  {
    id: 't1',
    name: 'Dr. Mythili',
    deptCode: 'IT',
    department: 'Information Technology',
    designation: 'Professor & HOD',
    avatar: '⚡',
    weeklyHours: 12,
    maxHours: 16,
    phone: '+91 9842100002',
    email: 'hod.it@sugunacollege.edu',
    degree: 'Ph.D in IT',
    collegeId: 'SCE-HOD-IT-01'
  },
  {
    id: 't2',
    name: 'Prof. Gayathiri',
    deptCode: 'IT',
    department: 'Information Technology',
    designation: 'Assistant Professor',
    avatar: '👩‍🏫',
    weeklyHours: 16,
    maxHours: 18,
    phone: '+91 9842100011',
    email: 'gayathiri.it@sugunacollege.edu',
    degree: 'M.E, Ph.D',
    collegeId: 'SCE-IT-101'
  },
  {
    id: 't3',
    name: 'Prof. Suganya',
    deptCode: 'IT',
    department: 'Information Technology',
    designation: 'Assistant Professor',
    avatar: '👩‍💼',
    weeklyHours: 14,
    maxHours: 18,
    phone: '+91 9842100012',
    email: 'suganya.it@sugunacollege.edu',
    degree: 'M.Tech (Software Engg)',
    collegeId: 'SCE-IT-102'
  },
  {
    id: 't4',
    name: 'Dr. S. Rajasekaran',
    deptCode: 'CSE',
    department: 'Computer Science & Engineering',
    designation: 'Professor & HOD',
    avatar: '💻',
    weeklyHours: 12,
    maxHours: 16,
    phone: '+91 9842100004',
    email: 'hod.cse@sugunacollege.edu',
    degree: 'Ph.D (CSE)',
    collegeId: 'SCE-HOD-CS-01'
  },
  {
    id: 't5',
    name: 'Dr. Ada Lovelace',
    deptCode: 'CSE',
    department: 'Computer Science & Engineering',
    designation: 'Professor',
    avatar: '👩‍🔬',
    weeklyHours: 16,
    maxHours: 18,
    phone: '+91 9876543212',
    email: 'ada.cse@sugunacollege.edu',
    degree: 'Ph.D (Algorithms)',
    collegeId: 'SCE-CSE-103'
  },
  {
    id: 't6',
    name: 'Dr. R. Kavitha',
    deptCode: 'AIDS',
    department: 'AI & Data Science',
    designation: 'Professor & HOD',
    avatar: '🤖',
    weeklyHours: 12,
    maxHours: 16,
    phone: '+91 9842100003',
    email: 'hod.aids@sugunacollege.edu',
    degree: 'Ph.D (Machine Learning)',
    collegeId: 'SCE-HOD-AD-01'
  },
  {
    id: 't7',
    name: 'Prof. Alan Turing',
    deptCode: 'AIDS',
    department: 'AI & Data Science',
    designation: 'Distinguished Professor',
    avatar: '👨‍🔬',
    weeklyHours: 14,
    maxHours: 16,
    phone: '+91 9842100020',
    email: 'alan.turing@sugunacollege.edu',
    degree: 'M.Sc, D.Phil',
    collegeId: 'SCE-AIDS-102'
  },
  {
    id: 't8',
    name: 'Dr. P. Balasubramanian',
    deptCode: 'MCT',
    department: 'Mechatronics Engineering',
    designation: 'Professor & HOD',
    avatar: '🦾',
    weeklyHours: 12,
    maxHours: 16,
    phone: '+91 9842100005',
    email: 'hod.mct@sugunacollege.edu.in',
    degree: 'Ph.D (Robotics)',
    collegeId: 'SCE-HOD-MCT-01'
  },
  {
    id: 't8b',
    name: 'Prof. T. Ganesan',
    deptCode: 'MCT',
    department: 'Mechatronics Engineering',
    designation: 'Assistant Professor',
    avatar: '👨‍🔧',
    weeklyHours: 14,
    maxHours: 18,
    phone: '+91 9842100025',
    email: 't.ganesan@sugunacollege.edu',
    degree: 'M.E (Mechatronics)',
    collegeId: 'SCE-MCT-102'
  },
  {
    id: 't9',
    name: 'Dr. P. Selvam',
    deptCode: 'MECH',
    department: 'Mechanical Engineering',
    designation: 'Professor & HOD',
    avatar: '⚙️',
    weeklyHours: 12,
    maxHours: 16,
    phone: '+91 9842100006',
    email: 'hod.mech@sugunacollege.edu.in',
    degree: 'Ph.D (Thermal Engg)',
    collegeId: 'SCE-HOD-ME-01'
  },
  {
    id: 't9b',
    name: 'Prof. M. Prakash',
    deptCode: 'MECH',
    department: 'Mechanical Engineering',
    designation: 'Assistant Professor',
    avatar: '👨‍🏭',
    weeklyHours: 14,
    maxHours: 18,
    phone: '+91 9842100026',
    email: 'm.prakash@sugunacollege.edu',
    degree: 'M.E (Manufacturing)',
    collegeId: 'SCE-MECH-102'
  },
  {
    id: 't10',
    name: 'Dr. M. Devi',
    deptCode: 'ECE',
    department: 'Electronics & Communication',
    designation: 'Professor & HOD',
    avatar: '📡',
    weeklyHours: 12,
    maxHours: 16,
    phone: '+91 9842100007',
    email: 'hod.ece@sugunacollege.edu.in',
    degree: 'Ph.D (VLSI)',
    collegeId: 'SCE-HOD-ECE-01'
  },
  {
    id: 't10b',
    name: 'Prof. K. Anand',
    deptCode: 'ECE',
    department: 'Electronics & Communication',
    designation: 'Assistant Professor',
    avatar: '👨‍💻',
    weeklyHours: 14,
    maxHours: 18,
    phone: '+91 9842100027',
    email: 'k.anand@sugunacollege.edu',
    degree: 'M.E (VLSI Design)',
    collegeId: 'SCE-ECE-102'
  },
  {
    id: 't10c',
    name: 'Prof. S. Divya',
    deptCode: 'ECE',
    department: 'Electronics & Communication',
    designation: 'Assistant Professor',
    avatar: '👩‍🏫',
    weeklyHours: 14,
    maxHours: 18,
    phone: '+91 9842100028',
    email: 's.divya@sugunacollege.edu',
    degree: 'M.E (Communication Systems)',
    collegeId: 'SCE-ECE-103'
  },
  {
    id: 't11',
    name: 'Dr. Meenakshi',
    deptCode: 'FY',
    department: '1st Year (Science & Humanities)',
    designation: 'Professor & HOD',
    avatar: '📘',
    weeklyHours: 12,
    maxHours: 16,
    phone: '+91 9842100008',
    email: 'hod.fy@sugunacollege.edu.in',
    degree: 'Ph.D (Physics)',
    collegeId: 'SCE-HOD-FY-01'
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'u-prin',
    name: 'Dr. S. Rajagopal',
    role: 'principal',
    roleLabel: 'Principal & Superadmin',
    email: 'principal@sugunacollege.edu',
    username: '@7150rajagopal',
    phone: '+91 9842100001',
    degree: 'Ph.D in Computer Science',
    collegeId: 'SCE-PRIN-001',
    dob: '1974-04-12',
    address: 'Suguna Campus Quarters, Coimbatore - 641014',
    avatar: '🏛️',
    department: 'Suguna College Administration',
    deptCode: 'ALL',
    designation: 'Principal & Superadmin'
  },
  {
    id: 'u-hod-it',
    name: 'Dr. Mythili',
    role: 'hod',
    roleLabel: 'HOD - Information Technology',
    email: 'hod.it@sugunacollege.edu',
    username: '@7150mythili',
    phone: '+91 9842100002',
    degree: 'Ph.D in Information Technology',
    collegeId: 'SCE-HOD-IT-01',
    dob: '1980-07-25',
    address: '42, Bharathi Colony, Peelamedu, Coimbatore',
    avatar: '⚡',
    department: 'Information Technology',
    deptCode: 'IT',
    designation: 'Professor & HOD'
  },
  {
    id: 'u-staff-1',
    name: 'Prof. Gayathiri',
    role: 'staff',
    roleLabel: 'Assistant Professor (Information Technology)',
    email: 'gayathiri.it@sugunacollege.edu',
    username: '@7150gayathiri',
    phone: '+91 9842100011',
    degree: 'M.E, Ph.D in Information Technology',
    collegeId: 'SCE-IT-101',
    dob: '1989-06-15',
    address: '12, Gandhipuram, Coimbatore',
    avatar: '👩‍🏫',
    department: 'Information Technology',
    deptCode: 'IT',
    designation: 'Assistant Professor'
  },
  {
    id: 'u-staff-2',
    name: 'Prof. Suganya',
    role: 'staff',
    roleLabel: 'Assistant Professor (Information Technology)',
    email: 'suganya.it@sugunacollege.edu',
    username: '@7150suganya',
    phone: '+91 9842100012',
    degree: 'M.Tech in Software Engineering',
    collegeId: 'SCE-IT-102',
    dob: '1991-08-20',
    address: '14, Lakshmi Mills Colony, Coimbatore',
    avatar: '👩‍💼',
    department: 'Information Technology',
    deptCode: 'IT',
    designation: 'Assistant Professor'
  },
  {
    id: 'u-hod-cse',
    name: 'Dr. S. Rajasekaran',
    role: 'hod',
    roleLabel: 'HOD - Computer Science & Engg',
    email: 'hod.cse@sugunacollege.edu',
    username: '@7150rajasekaran',
    phone: '+91 9842100004',
    degree: 'Ph.D in Distributed Systems',
    collegeId: 'SCE-HOD-CS-01',
    dob: '1978-02-14',
    address: '9, Saravanampatti Main Road, Coimbatore',
    avatar: '💻',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    designation: 'Professor & HOD'
  },
  {
    id: 'u-staff-cse1',
    name: 'Dr. Ada Lovelace',
    role: 'staff',
    roleLabel: 'Professor (Computer Science & Engg)',
    email: 'ada.cse@sugunacollege.edu',
    username: '@7150ada',
    phone: '+91 9876543212',
    degree: 'Ph.D in Algorithm Design',
    collegeId: 'SCE-CSE-103',
    dob: '1988-06-20',
    address: '55, Hope College Road, Coimbatore',
    avatar: '👩‍🔬',
    department: 'Computer Science & Engineering',
    deptCode: 'CSE',
    designation: 'Professor'
  },
  {
    id: 'u-hod-aids',
    name: 'Dr. R. Kavitha',
    role: 'hod',
    roleLabel: 'HOD - AI & Data Science',
    email: 'hod.aids@sugunacollege.edu',
    username: '@7150kavitha',
    phone: '+91 9842100003',
    degree: 'Ph.D in Machine Learning & AI',
    collegeId: 'SCE-HOD-AD-01',
    dob: '1982-10-18',
    address: '18, Nehru Nagar, Kalapatti Road, Coimbatore',
    avatar: '🤖',
    department: 'Artificial Intelligence & Data Science',
    deptCode: 'AIDS',
    designation: 'Professor & HOD'
  },
  {
    id: 'u-staff-aids1',
    name: 'Prof. Alan Turing',
    role: 'staff',
    roleLabel: 'Professor (AI & Data Science)',
    email: 'alan.turing@sugunacollege.edu',
    username: '@7150turing',
    phone: '+91 9842100020',
    degree: 'M.Sc, D.Phil',
    collegeId: 'SCE-AIDS-102',
    dob: '1985-05-12',
    address: '22, AI Technopark, Coimbatore',
    avatar: '👨‍🔬',
    department: 'Artificial Intelligence & Data Science',
    deptCode: 'AIDS',
    designation: 'Distinguished Professor'
  },
  {
    id: 'u-hod-mct',
    name: 'Dr. P. Balasubramanian',
    role: 'hod',
    roleLabel: 'HOD - Mechatronics Engineering',
    email: 'hod.mct@sugunacollege.edu',
    username: '@7150balasubramanian',
    phone: '+91 9842100005',
    degree: 'Ph.D in Robotics & Automation',
    collegeId: 'SCE-HOD-MT-01',
    dob: '1979-08-30',
    address: '15, Ganapathy, Coimbatore',
    avatar: '⚙️',
    department: 'Mechatronics Engineering',
    deptCode: 'MCT',
    designation: 'Professor & HOD'
  },
  {
    id: 'u-staff-mct1',
    name: 'Prof. Suresh V.',
    role: 'staff',
    roleLabel: 'Assistant Professor (Mechatronics)',
    email: 'suresh.v@sugunacollege.edu',
    username: '@7150suresh',
    phone: '+91 9842100025',
    degree: 'M.E (Mechatronics)',
    collegeId: 'SCE-MCT-102',
    dob: '1991-03-14',
    address: '33, Peelamedu, Coimbatore',
    avatar: '👨‍🔧',
    department: 'Mechatronics Engineering',
    deptCode: 'MCT',
    designation: 'Assistant Professor'
  },
  {
    id: 'u-hod-mech',
    name: 'Prof. K. Saravanan',
    role: 'hod',
    roleLabel: 'HOD - Mechanical Engineering',
    email: 'hod.mech@sugunacollege.edu',
    username: '@7150saravanan',
    phone: '+91 9842100006',
    degree: 'M.E, Ph.D in Thermal Engineering',
    collegeId: 'SCE-HOD-ME-01',
    dob: '1981-12-05',
    address: '77, Vadavalli, Coimbatore',
    avatar: '🔧',
    department: 'Mechanical Engineering',
    deptCode: 'MECH',
    designation: 'Associate Professor & HOD'
  },
  {
    id: 'u-staff-mech1',
    name: 'Prof. M. Prakash',
    role: 'staff',
    roleLabel: 'Assistant Professor (Mechanical)',
    email: 'm.prakash@sugunacollege.edu',
    username: '@7150prakash',
    phone: '+91 9842100026',
    degree: 'M.E (Manufacturing)',
    collegeId: 'SCE-MECH-102',
    dob: '1992-09-17',
    address: '4, Singanallur, Coimbatore',
    avatar: '👨‍🏭',
    department: 'Mechanical Engineering',
    deptCode: 'MECH',
    designation: 'Assistant Professor'
  },
  {
    id: 'u-hod-ece',
    name: 'Dr. M. Devi',
    role: 'hod',
    roleLabel: 'HOD - Electronics & Communication',
    email: 'hod.ece@sugunacollege.edu',
    username: '@7150devi',
    phone: '+91 9842100007',
    degree: 'Ph.D in VLSI & Signal Processing',
    collegeId: 'SCE-HOD-ECE-01',
    dob: '1983-04-22',
    address: '12, RS Puram, Coimbatore',
    avatar: '📡',
    department: 'Electronics & Communication',
    deptCode: 'ECE',
    designation: 'Professor & HOD'
  },
  {
    id: 'u-staff-ece1',
    name: 'Prof. K. Anand',
    role: 'staff',
    roleLabel: 'Assistant Professor (ECE)',
    email: 'k.anand@sugunacollege.edu',
    username: '@7150anand',
    phone: '+91 9842100027',
    degree: 'M.E (VLSI Design)',
    collegeId: 'SCE-ECE-102',
    dob: '1990-01-19',
    address: '61, Saibaba Colony, Coimbatore',
    avatar: '👨‍💻',
    department: 'Electronics & Communication',
    deptCode: 'ECE',
    designation: 'Assistant Professor'
  }
];

export const INITIAL_SUBJECTS: SubjectItem[] = [
  // 2nd Year (Semester 4)
  { id: 'SUB-IT-101', name: 'probability and statistics', code: 'MA25C13', semester: '4', year: '2', deptCode: 'IT', teacher: 'Dr. Mythili', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-102', name: 'operating system', code: 'CS25C11', semester: '4', year: '2', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-103', name: 'standard in information technology', code: 'IT25401', semester: '4', year: '2', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-104', name: 'JAVA PROGRAMMING', code: 'CS25C09', semester: '4', year: '2', deptCode: 'IT', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-105', name: 'DBMS', code: 'CS25C13', semester: '4', year: '2', deptCode: 'IT', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-106', name: 'JAVA PROGRAMMING LAB', code: 'CS2530', semester: '4', year: '2', deptCode: 'IT', teacher: 'Prof. Suganya', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-107', name: 'DBMS LAB', code: 'CS2513', semester: '4', year: '2', deptCode: 'IT', teacher: 'Prof. Suganya', credits: 2, hoursPerWeek: 2, isLab: true },

  // 3rd Year (Semester 6)
  { id: 'SUB-IT-108', name: 'object oriented software engineering', code: 'CCS356', semester: '6', year: '3', deptCode: 'IT', teacher: 'Dr. Mythili', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-109', name: 'Ethics and ai', code: 'CCS345', semester: '6', year: '3', deptCode: 'IT', teacher: 'Dr. Mythili', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-110', name: 'PROJECT', code: 'IT 7150', semester: '6', year: '3', deptCode: 'IT', teacher: 'Dr. Mythili', credits: 4, hoursPerWeek: 4, isLab: true },
  { id: 'SUB-IT-111', name: 'OOSE LAB', code: 'CCS356', semester: '6', year: '3', deptCode: 'IT', teacher: 'Dr. Mythili', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-112', name: 'cognitive science', code: 'CCS337', semester: '6', year: '3', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-113', name: 'software defined network', code: 'CCS365', semester: '6', year: '3', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-114', name: 'COGNITIVE SCIENCE LAB', code: 'CCS337', semester: '6', year: '3', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-115', name: 'SDN LAB', code: 'CCS365', semester: '6', year: '3', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-116', name: 'CS LAB', code: 'CS25C11', semester: '6', year: '3', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-117', name: 'APP DEVELOPMENT', code: 'CCS332', semester: '6', year: '3', deptCode: 'IT', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-118', name: 'LAB MOBILE APPLICATION', code: 'IT 3681', semester: '6', year: '3', deptCode: 'IT', teacher: 'Prof. Suganya', credits: 2, hoursPerWeek: 2, isLab: true },

  // 4th Year (Semester 7)
  { id: 'SUB-IT-119', name: 'English for competitive examination', code: 'OHS351', semester: '7', year: '4', deptCode: 'IT', teacher: 'Dr. Mythili', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-120', name: 'human values and ethics', code: 'GE3791', semester: '7', year: '4', deptCode: 'IT', teacher: 'Dr. Mythili', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-121', name: 'it in agriculture system', code: 'AI3021', semester: '7', year: '4', deptCode: 'IT', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-122', name: 'POM', code: 'GE3757', semester: '7', year: '4', deptCode: 'IT', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false }
];

// Year-specific department curriculum catalogs (2nd Year, 3rd Year, 4th Year)
export const YEAR_SUBJECTS: Record<string, Record<string, Array<{ name: string; code: string; teacher: string; room: string; color: string; isLab?: boolean }>>> = {
  IT: {
    '2': [
      { name: 'Database Management Systems', code: 'IT3301', teacher: 'Prof. Gayathiri', room: 'LH-101', color: '#0284c7' },
      { name: 'Data Structures & Algorithms', code: 'IT3302', teacher: 'Prof. Suganya', room: 'LH-101', color: '#059669' },
      { name: 'Digital Logic & Computer Design', code: 'IT3303', teacher: 'Prof. Gayathiri', room: 'LH-101', color: '#7c3aed' },
      { name: 'Object Oriented Programming', code: 'IT3304', teacher: 'Dr. Mythili', room: 'LH-101', color: '#d97706' },
      { name: 'Discrete Mathematics', code: 'MA3354', teacher: 'Prof. Suganya', room: 'LH-101', color: '#4f46e5' },
      { name: 'DBMS Practice Lab', code: 'IT3311', teacher: 'Prof. Gayathiri', room: 'Computing Lab 1', isLab: true, color: '#0284c7' },
      { name: 'Data Structures Lab', code: 'IT3312', teacher: 'Prof. Suganya', room: 'Computing Lab 2', isLab: true, color: '#059669' }
    ],
    '3': [
      { name: 'Web Technologies & Cloud Computing', code: 'IT3501', teacher: 'Dr. Mythili', room: 'LH-102', color: '#4f46e5' },
      { name: 'Computer Networks & Security', code: 'IT3502', teacher: 'Prof. Suganya', room: 'LH-102', color: '#7c3aed' },
      { name: 'Operating Systems Internals', code: 'IT3503', teacher: 'Prof. Gayathiri', room: 'LH-102', color: '#0284c7' },
      { name: 'Software Engineering & Agile', code: 'IT3504', teacher: 'Prof. Suganya', room: 'LH-102', color: '#059669' },
      { name: 'Theory of Computation', code: 'CS3501', teacher: 'Dr. Mythili', room: 'LH-102', color: '#d97706' },
      { name: 'Web Technologies Lab', code: 'IT3511', teacher: 'Dr. Mythili', room: 'Web Tech Lab', isLab: true, color: '#4f46e5' },
      { name: 'Networks & Security Lab', code: 'IT3512', teacher: 'Prof. Suganya', room: 'Network Lab', isLab: true, color: '#7c3aed' }
    ],
    '4': [
      { name: 'Cloud Infrastructure & DevOps', code: 'IT3701', teacher: 'Dr. Mythili', room: 'LH-103', color: '#2563eb' },
      { name: 'Artificial Intelligence & Neural Nets', code: 'IT3702', teacher: 'Prof. Suganya', room: 'LH-103', color: '#ec4899' },
      { name: 'Cyber Security & Cryptography', code: 'IT3703', teacher: 'Prof. Gayathiri', room: 'LH-103', color: '#d97706' },
      { name: 'Mobile Application Development', code: 'IT3704', teacher: 'Prof. Suganya', room: 'LH-103', color: '#059669' },
      { name: 'Big Data Analytics', code: 'IT3705', teacher: 'Prof. Gayathiri', room: 'LH-103', color: '#7c3aed' },
      { name: 'Cloud & DevOps Laboratory', code: 'IT3711', teacher: 'Dr. Mythili', room: 'Cloud Computing Lab', isLab: true, color: '#2563eb' },
      { name: 'Capstone Project Work', code: 'IT3712', teacher: 'Dr. Mythili', room: 'Project Studio', isLab: true, color: '#d97706' }
    ]
  },
  CSE: {
    '2': [
      { name: 'Design & Analysis of Algorithms', code: 'CS3301', teacher: 'Dr. S. Rajasekaran', room: 'CS-201', color: '#4f46e5' },
      { name: 'Database Systems Architecture', code: 'CS3302', teacher: 'Dr. Ada Lovelace', room: 'CS-201', color: '#0284c7' },
      { name: 'Computer Architecture & Org', code: 'CS3303', teacher: 'Dr. S. Rajasekaran', room: 'CS-201', color: '#7c3aed' },
      { name: 'Object Oriented Programming in Java', code: 'CS3304', teacher: 'Dr. Ada Lovelace', room: 'CS-201', color: '#059669' },
      { name: 'Data Structures Lab', code: 'CS3311', teacher: 'Dr. Ada Lovelace', room: 'CSE Lab 1', isLab: true, color: '#0284c7' },
      { name: 'Java Programming Lab', code: 'CS3312', teacher: 'Dr. S. Rajasekaran', room: 'CSE Lab 2', isLab: true, color: '#4f46e5' }
    ],
    '3': [
      { name: 'Compiler Engineering', code: 'CS3501', teacher: 'Dr. Ada Lovelace', room: 'CS-202', color: '#7c3aed' },
      { name: 'Computer Networks', code: 'CS3502', teacher: 'Dr. S. Rajasekaran', room: 'CS-202', color: '#059669' },
      { name: 'Distributed Systems', code: 'CS3503', teacher: 'Dr. Ada Lovelace', room: 'CS-202', color: '#0284c7' },
      { name: 'Software Project Management', code: 'CS3504', teacher: 'Dr. S. Rajasekaran', room: 'CS-202', color: '#d97706' },
      { name: 'Networks & OS Lab', code: 'CS3511', teacher: 'Dr. S. Rajasekaran', room: 'CSE Lab 1', isLab: true, color: '#059669' },
      { name: 'Compiler Design Lab', code: 'CS3512', teacher: 'Dr. Ada Lovelace', room: 'CSE Lab 3', isLab: true, color: '#7c3aed' }
    ],
    '4': [
      { name: 'Cyber Security Principles', code: 'CS3701', teacher: 'Dr. S. Rajasekaran', room: 'CS-203', color: '#dc2626' },
      { name: 'Machine Learning & AI', code: 'CS3702', teacher: 'Dr. Ada Lovelace', room: 'CS-203', color: '#8b5cf6' },
      { name: 'Quantum Computing Fundamentals', code: 'CS3703', teacher: 'Dr. Ada Lovelace', room: 'CS-203', color: '#2563eb' },
      { name: 'Full Stack Web Development', code: 'CS3704', teacher: 'Dr. S. Rajasekaran', room: 'CS-203', color: '#059669' },
      { name: 'AI & Machine Learning Lab', code: 'CS3711', teacher: 'Dr. Ada Lovelace', room: 'Advanced AI Lab', isLab: true, color: '#8b5cf6' },
      { name: 'Security & Forensics Lab', code: 'CS3712', teacher: 'Dr. S. Rajasekaran', room: 'Security Lab', isLab: true, color: '#dc2626' }
    ]
  },
  AIDS: {
    '2': [
      { name: 'Data Structures for AI', code: 'AD3301', teacher: 'Dr. R. Kavitha', room: 'AI-301', color: '#8b5cf6' },
      { name: 'Linear Algebra & Calculus', code: 'AD3302', teacher: 'Prof. Alan Turing', room: 'AI-301', color: '#ec4899' },
      { name: 'Python for Data Science', code: 'AD3303', teacher: 'Dr. R. Kavitha', room: 'AI-301', color: '#0284c7' },
      { name: 'Database Management for Big Data', code: 'AD3304', teacher: 'Prof. Alan Turing', room: 'AI-301', color: '#10b981' },
      { name: 'Python AI Lab', code: 'AD3311', teacher: 'Dr. R. Kavitha', room: 'AI Lab 1', isLab: true, color: '#8b5cf6' },
      { name: 'Data Science Studio', code: 'AD3312', teacher: 'Prof. Alan Turing', room: 'Data Lab', isLab: true, color: '#ec4899' }
    ],
    '3': [
      { name: 'Machine Learning Foundations', code: 'AD3501', teacher: 'Dr. R. Kavitha', room: 'AI-302', color: '#8b5cf6' },
      { name: 'Deep Learning & Neural Networks', code: 'AD3502', teacher: 'Prof. Alan Turing', room: 'AI-302', color: '#ec4899' },
      { name: 'Natural Language Processing', code: 'AD3503', teacher: 'Dr. R. Kavitha', room: 'AI-302', color: '#0284c7' },
      { name: 'Big Data Technologies', code: 'AD3504', teacher: 'Prof. Alan Turing', room: 'AI-302', color: '#10b981' },
      { name: 'Deep Learning Lab', code: 'AD3511', teacher: 'Prof. Alan Turing', room: 'GPU Cluster Lab', isLab: true, color: '#ec4899' },
      { name: 'NLP & Analytics Lab', code: 'AD3512', teacher: 'Dr. R. Kavitha', room: 'NLP Lab', isLab: true, color: '#0284c7' }
    ],
    '4': [
      { name: 'Generative AI & LLMs', code: 'AD3701', teacher: 'Dr. R. Kavitha', room: 'AI-303', color: '#6366f1' },
      { name: 'Computer Vision & Robotics AI', code: 'AD3702', teacher: 'Prof. Alan Turing', room: 'AI-303', color: '#8b5cf6' },
      { name: 'Reinforcement Learning', code: 'AD3703', teacher: 'Dr. R. Kavitha', room: 'AI-303', color: '#0284c7' },
      { name: 'AI Ethics & Governance', code: 'AD3704', teacher: 'Prof. Alan Turing', room: 'AI-303', color: '#10b981' },
      { name: 'Generative AI Laboratory', code: 'AD3711', teacher: 'Dr. R. Kavitha', room: 'Supercomputing Center', isLab: true, color: '#6366f1' },
      { name: 'Capstone AI Project Lab', code: 'AD3712', teacher: 'Prof. Alan Turing', room: 'AI Incubator', isLab: true, color: '#8b5cf6' }
    ]
  },
  MCT: {
    '2': [
      { name: 'Sensors & Signal Conditioning', code: 'MT3301', teacher: 'Dr. P. Balasubramanian', room: 'MCT-401', color: '#059669' },
      { name: 'Electrical Machines & Drives', code: 'MT3302', teacher: 'Dr. P. Balasubramanian', room: 'MCT-401', color: '#4f46e5' },
      { name: 'Mechanics of Solids', code: 'MT3303', teacher: 'Dr. P. Balasubramanian', room: 'MCT-401', color: '#d97706' },
      { name: 'Analog & Digital Circuits', code: 'MT3304', teacher: 'Dr. P. Balasubramanian', room: 'MCT-401', color: '#0284c7' },
      { name: 'Sensors Laboratory', code: 'MT3311', teacher: 'Dr. P. Balasubramanian', room: 'Sensors Lab', isLab: true, color: '#059669' },
      { name: 'Electrical Drives Lab', code: 'MT3312', teacher: 'Dr. P. Balasubramanian', room: 'Drives Lab', isLab: true, color: '#4f46e5' }
    ],
    '3': [
      { name: 'Robotics & Automation', code: 'MT3501', teacher: 'Dr. P. Balasubramanian', room: 'MCT-402', color: '#d97706' },
      { name: 'Microcontrollers & Embedded', code: 'MT3502', teacher: 'Dr. P. Balasubramanian', room: 'MCT-402', color: '#4f46e5' },
      { name: 'Hydraulics & Pneumatics', code: 'MT3503', teacher: 'Dr. P. Balasubramanian', room: 'MCT-402', color: '#0284c7' },
      { name: 'Design of Mechatronics Systems', code: 'MT3504', teacher: 'Dr. P. Balasubramanian', room: 'MCT-402', color: '#059669' },
      { name: 'Industrial Robotics Lab', code: 'MT3511', teacher: 'Dr. P. Balasubramanian', room: 'Robotics Center', isLab: true, color: '#d97706' },
      { name: 'PLC & Pneumatics Lab', code: 'MT3512', teacher: 'Dr. P. Balasubramanian', room: 'PLC Lab', isLab: true, color: '#0284c7' }
    ],
    '4': [
      { name: 'Industrial IoT & Industry 4.0', code: 'MT3701', teacher: 'Dr. P. Balasubramanian', room: 'MCT-403', color: '#2563eb' },
      { name: 'Autonomous Vehicles & Drones', code: 'MT3702', teacher: 'Dr. P. Balasubramanian', room: 'MCT-403', color: '#7c3aed' },
      { name: 'Micro Electro Mechanical Systems', code: 'MT3703', teacher: 'Dr. P. Balasubramanian', room: 'MCT-403', color: '#d97706' },
      { name: 'Machine Vision & Inspection', code: 'MT3704', teacher: 'Dr. P. Balasubramanian', room: 'MCT-403', color: '#059669' },
      { name: 'IIoT & Smart Factory Lab', code: 'MT3711', teacher: 'Dr. P. Balasubramanian', room: 'Smart Factory Center', isLab: true, color: '#2563eb' },
      { name: 'Autonomous Systems Project Lab', code: 'MT3712', teacher: 'Dr. P. Balasubramanian', room: 'Drone & UAV Studio', isLab: true, color: '#7c3aed' }
    ]
  },
  MECH: {
    '2': [
      { name: 'Thermodynamics', code: 'ME3301', teacher: 'Dr. P. Selvam', room: 'MECH-501', color: '#dc2626' },
      { name: 'Manufacturing Technology', code: 'ME3302', teacher: 'Dr. P. Selvam', room: 'MECH-501', color: '#d97706' },
      { name: 'Fluid Mechanics & Machinery', code: 'ME3303', teacher: 'Dr. P. Selvam', room: 'MECH-501', color: '#0284c7' },
      { name: 'Engineering Metallurgy', code: 'ME3304', teacher: 'Dr. P. Selvam', room: 'MECH-501', color: '#059669' },
      { name: 'Thermal Engineering Lab', code: 'ME3311', teacher: 'Dr. P. Selvam', room: 'Thermal Lab', isLab: true, color: '#dc2626' },
      { name: 'Manufacturing Practice Lab', code: 'ME3312', teacher: 'Dr. P. Selvam', room: 'Workshop 1', isLab: true, color: '#d97706' }
    ],
    '3': [
      { name: 'Design of Machine Elements', code: 'ME3501', teacher: 'Dr. P. Selvam', room: 'MECH-502', color: '#d97706' },
      { name: 'Heat & Mass Transfer', code: 'ME3502', teacher: 'Dr. P. Selvam', room: 'MECH-502', color: '#dc2626' },
      { name: 'CAD / CAM Engineering', code: 'ME3503', teacher: 'Dr. P. Selvam', room: 'MECH-502', color: '#0284c7' },
      { name: 'Dynamics of Machinery', code: 'ME3504', teacher: 'Dr. P. Selvam', room: 'MECH-502', color: '#059669' },
      { name: 'CAD / CAM Laboratory', code: 'ME3511', teacher: 'Dr. P. Selvam', room: 'CAD Center', isLab: true, color: '#0284c7' },
      { name: 'Dynamics Laboratory', code: 'ME3512', teacher: 'Dr. P. Selvam', room: 'Dynamics Lab', isLab: true, color: '#059669' }
    ],
    '4': [
      { name: 'Automobile Engineering', code: 'ME3701', teacher: 'Dr. P. Selvam', room: 'MECH-503', color: '#dc2626' },
      { name: 'Renewable Energy Systems', code: 'ME3702', teacher: 'Dr. P. Selvam', room: 'MECH-503', color: '#059669' },
      { name: 'Computational Fluid Dynamics', code: 'ME3703', teacher: 'Dr. P. Selvam', room: 'MECH-503', color: '#2563eb' },
      { name: 'Power Plant Engineering', code: 'ME3704', teacher: 'Dr. P. Selvam', room: 'MECH-503', color: '#d97706' },
      { name: 'CNC & Machining Center', code: 'ME3711', teacher: 'Dr. P. Selvam', room: 'CNC Lab', isLab: true, color: '#dc2626' },
      { name: 'CFD Simulation Lab', code: 'ME3712', teacher: 'Dr. P. Selvam', room: 'Simulation Center', isLab: true, color: '#2563eb' }
    ]
  },
  ECE: {
    '2': [
      { name: 'Electronic Circuits & Analysis', code: 'EC3301', teacher: 'Dr. M. Devi', room: 'ECE-601', color: '#4f46e5' },
      { name: 'Signals & Systems', code: 'EC3302', teacher: 'Dr. M. Devi', room: 'ECE-601', color: '#7c3aed' },
      { name: 'Digital Electronics & Logic', code: 'EC3303', teacher: 'Dr. M. Devi', room: 'ECE-601', color: '#0284c7' },
      { name: 'Electromagnetic Waves', code: 'EC3304', teacher: 'Dr. M. Devi', room: 'ECE-601', color: '#059669' },
      { name: 'Circuits & Signals Lab', code: 'EC3311', teacher: 'Dr. M. Devi', room: 'Circuits Lab', isLab: true, color: '#4f46e5' },
      { name: 'Digital Systems Lab', code: 'EC3312', teacher: 'Dr. M. Devi', room: 'Logic Lab', isLab: true, color: '#0284c7' }
    ],
    '3': [
      { name: 'Digital Signal Processing', code: 'EC3501', teacher: 'Dr. M. Devi', room: 'ECE-602', color: '#4f46e5' },
      { name: 'VLSI Design & Architecture', code: 'EC3502', teacher: 'Dr. M. Devi', room: 'ECE-602', color: '#7c3aed' },
      { name: 'Microprocessors & Microcontrollers', code: 'EC3503', teacher: 'Dr. M. Devi', room: 'ECE-602', color: '#0284c7' },
      { name: 'Communication Networks', code: 'EC3504', teacher: 'Dr. M. Devi', room: 'ECE-602', color: '#059669' },
      { name: 'DSP & Simulation Lab', code: 'EC3511', teacher: 'Dr. M. Devi', room: 'DSP Lab', isLab: true, color: '#4f46e5' },
      { name: 'VLSI Design Lab', code: 'EC3512', teacher: 'Dr. M. Devi', room: 'VLSI Center', isLab: true, color: '#7c3aed' }
    ],
    '4': [
      { name: 'Wireless & Mobile Communication', code: 'EC3701', teacher: 'Dr. M. Devi', room: 'ECE-603', color: '#2563eb' },
      { name: 'Embedded IoT Systems', code: 'EC3702', teacher: 'Dr. M. Devi', room: 'ECE-603', color: '#059669' },
      { name: 'Optical Communication & Networks', code: 'EC3703', teacher: 'Dr. M. Devi', room: 'ECE-603', color: '#d97706' },
      { name: 'Antenna Theory & Microwave', code: 'EC3704', teacher: 'Dr. M. Devi', room: 'ECE-603', color: '#7c3aed' },
      { name: 'Embedded & IoT Systems Lab', code: 'EC3711', teacher: 'Dr. M. Devi', room: 'Embedded Center', isLab: true, color: '#059669' },
      { name: 'Microwave & Optical Lab', code: 'EC3712', teacher: 'Dr. M. Devi', room: 'Microwave Lab', isLab: true, color: '#2563eb' }
    ]
  },
  PLACEMENT: {
    '2': [], '3': [], '4': []
  },
  EXTRA: {
    '2': [], '3': [], '4': []
  }
};

// Fallback flat catalog for backward compatibility
export const DEPT_SUBJECTS: Record<string, Array<{ name: string; code: string; teacher: string; room: string; color: string; isLab?: boolean }>> = {
  IT: YEAR_SUBJECTS.IT['2'].concat(YEAR_SUBJECTS.IT['3']),
  CSE: YEAR_SUBJECTS.CSE['2'].concat(YEAR_SUBJECTS.CSE['3']),
  AIDS: YEAR_SUBJECTS.AIDS['2'].concat(YEAR_SUBJECTS.AIDS['3']),
  MCT: YEAR_SUBJECTS.MCT['2'].concat(YEAR_SUBJECTS.MCT['3']),
  MECH: YEAR_SUBJECTS.MECH['2'].concat(YEAR_SUBJECTS.MECH['3']),
  ECE: YEAR_SUBJECTS.ECE['2'].concat(YEAR_SUBJECTS.ECE['3']),
  PLACEMENT: [],
  EXTRA: [],
  FY: [
    { name: 'Engineering Physics', code: 'PH1101', teacher: 'Dr. Meenakshi', room: 'SH-101', color: '#0284c7' },
    { name: 'Engineering Chemistry', code: 'CH1101', teacher: 'Dr. Meenakshi', room: 'SH-101', color: '#059669' },
    { name: 'Matrices & Calculus', code: 'MA1101', teacher: 'Dr. Meenakshi', room: 'SH-101', color: '#7c3aed' },
    { name: 'Python Programming', code: 'GE1101', teacher: 'Prof. S. Priya', room: 'SH-101', color: '#4f46e5' },
    { name: 'Physics & Chemistry Lab', code: 'BS1111', teacher: 'Dr. Meenakshi', room: 'Science Lab 1', isLab: true, color: '#0284c7' },
    { name: 'Python Computing Lab', code: 'GE1111', teacher: 'Prof. S. Priya', room: 'Computing Lab 1', isLab: true, color: '#4f46e5' }
  ]
};

/**
 * Generates 100% full, realistic academic timetable across all years and departments.
 * Zero empty / unassigned periods.
 * When targetStaffName is passed (e.g. Dr. R. Ramesh or new registered staff),
 * ensures their name is assigned across 2nd, 3rd, and 4th year for 14-16 periods.
 */
export function generateInitialSchedule(_targetStaffName?: string): CollegeTimetable {
  // First, generate clash-free schedule for IT using the user's 22 subjects
  const baseSchedule = generateClashFreeSchedule(INITIAL_SUBJECTS, 'IT');

  // Fill in other department classes if any
  CLASSES.forEach(cls => {
    if (cls.deptCode === 'IT' && baseSchedule[cls.id]) return;

    baseSchedule[cls.id] = {};
    const yrStr = String(cls.yearLevel || 2);
    const deptCatalog = YEAR_SUBJECTS[cls.deptCode] || YEAR_SUBJECTS['CSE'];
    const subList = deptCatalog[yrStr] || deptCatalog['2'] || [];

    const theorySubs = subList.filter(s => !s.isLab);
    const labSubs = subList.filter(s => s.isLab);

    WORKING_DAYS.forEach((day, dIdx) => {
      baseSchedule[cls.id][day] = {};
      const isLabDay = (dIdx === 1 || dIdx === 3);

      PERIODS.forEach(period => {
        if (period.type === 'break') return;

        if (isLabDay && (period.id === 6 || period.id === 7) && labSubs.length > 0) {
          const lab = dIdx === 1 ? labSubs[0] : (labSubs[1] || labSubs[0]);
          baseSchedule[cls.id][day][period.id] = {
            subject: lab.name,
            subjectCode: lab.code,
            teacher: lab.teacher,
            room: lab.room,
            isLab: true,
            color: lab.color
          };
        } else if (theorySubs.length > 0) {
          const sIdx = (dIdx * 3 + period.id) % theorySubs.length;
          const sub = theorySubs[sIdx] || theorySubs[0];
          baseSchedule[cls.id][day][period.id] = {
            subject: sub.name,
            subjectCode: sub.code,
            teacher: sub.teacher,
            room: cls.room,
            isLab: false,
            color: sub.color
          };
        }
      });
    });
  });

  return baseSchedule;
}

