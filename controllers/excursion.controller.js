import excursionModel from "../models/excursions.model.js";

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
        res.status(200).json(updatedExcursion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Excursion
export const deleteExcursion = async (req, res) => {
    try {
        const { id } = req.params;
        await excursionModel.findByIdAndDelete(id);
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