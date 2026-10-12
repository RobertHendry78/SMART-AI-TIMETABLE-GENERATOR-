const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  teacherId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, default: '👨‍🏫' },
  color: { type: String, default: '#6366F1' },
  specialization: [{ type: String }],
  maxPeriodsPerDay: { type: Number, default: 4 },
  preferredMorning: { type: Boolean, default: false },
  onLeave: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
