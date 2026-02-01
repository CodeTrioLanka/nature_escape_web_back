import mongoose from "mongoose";

const thingsToDoSchema = new mongoose.Schema({
    // Things To Do Heroes section (array of objects)
    thingsToDoHeroes: [{
        heroImage: String,
        title: String,
        subtitle: String,
        description: String,
    }],

    // Things To Do section (array of objects)
    thingsToDo: [{
        title: String,
        description: String,
        image: String
    }]
}, { timestamps: true });

export default mongoose.model("ThingsToDo", thingsToDoSchema);