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

module.exports = router;
