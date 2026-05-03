const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  totalTasks: { type: Number, default: 10 },
  type: { type: String, enum: ['manual', 'auto', 'both'], default: 'manual' },
  image: { type: String },
  assignedInstructor: { type: String },
  status: { type: String, default: 'Active' },
  maxLearners: { type: Number, default: 50 },
  enrolled: { type: Number, default: 0 },
  idCode: { type: String },
  color: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
