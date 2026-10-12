const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['theory', 'lab', 'seminar', 'sports'], default: 'theory' },
  capacity: { type: Number, required: true, default: 60 }
}, { timestamps: true });

module.exports = mongoose.model('Classroom', ClassroomSchema);
