import mongoose from "mongoose";

const aboutUsSchema = new mongoose.Schema({
    // Stats section (single object)
    stats: {
        yearExperience: Number,
        happyTravelers: Number,
        toursCompleted: Number,
        destination: Number
    },

    // Milestones section (array of objects)
    milestones: [{
        year: Number,
        event: String,
        mstone_description: String
    }],

    // Values section (array of objects)
    values: [{
        icon: String,
        title: String,
        description: String,
        color: String
    }],

    // Team Members section (array of objects)
    team: [{
        name: String,
        role: String,
        image: String,
        bio: String
    }]
}, { timestamps: true });

export default mongoose.model("aboutus", aboutUsSchema);