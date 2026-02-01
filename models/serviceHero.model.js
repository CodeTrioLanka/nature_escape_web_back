import mongoose from "mongoose";

const serviceHeroSchema = new mongoose.Schema({
    heroImage: String,
    title: String,
    subtitle: String,
    description: String,
}, { timestamps: true });

export default mongoose.model("ServiceHero", serviceHeroSchema);
