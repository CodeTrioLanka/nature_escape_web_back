import mongoose from "mongoose";

const excursionsSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    category: String,
    time: String,
    slug: String
}, { timestamps: true });

export default mongoose.model("excursions", excursionsSchema);