const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true },
  maker:              { type: String },
  model:              { type: String },
  year:               { type: String },
  transmission:       { type: String },
  fuelType:           { type: String },
  assignedInstructor: { type: String },
  status:             { type: String, default: 'Active' },
  condition:          { type: String },
  idCode:             { type: String },
  color:              { type: String },
  image:              { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
