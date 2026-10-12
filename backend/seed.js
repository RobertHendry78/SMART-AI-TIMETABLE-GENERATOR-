/**
 * Suguna College of Engineering - Database Seeder
 * Populates MongoDB with faculty members, classrooms, curriculum subjects, and student classes.
 * Usage: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const Classroom = require('./models/Classroom');
const Timetable = require('./models/Timetable');
const StudentClass = require('./models/StudentClass');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_timetable_db';

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("🍃 Connected to MongoDB for seeding Suguna College dataset...");

    // Clear existing collections
    await Teacher.deleteMany({});
    await Subject.deleteMany({});
    await Classroom.deleteMany({});
    await StudentClass.deleteMany({});
    await Timetable.deleteMany({});
    console.log("🧹 Cleared old collections.");

    // 1. Seed Faculty Members
    const teachers = [
      {
        teacherId: "T101",
        name: "Dr. Mythili",
        designation: "Professor & HOD",
        department: "Information Technology",
        email: "hod.it@sugunacollege.edu",
        avatar: "👩‍🏫",
        color: "#6366F1",
        specialization: ["Web Technologies", "Cloud Computing", "Software Architecture"],
        maxPeriodsPerDay: 4,
        preferredMorning: true
      },
      {
        teacherId: "T102",
        name: "Dr. Priya Sundaram",
        designation: "Associate Professor",
        department: "Information Technology",
        email: "priya.it@sugunacollege.edu",
        avatar: "👩‍🏫",
        color: "#EC4899",
        specialization: ["Database Engineering", "Distributed Systems", "SQL Lab"],
        maxPeriodsPerDay: 4,
        preferredMorning: false
      },
      {
        teacherId: "T105",
        name: "Prof. Suresh V.",
        designation: "Assistant Professor",
        department: "Information Technology",
        email: "suresh.it@sugunacollege.edu",
        avatar: "👨‍💻",
        color: "#10B981",
        specialization: ["Operating Systems", "Cloud Systems", "MLOps"],
        maxPeriodsPerDay: 4,
        preferredMorning: false
      },
      {
        teacherId: "T107",
        name: "Dr. Dinesh Karthik",
        designation: "Associate Professor",
        department: "Information Technology",
        email: "dinesh.it@sugunacollege.edu",
        avatar: "👨‍🏫",
        color: "#3B82F6",
        specialization: ["Full Stack Architecture", "Deep Learning", "Agile DevOps"],
        maxPeriodsPerDay: 4,
        preferredMorning: true
      },
      {
        teacherId: "T109",
        name: "Prof. K. Saravanan",
        designation: "Assistant Professor",
        department: "Information Technology",
        email: "saravanan.it@sugunacollege.edu",
        avatar: "👨‍💼",
        color: "#059669",
        specialization: ["Data Structures", "Algorithms", "DSA Lab"],
        maxPeriodsPerDay: 4,
        preferredMorning: false
      },
      {
        teacherId: "T110",
        name: "Prof. S. Archana",
        designation: "Assistant Professor",
        department: "Information Technology",
        email: "archana.it@sugunacollege.edu",
        avatar: "👩‍💻",
        color: "#06B6D4",
        specialization: ["Computer Networks", "Information Security", "Network Lab"],
        maxPeriodsPerDay: 4,
        preferredMorning: false
      },
      {
        teacherId: "T201",
        name: "Dr. R. Kavitha",
        designation: "Professor & HOD",
        department: "AI & Data Science",
        email: "hod.aids@sugunacollege.edu",
        avatar: "👩‍🔬",
        color: "#06B6D4",
        specialization: ["Machine Learning", "Neural Computing", "NLP"],
        maxPeriodsPerDay: 4,
        preferredMorning: true
      },
      {
        teacherId: "T301",
        name: "Dr. S. Rajasekaran",
        designation: "Professor & HOD",
        department: "Computer Science",
        email: "hod.cse@sugunacollege.edu",
        avatar: "👨‍🏫",
        color: "#10B981",
        specialization: ["Algorithms", "Cloud Computing", "Capstone"],
        maxPeriodsPerDay: 4,
        preferredMorning: true
      },
      {
        teacherId: "T104",
        name: "Dr. Meenakshi R.",
        designation: "Professor & HOD (S&H)",
        department: "Science & Humanities",
        email: "meenakshi.sh@sugunacollege.edu",
        avatar: "👩‍🔬",
        color: "#8B5CF6",
        specialization: ["Matrices & Calculus", "Probability & Statistics", "Discrete Math"],
        maxPeriodsPerDay: 5,
        preferredMorning: true
      },
      {
        teacherId: "T108",
        name: "Prof. Harishankar S.",
        designation: "Senior Faculty",
        department: "Science & Humanities",
        email: "harishankar@sugunacollege.edu",
        avatar: "👨‍🏫",
        color: "#14B8A6",
        specialization: ["Communicative English", "Professional Ethics", "Technical Writing"],
        maxPeriodsPerDay: 4,
        preferredMorning: false
      }
    ];
    await Teacher.insertMany(teachers);
    console.log(`✅ Seeded ${teachers.length} Suguna College Faculty members.`);

    // 2. Seed Classrooms & Labs
    const classrooms = [
      { roomId: "IT-Hall-301", name: "IT Lecture Hall 301 (2nd Yr)", type: "theory", capacity: 65 },
      { roomId: "IT-Hall-302", name: "IT Lecture Hall 302 (3rd Yr)", type: "theory", capacity: 65 },
      { roomId: "IT-Hall-303", name: "IT Lecture Hall 303 (Final Yr)", type: "theory", capacity: 65 },
      { roomId: "AIDS-Hall-201", name: "AIDS Lecture Hall 201 (2nd Yr)", type: "theory", capacity: 65 },
      { roomId: "CSE-Hall-401", name: "CSE Lecture Hall 401 (2nd Yr)", type: "theory", capacity: 70 },
      { roomId: "SH-Hall-101", name: "1st Year Lecture Hall 101 (Common)", type: "theory", capacity: 70 },
      { roomId: "Web-Lab", name: "Full-Stack Web Technologies Lab", type: "lab", capacity: 45 },
      { roomId: "Cloud-Lab", name: "Linus Cloud & DevOps Lab", type: "lab", capacity: 45 },
      { roomId: "AI-Lab-1", name: "Turing AI & GPU Research Lab", type: "lab", capacity: 45 }
    ];
    await Classroom.insertMany(classrooms);
    console.log(`✅ Seeded ${classrooms.length} Classrooms and Labs.`);

    // 3. Seed Core Subjects for IT
    const subjects = [
      { code: "IT201", name: "Web Technologies & Cloud", department: "Information Technology", defaultTeacherId: "T101", weeklyLectures: 4, isLab: false, color: "#6366F1" },
      { code: "IT202", name: "Probability & Statistics", department: "Science & Humanities", defaultTeacherId: "T104", weeklyLectures: 4, isLab: false, color: "#8B5CF6" },
      { code: "IT203", name: "Data Structures & Algorithms", department: "Information Technology", defaultTeacherId: "T109", weeklyLectures: 4, isLab: false, color: "#10B981" },
      { code: "IT204", name: "Database Engineering & SQL", department: "Information Technology", defaultTeacherId: "T102", weeklyLectures: 3, isLab: false, color: "#EC4899" },
      { code: "IT206L", name: "Full Stack Web Tech Practical Lab", department: "Information Technology", defaultTeacherId: "T101", weeklyLectures: 2, isLab: true, consecutiveSlots: 2, color: "#4F46E5" },
      { code: "IT301", name: "Software Engineering & Agile", department: "Information Technology", defaultTeacherId: "T107", weeklyLectures: 4, isLab: false, color: "#3B82F6" },
      { code: "IT401", name: "Artificial Intelligence & Deep Learning", department: "Information Technology", defaultTeacherId: "T107", weeklyLectures: 4, isLab: false, color: "#6366F1" }
    ];
    await Subject.insertMany(subjects);
    console.log(`✅ Seeded ${subjects.length} Core Subjects.`);

    // 4. Seed Student Classes (IT 2nd, 3rd, Final Year, AIDS, CSE, 1st Year)
    const studentClasses = [
      { id: "IT-2A", name: "B.Tech IT - 2nd Year (Sem 3)", department: "Information Technology", studentCount: 58, subjects: ["IT201", "IT202", "IT203", "IT204", "IT206L"] },
      { id: "IT-3A", name: "B.Tech IT - 3rd Year (Sem 5)", department: "Information Technology", studentCount: 56, subjects: ["IT301", "IT302", "IT303", "IT306L"] },
      { id: "IT-4A", name: "B.Tech IT - Final Year (Sem 7)", department: "Information Technology", studentCount: 54, subjects: ["IT401", "IT402", "IT403", "IT405L"] },
      { id: "AIDS-2A", name: "B.Tech AI & DS - 2nd Year", department: "Artificial Intelligence & Data Science", studentCount: 60, subjects: ["AD201", "AD202", "AD203"] },
      { id: "CSE-2A", name: "B.Tech CSE - 2nd Year", department: "Computer Science & Engineering", studentCount: 62, subjects: ["CS201", "CS202"] },
      { id: "FY-IT", name: "1st Year B.Tech - IT Section", department: "Science & Humanities", studentCount: 60, subjects: ["MA101", "PH101", "CY101"] }
    ];
    await StudentClass.insertMany(studentClasses);
    console.log(`✅ Seeded ${studentClasses.length} Student Classes for Suguna College.`);

    console.log("🎉 Suguna College database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
    process.exit(1);
  }
};

seedData();
