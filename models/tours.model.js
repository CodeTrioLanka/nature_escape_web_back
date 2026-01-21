import mongoose from "mongoose";

const toursSchema = new mongoose.Schema(
  {
    tourname: String,
  },
  { timestamps: true },
);

export default mongoose.model("tour", toursSchema);
