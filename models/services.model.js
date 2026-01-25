import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema({
    title: String,
    image: String,
    slug: String,
    paragraphs: String
}, { timestamps: true });

export default mongoose.model("Services", servicesSchema);