const mongoose = require('mongoose');

const StudentClassSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  studentCount: { type: Number, required: true },
  subjects: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('StudentClass', StudentClassSchema);
