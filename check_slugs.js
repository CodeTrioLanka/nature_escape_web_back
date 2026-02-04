import mongoose from "mongoose";
import excursionModel from "./models/excursions.model.js";
import { application } from "./config/application.js";
import dotenv from 'dotenv';
dotenv.config();

const checkSlugs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nature_escape");
        console.log("Connected to MongoDB");

        const excursionsPromise = await excursionModel.find({});
        console.log(`Found ${excursionsPromise.length} documents.`);

        excursionsPromise.forEach((doc, index) => {
            console.log(`Document ${index}:`);
            if (doc.excursion && Array.isArray(doc.excursion)) {
                doc.excursion.forEach((item, i) => {
                    console.log(`  Item ${i}: Title="${item.title}", Slug="${item.slug}"`);
                });
            } else {
                console.log("  No excursion array found.");
            }
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

checkSlugs();
