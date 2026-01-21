import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  title: String,
  subtitle:String,
  year_of_exp:Number,
  expert_Team_members:Number,
  total_tours:Number,
  happy_travelers:Number,
  gallery: [String],
  homebg:String,
  destinationImage:String,
  personalizedImage:String

  
}, { timestamps: true });

export default mongoose.model("home", homeSchema);