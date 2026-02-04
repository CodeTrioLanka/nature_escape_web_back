import mongoose from "mongoose";

const excursionsSchema = new mongoose.Schema({
    // Excursion To Do Heroes section (array of objects)
    excursionHeroes: [{
        heroImage: String,
        title: String,
        subtitle: String,
        description: String,
    }],

    // Excursion To Do section (array of objects)
    excursion: [{
        title: String,
        image: String,
        description: String,
        category: String,
        time: String,
        destination: String,
        slug: String
    }]
}, { timestamps: true });

export default mongoose.model("excursions", excursionsSchema);