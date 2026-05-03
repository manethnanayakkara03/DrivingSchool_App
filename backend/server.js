const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('node:dns');
require('dotenv').config();

// Set DNS servers for extra safety (applies to Node's dns module)
dns.setServers(['1.1.1.1', '8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize local data storage
const localData = require('./localData');
localData.initializeData();

// Create a custom DNS resolver for MongoDB driver (bypasses broken OS DNS)
const resolver = new dns.promises.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']); // Cloudflare & Google DNS

const customLookup = async (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    try {
        const addresses = await resolver.resolve4(hostname);
        if (addresses && addresses.length > 0) {
            callback(null, addresses[0], 4);
            return;
        }
        throw new Error('No IPv4 addresses found');
    } catch (err) {
        // Try IPv6 as fallback
        try {
            const addresses6 = await resolver.resolve6(hostname);
            if (addresses6 && addresses6.length > 0) {
                callback(null, addresses6[0], 6);
                return;
            }
        } catch (err6) {}
        callback(new Error(`DNS lookup failed for ${hostname}: ${err.message}`));
    }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection (Optional - Local storage is primary)
let mongoConnected = false;
const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('📁 Using Local File-Based Storage (MongoDB not configured)');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      lookup: customLookup,       // ← Custom DNS resolver to bypass broken OS DNS
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,                  // Prefer IPv4
      retryWrites: true,
      w: 'majority'
    });
    mongoConnected = true;
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.log('⚠️  MongoDB Connection Failed');
    console.log('   Error:', err.codeName || err.code || err.message);
    console.log('   Using Local File-Based Storage as fallback');
  }
};
connectMongo();

// Routes
const crudRouter = require('./routes/crudRouter');
const Learner     = require('./models/Learner');
const Instructor  = require('./models/Instructor');
const Vehicle     = require('./models/Vehicle');
const Booking     = require('./models/Booking');
const Payment     = require('./models/Payment');
const Maintenance = require('./models/Maintenance');

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/report',      require('./routes/report'));
app.use('/api/learners',    crudRouter(Learner,     'DS'));
app.use('/api/instructors', crudRouter(Instructor,  'INS'));
app.use('/api/vehicles',    crudRouter(Vehicle,     'VH'));
app.use('/api/bookings',    crudRouter(Booking,     'BK'));
app.use('/api/payments',    crudRouter(Payment,     'PAY'));
app.use('/api/maintenance', crudRouter(Maintenance, 'MT'));

// Health check
app.get('/', (req, res) => res.send('Arampath Driving School API is running ✅'));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
