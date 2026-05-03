const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  features: [{ type: String }],
  type: { type: String, enum: ['manual', 'auto', 'both'], default: 'manual' },
  image: { type: String },
  assignedInstructor: { type: String },
  status: { type: String, default: 'Active' },
  idCode: { type: String },
  color: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
