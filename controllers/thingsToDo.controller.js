import thingsToDoModel from '../models/thingsToDo.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";

export const addThingsToDo = async (req, res) => {
    try {
        // Parse the data sent as JSON string
        const thingsToDoData = JSON.parse(req.body.data || "{}");

        // Initialize arrays if not present
        const thingsToDoHeroes = thingsToDoData.thingsToDoHeroes || [];
        const thingsToDo = thingsToDoData.thingsToDo || [];

        // Handle hero images (thingsToDoHeroes)
        if (req.files && req.files.heroImages) {
            for (let i = 0; i < req.files.heroImages.length; i++) {
                const file = req.files.heroImages[i];
                const url = await uploadToCloudinary(file.buffer);

                // Assign image to the corresponding item if it exists
                if (thingsToDoHeroes[i]) {
                    thingsToDoHeroes[i].heroImage = url;
                }
            }
        }
        thingsToDoData.thingsToDoHeroes = thingsToDoHeroes;

        // Handle activity images (thingsToDo)
        if (req.files && req.files.activityImages) {
            for (let i = 0; i < req.files.activityImages.length; i++) {
                const file = req.files.activityImages[i];
                const url = await uploadToCloudinary(file.buffer);

                // Assign image to the corresponding item if it exists
                if (thingsToDo[i]) {
                    thingsToDo[i].image = url;
                }
            }
        }
        thingsToDoData.thingsToDo = thingsToDo;

        const newActivity = await thingsToDoModel.create(thingsToDoData);
        res.status(201).json(newActivity);
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getThingsToDo = async (req, res) => {
    try {
        const activities = await thingsToDoModel.find().sort({ createdAt: -1 });
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateThingsToDo = async (req, res) => {
    try {
        const existingActivity = await thingsToDoModel.findById(req.params.id);
        if (!existingActivity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        const thingsToDoData = JSON.parse(req.body.data || "{}");

        // Ensure arrays exist in update data or fallback to empty for processing
        // Ideally we should merge with existing if partial update, but simplified here assumes full object or handled by frontend
        let thingsToDoHeroes = thingsToDoData.thingsToDoHeroes || existingActivity.thingsToDoHeroes || [];
        let thingsToDo = thingsToDoData.thingsToDo || existingActivity.thingsToDo || [];

        // Handle hero images update
        if (req.files && req.files.heroImages) {
            for (let i = 0; i < req.files.heroImages.length; i++) {
                const file = req.files.heroImages[i];

                // Delete old image if updating an existing item that has an image
                // Note: logic assumes the file at index i corresponds to item at index i
                if (existingActivity.thingsToDoHeroes && existingActivity.thingsToDoHeroes[i]?.heroImage) {
                    await deleteFromCloudinary(existingActivity.thingsToDoHeroes[i].heroImage);
                }

                const url = await uploadToCloudinary(file.buffer);

                if (thingsToDoHeroes[i]) {
                    thingsToDoHeroes[i].heroImage = url;
                }
            }
        }
        thingsToDoData.thingsToDoHeroes = thingsToDoHeroes;

        // Handle activity images update
        if (req.files && req.files.activityImages) {
            for (let i = 0; i < req.files.activityImages.length; i++) {
                const file = req.files.activityImages[i];

                if (existingActivity.thingsToDo && existingActivity.thingsToDo[i]?.image) {
                    await deleteFromCloudinary(existingActivity.thingsToDo[i].image);
                }

                const url = await uploadToCloudinary(file.buffer);

                if (thingsToDo[i]) {
                    thingsToDo[i].image = url;
                }
            }
        }
        thingsToDoData.thingsToDo = thingsToDo;

        const updatedActivity = await thingsToDoModel.findByIdAndUpdate(
            req.params.id,
            thingsToDoData,
            { new: true }
        );
        res.status(200).json(updatedActivity);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteThingsToDo = async (req, res) => {
    try {
        const activity = await thingsToDoModel.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }

        // Delete hero images
        if (activity.thingsToDoHeroes && activity.thingsToDoHeroes.length > 0) {
            for (const item of activity.thingsToDoHeroes) {
                if (item.heroImage) {
                    await deleteFromCloudinary(item.heroImage);
                }
            }
        }

        // Delete activity images
        if (activity.thingsToDo && activity.thingsToDo.length > 0) {
            for (const item of activity.thingsToDo) {
                if (item.image) {
                    await deleteFromCloudinary(item.image);
                }
            }
        }

        await thingsToDoModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};