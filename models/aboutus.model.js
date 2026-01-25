import mongoose from "mongoose";

const aboutUsSchema = new mongoose.Schema({
    // Stats section
    yearExperience: Number,
    happyTravelers: Number,
    toursCompleted: Number,
    destination: Number,

    // Milestones section
    year: Number,
    event: String,
    mstone_description: String,

    // Values section 
    icon: String,
    title: String,
    description: String,
    color: String,

    // Team Members section
    name: String,
    role: String,
    image: String,
    bio: String
}, { timestamps: true });

export default mongoose.model("aboutus", aboutUsSchema);