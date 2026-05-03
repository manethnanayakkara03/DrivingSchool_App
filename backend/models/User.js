const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'learner', 'instructor'], default: 'learner' },
  nic:      { type: String },
  phone:    { type: String },
  address:  { type: String },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare plain password with hashed password
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
