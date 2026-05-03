const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  nic:        { type: String },
  phone:      { type: String },
  email:      { type: String },
  experience: { type: String },
  specialty:  { type: String },
  course:     { type: String },
  idCode:     { type: String },
  progress:   { type: Number, default: 0 },
  totalLessons: { type: Number, default: 15 },
  status:     { type: String, default: 'Active' },
  color:      { type: String },
  image:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Instructor', InstructorSchema);
