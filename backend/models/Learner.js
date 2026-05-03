const mongoose = require('mongoose');

const LearnerSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  nic:             { type: String },
  phone:           { type: String },
  email:           { type: String },
  course:          { type: String },
  licenseCategory: { type: String },
  idCode:          { type: String },
  progress:        { type: Number, default: 0 },
  totalLessons:    { type: Number, default: 10 },
  status:          { type: String, default: 'Active' },
  color:           { type: String },
  image:           { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Learner', LearnerSchema);
