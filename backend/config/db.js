import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_platform');
    console.log(`[db] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[db] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
