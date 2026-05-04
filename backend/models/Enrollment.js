const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  learnerId:     { type: String, required: true },
  learnerName:   { type: String },
  courseId:       { type: String, required: true },
  courseTitle:    { type: String },
  price:         { type: Number, default: 0 },
  status:        { type: String, enum: ['enrolled', 'in-progress', 'completed', 'pending_approval'], default: 'enrolled' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  progress:      { type: Number, default: 0 },
  paymentMethod: { type: String },
  paymentDetails: { type: mongoose.Schema.Types.Mixed },
  idCode:        { type: String },
  color:         { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
