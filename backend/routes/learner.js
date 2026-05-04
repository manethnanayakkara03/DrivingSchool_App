const router = require('express').Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');


// Get learner's dashboard stats (counts, next class)
router.get('/stats/:learnerId', auth, async (req, res) => {
  try {
    const [enrollmentCount, nextClass] = await Promise.all([
      Enrollment.countDocuments({ learnerId: req.params.learnerId }),
      Booking.findOne({ 
        learnerId: req.params.learnerId, 
        status: 'Confirmed' 
      }).sort({ date: 1, time: 1 })
    ]);

    res.json({
      enrolledCount: enrollmentCount,
      nextClass: nextClass ? `${nextClass.date} at ${nextClass.time}` : 'None Scheduled'
    });
  } catch (err) {
    console.error('Fetch learner stats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// ─── courses ──────────────────────────────────────────────────────────────────

// Get all available courses
router.get('/courses', auth, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: 1 });
    // Map _id to id for frontend compatibility
    const mapped = courses.map(c => ({
      id: c._id,
      title: c.title,
      description: c.description,
      price: c.price,
      duration: c.duration,
      features: c.features,
      type: c.type,
      image: c.image,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Enroll in a course
router.post('/enroll', auth, async (req, res) => {
  try {
    const { learnerId, courseId, paymentData } = req.body;
    if (!learnerId || !courseId) return res.status(400).json({ message: 'IDs required' });

    const learner = await User.findById(learnerId);
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Determine status based on payment method
    const paymentStatus = paymentData?.method === 'card' ? 'paid' : 'pending';
    const status = 'pending_approval'; // All enrollments require admin approval now

    const enrollment = await Enrollment.create({
      learnerId,
      learnerName: learner?.name || 'Unknown Learner',
      courseId,
      courseTitle: course.title,
      price: course.price,
      status,
      paymentStatus,
      progress: 0,
      paymentMethod: paymentData?.method || 'unknown',
      paymentDetails: paymentData // Store full details (card or slip info)
    });

    res.json({
      id: enrollment._id,
      learnerId: enrollment.learnerId,
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle,
      price: enrollment.price,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      progress: enrollment.progress,
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ message: 'Enrollment failed' });
  }
});

// Get learner's enrollments
router.get('/my-courses/:learnerId', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ learnerId: req.params.learnerId }).sort({ createdAt: -1 });
    const mapped = enrollments.map(e => ({
      id: e._id,
      learnerId: e.learnerId,
      courseId: e.courseId,
      courseTitle: e.courseTitle,
      price: e.price,
      status: e.status,
      paymentStatus: e.paymentStatus,
      progress: e.progress,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Fetch my courses error:', err);
    res.status(500).json({ message: 'Failed to fetch enrollments' });
  }
});

// ─── payments ─────────────────────────────────────────────────────────────────

// Pay for a course
router.post('/pay', auth, async (req, res) => {
  try {
    const { enrollmentId, amount, method } = req.body;

    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { paymentStatus: 'paid' },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // We store learner payments as simple objects in an embedded approach
    // For now, we return a virtual payment object
    const payment = {
      id: enrollment._id,
      learnerId: enrollment.learnerId,
      enrollmentId: enrollment._id,
      courseTitle: enrollment.courseTitle,
      amount,
      method,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, payment });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ message: 'Payment failed' });
  }
});

// Get learner's payment history
router.get('/my-payments/:learnerId', auth, async (req, res) => {
  try {
    // Show all enrollments as payment items
    const enrollments = await Enrollment.find({
      learnerId: req.params.learnerId,
    }).sort({ updatedAt: -1 });

    const payments = enrollments.map(e => ({
      id: e._id,
      learnerId: e.learnerId,
      courseTitle: e.courseTitle,
      amount: e.price,
      status: e.paymentStatus === 'paid' ? 'completed' : 'pending',
      method: e.paymentMethod,
      slipUrl: e.paymentDetails?.slipImage,
      createdAt: e.updatedAt || e.createdAt,
    }));

    res.json(payments);
  } catch (err) {
    console.error('Fetch payments error:', err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// Admin: Get all enrollments pending approval
router.get('/pending-enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: 'pending_approval' }).sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    console.error('Fetch pending error:', err);
    res.status(500).json({ message: 'Failed to fetch pending enrollments' });
  }
});

// Admin: Get all successfully enrolled students
router.get('/enrolled-students', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ status: 'enrolled' }).sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (err) {
    console.error('Fetch enrolled error:', err);
    res.status(500).json({ message: 'Failed to fetch enrolled students' });
  }
});

// Admin: Approve enrollment
router.post('/approve-enrollment/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: 'enrolled', paymentStatus: 'paid' },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // 1. Create a formal Payment record
    await Payment.create({
      studentName: enrollment.learnerName,
      course: enrollment.courseTitle,
      totalFee: enrollment.price.toString(),
      amountPaid: enrollment.price.toString(),
      balance: '0',
      method: enrollment.paymentMethod || 'Cash',
      date: new Date().toLocaleDateString(),
      status: 'Paid',
      slipImage: enrollment.paymentDetails?.slipImage,
    });

    // 2. Create a placeholder Booking record for the admin to schedule
    await Booking.create({
      learnerId: enrollment.learnerId,
      learnerName: enrollment.learnerName,
      courseId: enrollment.courseId,
      courseTitle: enrollment.courseTitle,
      instructorName: 'TBD',
      vehicleName: 'TBD',
      date: 'Not Set',
      time: 'Not Set',
      duration: '1 Hour',
      status: 'Pending',
    });

    res.json(enrollment);
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: 'Approval failed' });
  }
});



// ─── profile ──────────────────────────────────────────────────────────────────

// Update profile
router.put('/profile/:id', auth, async (req, res) => {
  try {
    const { name, nic, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, nic, phone, address },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      nic: user.nic,
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Cancel enrollment
router.delete('/cancel-enrollment/:id', auth, async (req, res) => {
  try {
    console.log('🗑️ Cancellation request for ID:', req.params.id);
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // Delete enrollment
    await Enrollment.findByIdAndDelete(req.params.id);

    // Delete associated bookings
    await Booking.deleteMany({ 
      learnerId: enrollment.learnerId, 
      courseId: enrollment.courseId 
    });

    res.json({ message: 'Enrollment cancelled successfully' });
  } catch (err) {
    console.error('Cancel enrollment error:', err);
    res.status(500).json({ message: 'Failed to cancel enrollment' });
  }
});

module.exports = router;
