const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  learnerId:     { type: String, required: true },
  courseId:       { type: String, required: true },
  courseTitle:    { type: String },
  price:         { type: Number, default: 0 },
  status:        { type: String, enum: ['enrolled', 'in-progress', 'completed'], default: 'enrolled' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  progress:      { type: Number, default: 0 },
  idCode:        { type: String },
  color:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
