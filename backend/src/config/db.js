import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error('[DB] MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('[DB] Connected to MongoDB successfully.');
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected. Mongoose will attempt to reconnect.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] MongoDB reconnected.');
});

export default connectDB;
