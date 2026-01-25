import mongoose from "mongoose";

const aboutUsSchema = new mongoose.Schema({
    phoneNumber: [Number],
    email: [String],
    address: [String],
    bussinessHours: [String]
}, { timestamps: true });

export const AboutUs = mongoose.model("aboutUs", aboutUsSchema);