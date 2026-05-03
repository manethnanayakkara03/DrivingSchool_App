const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  nic:             { type: String },   // plate number stored here for list compat
  phone:           { type: String },   // fuel type stored here
  course:          { type: String },   // transmission stored here
  insuranceExpiry: { type: String },
  revenueLicense:  { type: String },
  idCode:          { type: String },
  progress:        { type: Number, default: 0 },
  totalLessons:    { type: Number, default: 100 },
  status:          { type: String, default: 'Active' },
  color:           { type: String },
  image:           { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
