const router = require('express').Router();
const auth = require('../middleware/auth');
const Learner = require('../models/Learner');
const Instructor = require('../models/Instructor');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [learners, instructors, vehicles, bookings, payments] = await Promise.all([
      Learner.countDocuments(),
      Instructor.countDocuments(),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Payment.find(),
    ]);

    const revenue = payments.reduce((sum, p) => {
      const amt = parseFloat(p.amountPaid) || 0;
      return sum + amt;
    }, 0);

    res.json({ learners, instructors, vehicles, bookings, revenue });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
