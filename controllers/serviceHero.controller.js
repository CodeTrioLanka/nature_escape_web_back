import serviceHeroModel from '../models/serviceHero.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';

// Get service hero data
export const getServiceHero = async (req, res) => {
    try {
        const hero = await serviceHeroModel.findOne().sort({ createdAt: -1 });
        res.status(200).json({ hero });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create service hero data
export const setServiceHero = async (req, res) => {
    try {
        let heroData = {};

        // Handle multipart form data with image
        if (req.file) {
            heroData = JSON.parse(req.body.data || '{}');
            heroData.heroImage = await uploadToCloudinary(req.file.buffer);
        } else if (req.body.data) {
            heroData = JSON.parse(req.body.data);
        } else {
            heroData = req.body;
        }

        const newHero = new serviceHeroModel(heroData);
        const savedHero = await newHero.save();
        res.status(201).json({
            hero: savedHero,
            message: 'Service hero created successfully'
        });
    } catch (error) {
        console.error('Create service hero error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update service hero data
export const updateServiceHero = async (req, res) => {
    try {
        const existingHero = await serviceHeroModel.findById(req.params.id);
        if (!existingHero) {
            return res.status(404).json({ error: 'Service hero not found' });
        }

        let heroData = {};

        // Handle multipart form data with image
        if (req.file) {
            heroData = JSON.parse(req.body.data || '{}');

            // Delete old image from Cloudinary if exists
            if (existingHero.heroImage) {
                await deleteFromCloudinary(existingHero.heroImage);
            }

            // Upload new image
            heroData.heroImage = await uploadToCloudinary(req.file.buffer);
        } else if (req.body.data) {
            heroData = JSON.parse(req.body.data);
        } else {
            heroData = req.body;
        }

        const updatedHero = await serviceHeroModel.findByIdAndUpdate(
            req.params.id,
            heroData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            hero: updatedHero,
            message: 'Service hero updated successfully'
        });
    } catch (error) {
        console.error('Update service hero error:', error);
        res.status(500).json({ error: error.message });
    }
};
