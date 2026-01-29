import mongoose from "mongoose";

const thingsToDoSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String
}, { timestamps: true });

export default mongoose.model("ThingsToDo", thingsToDoSchema);