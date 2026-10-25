
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    // Check MongoDB connection string
    if (!mongoUri) {
      throw new Error(
        'MONGO_URI is missing. Please configure it in Render Environment Variables.'
      );
    }

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      `[MongoDB] Connected Successfully: ${conn.connection.host}/${conn.connection.name}`
    );

    return conn;
  } catch (error) {
    console.error('[MongoDB Connection Error]', error.message);
    throw error;
  }
};

module.exports = connectDB;
