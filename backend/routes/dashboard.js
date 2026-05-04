const router = require('express').Router();
const auth = require('../middleware/auth');
const Learner = require('../models/Learner');
const Instructor = require('../models/Instructor');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');


// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [learners, instructors, vehicles, bookings, payments, recentBookings, recentEnrollments] = await Promise.all([
      Learner.countDocuments(),
      Instructor.countDocuments(),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Payment.find(),
      Booking.find().sort({ createdAt: -1 }).limit(5),
      Enrollment.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const revenue = payments.reduce((sum, p) => {
      const amt = parseFloat(p.amountPaid) || 0;
      return sum + amt;
    }, 0);

    const recentActivity = [
      ...recentBookings.map(b => ({ ...b.toObject(), type: 'booking', learnerName: b.learnerName })),
      ...recentEnrollments.map(e => ({ ...e.toObject(), type: 'enrollment', learnerName: e.learnerName }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

    res.json({ learners, instructors, vehicles, bookings, revenue, recentActivity });

  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
