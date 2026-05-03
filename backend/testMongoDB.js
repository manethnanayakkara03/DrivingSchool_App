const mongoose = require('mongoose');
const dns = require('node:dns');
require('dotenv').config();

// Set DNS servers
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Create custom resolver for MongoDB
const resolver = new dns.promises.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

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

console.log('🔍 Testing MongoDB Connection with Custom DNS...\n');
console.log('URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT SET');

mongoose.connect(process.env.MONGODB_URI, {
  lookup: customLookup,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  family: 4,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  process.exit(0);
})
.catch((err) => {
  console.log('❌ MongoDB Connection Error:');
  console.log('Error Code:', err.codeName || err.code);
  console.log('Error Message:', err.message);
  console.log('\nFull Error:', err);
  process.exit(1);
});
