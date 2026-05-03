const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  nic:        { type: String },   // date
  phone:      { type: String },   // time
  course:     { type: String },
  instructor: { type: String },
  idCode:     { type: String },
  progress:   { type: Number, default: 0 },
  totalLessons: { type: Number, default: 10 },
  status:     { type: String, default: 'Active' },
  color:      { type: String },
  image:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
