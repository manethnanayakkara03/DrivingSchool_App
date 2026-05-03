const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  nic:           { type: String },
  phone:         { type: String },
  email:         { type: String },
  licenceType:   { type: String },
  experience:    { type: String },
  specialization:{ type: String },
  monthlySalary: { type: String },
  status:        { type: String, default: 'Active' },
  idCode:        { type: String },
  color:         { type: String },
  image:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Instructor', InstructorSchema);
