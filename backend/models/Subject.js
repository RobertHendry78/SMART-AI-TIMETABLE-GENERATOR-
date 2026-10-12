const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  defaultTeacherId: { type: String, required: true },
  weeklyLectures: { type: Number, required: true, default: 4 },
  isLab: { type: Boolean, default: false },
  consecutiveSlots: { type: Number, default: 1 },
  requiredRoomType: { type: String, default: 'theory' },
  color: { type: String, default: '#6366F1' }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
