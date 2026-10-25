const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_performance_analytics';
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected Successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error(`Please make sure your MongoDB instance is running locally or check your MONGO_URI in server/.env`);
    // Do not terminate process immediately in dev mode to allow graceful fallback/retries
  }
};

module.exports = connectDB;
