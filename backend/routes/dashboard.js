const router = require('express').Router();
const auth = require('../middleware/auth');
const localData = require('../localData');
const Learner = require('../models/Learner');
const Instructor = require('../models/Instructor');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const [learners, instructors, vehicles, bookings, payments] = await Promise.all([
        Learner.countDocuments(),
        Instructor.countDocuments(),
        Vehicle.countDocuments(),
        Booking.countDocuments(),
        Payment.find(),
      ]);

      // sum amounts stored in the `phone` field of Payment
      const revenue = payments.reduce((sum, p) => {
        const amt = parseFloat(p.phone) || 0;
        return sum + amt;
      }, 0);

      res.json({ learners, instructors, vehicles, bookings, revenue });
    } catch (dbErr) {
      // Fallback to local storage
      const stats = localData.getStats();
      res.json(stats);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
