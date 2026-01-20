import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  title: String,
  
}, { timestamps: true });

export default mongoose.model("home", homeSchema);