import excursionModel from "../models/excursions.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";

// Add Excursion Page Data
export const addExcursion = async (req, res) => {
    try {
        // Parse the data sent as JSON string
        const excursionData = JSON.parse(req.body.data || "{}");

        // Initialize arrays if not present
        const excursionHeroes = excursionData.excursionHeroes || [];
        const excursion = excursionData.excursion || [];

        // Handle hero images (excursionHeroes)
        if (req.files && req.files.heroImages) {
            for (let i = 0; i < req.files.heroImages.length; i++) {
                const file = req.files.heroImages[i];
                const url = await uploadToCloudinary(file.buffer);

                // Assign image to the corresponding item if it exists
                if (excursionHeroes[i]) {
                    excursionHeroes[i].heroImage = url;
                }
            }
        }
        excursionData.excursionHeroes = excursionHeroes;

        // Handle excursion images (excursion)
        if (req.files && req.files.excursionImages) {
            for (let i = 0; i < req.files.excursionImages.length; i++) {
                const file = req.files.excursionImages[i];
                const url = await uploadToCloudinary(file.buffer);

                // Assign image to the corresponding item if it exists
                if (excursion[i]) {
                    excursion[i].image = url;
                }
            }
        }

        // Generate slugs for excursions
        if (excursion && excursion.length > 0) {
            excursion.forEach(item => {
                if (item.title) {
                    item.slug = item.title
                        .toLowerCase()
                        .replace(/ /g, "-")
                        .replace(/[^\w-]+/g, "");
                }
            });
        }

        excursionData.excursion = excursion;

        const newExcursion = await excursionModel.create(excursionData);
        res.status(201).json(newExcursion);
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get All Excursion Data
export const getExcursion = async (req, res) => {
    try {
        const excursions = await excursionModel.find().sort({ createdAt: -1 });
        res.status(200).json(excursions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Excursion by Slug
export const getExcursionBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await excursionModel.findOne(
            { "excursion.slug": slug },
            { "excursion.$": 1 }
        );

        if (!result || !result.excursion || result.excursion.length === 0) {
            return res.status(404).json({ message: "Excursion not found" });
        }

        res.status(200).json(result.excursion[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Excursion Data
export const updateExcursion = async (req, res) => {
    try {
        const existingExcursion = await excursionModel.findById(req.params.id);
        if (!existingExcursion) {
            return res.status(404).json({ message: "Excursion data not found" });
        }

        const excursionData = JSON.parse(req.body.data || "{}");

        // Ensure arrays exist in update data or fallback to existing
        let excursionHeroes = excursionData.excursionHeroes || existingExcursion.excursionHeroes || [];
        let excursion = excursionData.excursion || existingExcursion.excursion || [];

        // Handle hero images update
        if (req.files && req.files.heroImages) {
            for (let i = 0; i < req.files.heroImages.length; i++) {
                const file = req.files.heroImages[i];

                // Delete old image if updating an existing item that has an image
                if (existingExcursion.excursionHeroes && existingExcursion.excursionHeroes[i]?.heroImage) {
                    await deleteFromCloudinary(existingExcursion.excursionHeroes[i].heroImage);
                }

                const url = await uploadToCloudinary(file.buffer);

                if (excursionHeroes[i]) {
                    excursionHeroes[i].heroImage = url;
                }
            }
        }
        excursionData.excursionHeroes = excursionHeroes;

        // Handle excursion images update
        if (req.files && req.files.excursionImages) {
            for (let i = 0; i < req.files.excursionImages.length; i++) {
                const file = req.files.excursionImages[i];

                if (existingExcursion.excursion && existingExcursion.excursion[i]?.image) {
                    await deleteFromCloudinary(existingExcursion.excursion[i].image);
                }

                const url = await uploadToCloudinary(file.buffer);

                if (excursion[i]) {
                    excursion[i].image = url;
                }
            }
        }

        // Update slugs if titles changed
        if (excursion && excursion.length > 0) {
            excursion.forEach(item => {
                if (item.title) {
                    item.slug = item.title
                        .toLowerCase()
                        .replace(/ /g, "-")
                        .replace(/[^\w-]+/g, "");
                }
            });
        }

        excursionData.excursion = excursion;

        const updatedExcursion = await excursionModel.findByIdAndUpdate(
            req.params.id,
            excursionData,
            { new: true }
        );
        res.status(200).json(updatedExcursion);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete Excursion Data
export const deleteExcursion = async (req, res) => {
    try {
        const excursionData = await excursionModel.findById(req.params.id);
        if (!excursionData) {
            return res.status(404).json({ message: "Excursion data not found" });
        }

        // Delete hero images
        if (excursionData.excursionHeroes && excursionData.excursionHeroes.length > 0) {
            for (const item of excursionData.excursionHeroes) {
                if (item.heroImage) {
                    await deleteFromCloudinary(item.heroImage);
                }
            }
        }

        // Delete excursion images
        if (excursionData.excursion && excursionData.excursion.length > 0) {
            for (const item of excursionData.excursion) {
                if (item.image) {
                    await deleteFromCloudinary(item.image);
                }
            }
        }

        await excursionModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Excursion data deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Excursion Filters
export const getExcursionFilters = async (req, res) => {
    try {
        // Query distinct values from the nested 'excursion' array across all documents
        const time = await excursionModel.distinct("excursion.time");
        const destination = await excursionModel.distinct("excursion.destination");
        const category = await excursionModel.distinct("excursion.category");

        res.status(200).json({
            time: ["All", ...time],
            destination: ["All", ...destination],
            category: ["All", ...category]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};