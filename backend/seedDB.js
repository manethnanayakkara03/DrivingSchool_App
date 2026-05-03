/**
 * Database Seeder
 * Seeds the default admin user and initial courses if they don't exist.
 * Called once from server.js after successful MongoDB connection.
 */
const User = require('./models/User');
const Course = require('./models/Course');

const DEFAULT_COURSES = [
  {
    title: 'Basic Manual Driving',
    description: 'Master the fundamentals of manual transmission driving.',
    price: 25000,
    duration: '1 Month',
    features: ['15 Practical Sessions', 'Theory Handbook', 'Mock Test'],
    type: 'manual',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=400',
  },
  {
    title: 'Premium Automatic Course',
    description: 'Effortless driving with automatic transmission mastery.',
    price: 30000,
    duration: '1 Month',
    features: ['20 Practical Sessions', 'Luxury Vehicle', 'Home Pickup'],
    type: 'auto',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=400',
  },
  {
    title: 'Professional License Pack',
    description: 'Comprehensive training for commercial vehicle licenses.',
    price: 45000,
    duration: '2 Months',
    features: ['Extended Practice', 'Night Driving', 'Highway Prep'],
    type: 'both',
    image: 'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?q=80&w=400',
  },
];

async function seedDatabase() {
  try {
    // Seed admin user
    const adminExists = await User.findOne({ email: 'arampath@driveease.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'arampath@driveease.com',
        password: '123456',          // Will be hashed by the pre-save hook
        role: 'admin',
      });
      console.log('   🌱 Default admin user seeded');
    }

    // Seed courses
    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
      await Course.insertMany(DEFAULT_COURSES);
      console.log('   🌱 Default courses seeded (' + DEFAULT_COURSES.length + ')');
    }

    console.log('   ✅ Database seed check complete');
  } catch (err) {
    console.error('   ❌ Seed error:', err.message);
  }
}

module.exports = seedDatabase;
