const mongoose = require('mongoose');

const TimetableSlotSchema = new mongoose.Schema({
  type: { type: String, enum: ['lecture', 'break'], default: 'lecture' },
  classId: { type: String },
  className: { type: String },
  subjectCode: { type: String },
  subjectName: { type: String },
  teacherId: { type: String },
  teacherName: { type: String },
  room: { type: String },
  color: { type: String },
  isLab: { type: Boolean, default: false },
  isSubstitute: { type: Boolean, default: false },
  originalTeacherId: { type: String },
  originalTeacherName: { type: String },
  substituteReason: { type: String }
}, { _id: false });

const TimetableSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  presetKey: { type: String, default: 'college' },
  schedule: { type: mongoose.Schema.Types.Mixed, required: true },
  metrics: {
    clashes: { type: Number, default: 0 },
    satisfactionRate: { type: Number, default: 100 },
    iterations: { type: Number, default: 0 },
    timeTakenMs: { type: Number, default: 0 }
  },
  activeLeaves: [{ type: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
