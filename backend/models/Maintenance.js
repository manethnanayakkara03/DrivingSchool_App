const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  vehicle:      { type: String, required: true }, // Reg Number
  vehicleModel: { type: String },
  type:         { type: String, required: true }, // Service, Repair, Inspection
  date:         { type: String, required: true },
  cost:         { type: String },
  notes:        { type: String },
  status:       { type: String, default: 'Pending' },
  idCode:       { type: String },
  color:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
