import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'superadmin'],
    default: 'user'
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
