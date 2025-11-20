const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri;
    
    if (process.env.NODE_ENV === 'test') {
      uri = process.env.MONGODB_TEST_URI;
      if (!uri) {
        throw new Error('MONGODB_TEST_URI must be set when NODE_ENV===test');
      }
    }
    else {
      uri = process.env.MONGODB_URI;
    }
    
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;