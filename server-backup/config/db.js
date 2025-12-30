const mongoose = require('mongoose');

// Connect to MongoDB and export a connect function
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/skyynett';
  try {
    // Recommended options
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // short timeout for faster failure
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // If the URI used 'localhost', some systems resolve it to IPv6 (::1) which
    // can cause ECONNREFUSED if mongod is bound only to IPv4. Try fallback to 127.0.0.1.
    if (uri.includes('localhost')) {
      const fallback = uri.replace('localhost', '127.0.0.1');
      try {
        console.log('➡️  Retrying MongoDB connection using 127.0.0.1...');
        await mongoose.connect(fallback, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB connected (via 127.0.0.1)');
        return;
      } catch (err2) {
        console.error('❌ Fallback connection failed:', err2.message);
      }
    }
    // Exit the process - this makes failures visible when launching the server
    console.error('Please ensure MongoDB is running and MONGO_URI is correct.');
    process.exit(1);
  }
};

module.exports = connectDB;