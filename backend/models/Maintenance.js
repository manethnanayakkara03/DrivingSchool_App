const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  vehicleId:      { type: String, required: true },
  serviceDate:    { type: String, required: true },
  serviceType:    { type: String, required: true },
  nextServiceDate: { type: String, required: true },
  description:    { type: String, required: true },
  cost:           { type: String, required: true },
  maintainerName: { type: String, required: true },
  idCode:         { type: String },
  status:         { type: String, default: 'Completed' },
  color:          { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
