import excursionModel from "../models/excursions.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";

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
        excursionData.excursion = excursion;

        const newExcursion = await excursionModel.create(excursionData);
        res.status(201).json(newExcursion);
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getExcursion = async (req, res) => {
    try {
        const excursions = await excursionModel.find().sort({ createdAt: -1 });
        res.status(200).json(excursions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateExcursion = async (req, res) => {
    try {
        const existingExcursion = await excursionModel.findById(req.params.id);
        if (!existingExcursion) {
            return res.status(404).json({ message: "Excursion not found" });
        }

        const excursionData = JSON.parse(req.body.data || "{}");

        // Ensure arrays exist
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

export const deleteExcursion = async (req, res) => {
    try {
        const excursionPage = await excursionModel.findById(req.params.id);
        if (!excursionPage) {
            return res.status(404).json({ message: "Excursion data not found" });
        }

        // Delete hero images
        if (excursionPage.excursionHeroes && excursionPage.excursionHeroes.length > 0) {
            for (const item of excursionPage.excursionHeroes) {
                if (item.heroImage) {
                    await deleteFromCloudinary(item.heroImage);
                }
            }
        }

        // Delete excursion images
        if (excursionPage.excursion && excursionPage.excursion.length > 0) {
            for (const item of excursionPage.excursion) {
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
// Adapting this since data is now nested in arrays within a document(s)
// We'll aggregate from all documents (though likely there's only one main one)
export const getExcursionFilters = async (req, res) => {
    try {
        const excursionsDocs = await excursionModel.find({});

        const times = new Set();
        const destinations = new Set();
        const categories = new Set();

        excursionsDocs.forEach(doc => {
            if (doc.excursion && Array.isArray(doc.excursion)) {
                doc.excursion.forEach(item => {
                    if (item.time) times.add(item.time);
                    if (item.destination) destinations.add(item.destination);
                    if (item.category) categories.add(item.category);
                });
            }
        });

        res.status(200).json({
            time: ["All", ...Array.from(times)],
            destination: ["All", ...Array.from(destinations)],
            category: ["All", ...Array.from(categories)]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
