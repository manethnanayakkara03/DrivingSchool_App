/**
 * Run once to seed the initial admin account.
 * node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');

  const existing = await Admin.findOne({ email: 'arampath@driveease.com' });
  if (existing) {
    console.log('ℹ️  Admin already exists — skipping seed.');
  } else {
    await Admin.create({ email: 'arampath@driveease.com', password: '123456', name: 'Admin' });
    console.log('✅ Admin seeded: arampath@driveease.com / 123456');
  }

  await mongoose.disconnect();
  process.exit(0);
})();
