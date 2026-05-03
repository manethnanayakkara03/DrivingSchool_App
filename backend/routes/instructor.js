const router = require('express').Router();
const Instructor = require('../models/Instructor');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Get students enrolled in instructor's courses
router.get('/my-students/:email', async (req, res) => {
  try {
    const instructor = await Instructor.findOne({ email: req.params.email });
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

    // Assuming instructor.course is the title of the course they teach
    // If they teach multiple courses (comma separated or similar), we handle that
    const courseTitles = instructor.course.split(',').map(c => c.trim());

    const enrollments = await Enrollment.find({
      courseTitle: { $in: courseTitles }
    }).sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (err) {
    console.error('Fetch instructor students error:', err);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Update enrollment status/progress
router.put('/enrollment-status/:id', async (req, res) => {
  try {
    const { status, progress } = req.body;
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status, progress },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.json(enrollment);
  } catch (err) {
    console.error('Update enrollment status error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Get instructor profile
router.get('/profile/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    const instructor = await Instructor.findOne({ email: req.params.email });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      nic: user.nic,
      phone: user.phone,
      address: user.address,
      specialty: instructor ? instructor.specialty : '',
      experience: instructor ? instructor.experience : '',
      course: instructor ? instructor.course : '',
    });
  } catch (err) {
    console.error('Fetch instructor profile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update instructor profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, nic, phone, address, specialty, experience } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, nic, phone, address },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Also update Instructor record if it exists
    await Instructor.findOneAndUpdate(
      { email: user.email },
      { name, nic, phone, specialty, experience }
    );

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      nic: user.nic,
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    console.error('Instructor profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Admin creates instructor account
router.post('/create-account', async (req, res) => {
  try {
    const { name, email, password, nic, phone, licenceType, experience, specialization, monthlySalary, status } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create User (password will be hashed by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      role: 'instructor',
      nic,
      phone
    });
    await user.save();

    // Generate random color and idCode for the instructor profile
    const COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#6366F1','#EC4899'];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const idCode = `INS-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Instructor profile
    const instructor = new Instructor({
      name,
      email,
      nic,
      phone,
      licenceType,
      experience,
      specialization,
      monthlySalary,
      status: status || 'Active',
      idCode,
      color
    });
    await instructor.save();

    res.status(201).json({ message: 'Instructor account created successfully', user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Create instructor account error:', err);
    res.status(500).json({ message: err.message || 'Failed to create instructor account' });
  }
});

module.exports = router;
