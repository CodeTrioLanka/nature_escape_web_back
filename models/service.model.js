import mongoose from "mongoose";

const servicePageSchema = new mongoose.Schema({
    // Service Heroes section (array of objects)
    serviceheroes: [{
        heroImage: String,
        title: String,
        subtitle: String,
        description: String
    }],

    // Services section (array of objects)
    services: [{
        title: String,
        description: String,
        image: String
    }]
}, { timestamps: true });

export default mongoose.model("ServicePage", servicePageSchema);
