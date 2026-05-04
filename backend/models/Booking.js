const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  learnerId:    { type: String },
  learnerName:  { type: String, required: true },
  instructorId: { type: String },
  instructorName: { type: String },
  vehicleId:    { type: String },
  vehicleName:  { type: String },
  date:         { type: String, required: true }, // e.g. "2023-11-25"
  time:         { type: String, required: true }, // e.g. "10:00 AM"
  duration:     { type: String, default: '1 Hour' },
  status:       { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  courseId:     { type: String },
  courseTitle:  { type: String },
  examType:     { type: String }, // e.g. "Written", "Practical"
  venue:        { type: String },
  passmark:     { type: String },
  idCode:       { type: String },
  color:        { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
