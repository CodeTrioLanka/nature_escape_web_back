import excursionModel from "../models/excursions.model.js";
import { logAction } from "../utils/logger.js";

// Add Excursion
export const addExcursion = async (req, res) => {
    try {
        const { title, image, description, category, time, destination } = req.body;

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        const newExcursion = new excursionModel({
            title,
            image,
            description,
            category,
            time,
            destination,
            slug
        });

        await newExcursion.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "CREATE_EXCURSION", {
                excursionId: newExcursion._id,
                title: newExcursion.title,
                slug: newExcursion.slug
            });
        }

        res.status(201).json(newExcursion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Excursions
export const getExcursion = async (req, res) => {
    try {
        const excursions = await excursionModel.find();
        res.status(200).json(excursions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Excursion
export const updateExcursion = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedExcursion = await excursionModel.findByIdAndUpdate(id, req.body, { new: true });

        // Log the action
        if (req.user) {
            await logAction(req.user, "UPDATE_EXCURSION", {
                excursionId: updatedExcursion._id,
                title: updatedExcursion.title,
                updatedFields: Object.keys(req.body)
            });
        }

        res.status(200).json(updatedExcursion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Excursion
export const deleteExcursion = async (req, res) => {
    try {
        const { id } = req.params;
        const excursion = await excursionModel.findById(id);
        await excursionModel.findByIdAndDelete(id);

        // Log the action
        if (req.user) {
            await logAction(req.user, "DELETE_EXCURSION", {
                excursionId: id,
                title: excursion?.title || "Excursion"
            });
        }

        res.status(200).json({ message: "Excursion deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Excursion Filters
export const getExcursionFilters = async (req, res) => {
    try {
        const time = await excursionModel.distinct("time");
        const destination = await excursionModel.distinct("destination");
        const category = await excursionModel.distinct("category");

        res.status(200).json({
            time: ["All", ...time],
            destination: ["All", ...destination],
            category: ["All", ...category]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};