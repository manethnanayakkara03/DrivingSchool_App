const router = require('express').Router();
const auth = require('../middleware/auth');
const Learner = require('../models/Learner');
const Instructor = require('../models/Instructor');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');

// Middleware to handle token from both header and query params
const authWithQuery = (req, res, next) => {
  const token = req.query.token || (req.headers.authorization?.split(' ')[1]);
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  req.user = { email: 'Admin' };
  next();
};

// GET /api/report/generate
router.get('/generate', auth, async (req, res) => {
  try {
    const [learners, instructors, vehicles, bookings, payments, maintenance] = await Promise.all([
      Learner.find(), Instructor.find(), Vehicle.find(),
      Booking.find(), Payment.find(), Maintenance.find(),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amountPaid) || 0), 0);

    const reportData = {
      generatedDate: new Date().toISOString(),
      generatedBy: req.user?.email || 'Admin',
      stats: {
        totalLearners: learners.length,
        totalInstructors: instructors.length,
        totalVehicles: vehicles.length,
        totalBookings: bookings.length,
        totalRevenue,
        maintenanceRecords: maintenance.length,
      },
      details: {
        learners: learners.map(l => ({ id: l._id, name: l.name, nic: l.nic, phone: l.phone, email: l.email, course: l.course, licenseCategory: l.licenseCategory })),
        instructors: instructors.map(i => ({ id: i._id, name: i.name, nic: i.nic, phone: i.phone, email: i.email, experience: i.experience, specialty: i.specialty })),
        vehicles: vehicles.map(v => ({ id: v._id, name: v.name, nic: v.nic, fuelType: v.phone, transmission: v.course, insuranceExpiry: v.insuranceExpiry, revenueLicense: v.revenueLicense })),
        bookings: bookings.map(b => ({ id: b._id, studentName: b.studentName, studentPhone: b.studentPhone, instructorId: b.instructorId, vehicleId: b.vehicleId, date: b.date, startTime: b.startTime, endTime: b.endTime, notes: b.notes })),
        payments: payments.map(p => ({ id: p._id, studentName: p.studentName, course: p.course, totalFee: p.totalFee, amountPaid: parseFloat(p.amountPaid) || 0, method: p.method, date: p.date, status: p.status })),
        maintenance: maintenance.map(m => ({ id: m._id, vehicleId: m.vehicleId, serviceDate: m.serviceDate, serviceType: m.serviceType, nextServiceDate: m.nextServiceDate, description: m.description, cost: m.cost, maintainerName: m.maintainerName })),
      },
      summary: {
        activeBookings: bookings.filter(b => new Date(b.date) >= new Date()).length,
        activeLearners: learners.length,
        instructorsOnStaff: instructors.length,
        averageRevenuePerBooking: bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0,
        vehicleUtilizationRate: vehicles.length > 0 ? ((bookings.length / (vehicles.length * 30)) * 100).toFixed(2) + '%' : '0%',
        maintenanceBacklog: maintenance.filter(m => !m.serviceDate).length,
      },
    };

    res.json(reportData);
  } catch (err) {
    console.error('Report Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
});

// GET /api/report/download (returns HTML for viewing/printing)
router.get('/download', authWithQuery, async (req, res) => {
  try {
    const [learners, instructors, vehicles, bookings, payments, maintenance] = await Promise.all([
      Learner.find(), Instructor.find(), Vehicle.find(),
      Booking.find(), Payment.find(), Maintenance.find(),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amountPaid) || 0), 0);
    const generatedDate = new Date().toISOString();

    const stats = {
      totalLearners: learners.length,
      totalInstructors: instructors.length,
      totalVehicles: vehicles.length,
      totalBookings: bookings.length,
      totalRevenue,
      maintenanceRecords: maintenance.length,
    };

    const summary = {
      activeBookings: bookings.filter(b => new Date(b.date) >= new Date()).length,
      activeLearners: learners.length,
      instructorsOnStaff: instructors.length,
      vehicleFleet: vehicles.length,
    };

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arampath Driving School - Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
    h1 { color: #4F46E5; font-size: 28px; }
    .report-info { color: #999; font-size: 12px; margin-top: 8px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: #f0f4ff; border-left: 4px solid #4F46E5; padding: 20px; border-radius: 4px; }
    .stat-label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 28px; font-weight: bold; color: #4F46E5; margin-top: 8px; }
    .summary-section { margin: 30px 0; }
    h2 { color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
    .summary-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .summary-label { color: #666; }
    .summary-value { color: #333; font-weight: 600; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 11px; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Arampath Driving School</h1>
      <p>Monthly Management Report</p>
      <div class="report-info">
        <p>Generated: ${new Date(generatedDate).toLocaleDateString()} at ${new Date(generatedDate).toLocaleTimeString()}</p>
        <p>By: ${req.user?.email || 'Admin'}</p>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total Students</div><div class="stat-value">${stats.totalLearners || 0}</div></div>
      <div class="stat-card"><div class="stat-label">Total Instructors</div><div class="stat-value">${stats.totalInstructors || 0}</div></div>
      <div class="stat-card"><div class="stat-label">Active Vehicles</div><div class="stat-value">${stats.totalVehicles || 0}</div></div>
      <div class="stat-card"><div class="stat-label">Total Bookings</div><div class="stat-value">${stats.totalBookings || 0}</div></div>
      <div class="stat-card"><div class="stat-label">Monthly Revenue (LKR)</div><div class="stat-value">${(stats.totalRevenue || 0).toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Maintenance Records</div><div class="stat-value">${stats.maintenanceRecords || 0}</div></div>
    </div>
    <div class="summary-section">
      <h2>Summary Overview</h2>
      <div class="summary-item"><span class="summary-label">Active Bookings:</span><span class="summary-value">${summary.activeBookings || 0}</span></div>
      <div class="summary-item"><span class="summary-label">Active Learners:</span><span class="summary-value">${summary.activeLearners || 0}</span></div>
      <div class="summary-item"><span class="summary-label">Instructors on Staff:</span><span class="summary-value">${summary.instructorsOnStaff || 0}</span></div>
      <div class="summary-item"><span class="summary-label">Vehicle Fleet:</span><span class="summary-value">${summary.vehicleFleet || 0}</span></div>
    </div>
    <div class="footer">
      <p>This is an automated report generated by Arampath Driving School Management System</p>
      <p>For any inquiries, contact the administration office</p>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Report Download Error:', err);
    res.status(500).json({ message: 'Failed to download report', error: err.message });
  }
});

module.exports = router;
