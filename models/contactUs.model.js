import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    googleMap: {
        type: String,
        required: true,
    },
    socials: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
    }
}, { timestamps: true });

export default mongoose.model("ContactUs", contactUsSchema);
