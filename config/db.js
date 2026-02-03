import mongoose from 'mongoose';
import { application } from './application.js';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(application.MONGO_URL, {
    bufferCommands: false,
  });
};

export default connectDB;