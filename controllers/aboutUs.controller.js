import aboutUs from "../models/aboutUs.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";


export const getData = async (req, res) => {
    try {
        const data = await aboutUs.find();

        res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get about us data",
            details: error.message
        });
    }
};

export const setData = async (req, res) => {
    try {
        const aboutUsData = { ...req.body };

        // Parse hero section text fields if they exist
        if (req.body['hero[heroTitle]'] || req.body['hero[heroDescription]']) {
            if (!aboutUsData.hero) {
                aboutUsData.hero = {};
            }
            if (req.body['hero[heroTitle]']) {
                aboutUsData.hero.heroTitle = req.body['hero[heroTitle]'];
            }
            if (req.body['hero[heroDescription]']) {
                aboutUsData.hero.heroDescription = req.body['hero[heroDescription]'];
            }
            // Clean up the flat fields
            if (req.body['hero[heroBackground]']) {
                aboutUsData.hero.heroBackground = req.body['hero[heroBackground]'];
            }
            delete aboutUsData['hero[heroTitle]'];
            delete aboutUsData['hero[heroDescription]'];
            delete aboutUsData['hero[heroBackground]'];
        }

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            // Process hero background image
            const heroBackgroundFile = req.files.find(file => file.fieldname === 'hero[heroBackground]');
            if (heroBackgroundFile) {
                const cloudinaryUrl = await uploadToCloudinary(heroBackgroundFile.buffer);
                if (!aboutUsData.hero) {
                    aboutUsData.hero = {};
                }
                aboutUsData.hero.heroBackground = cloudinaryUrl;
            }

            // Process team member images
            if (aboutUsData.team) {
                for (let i = 0; i < aboutUsData.team.length; i++) {
                    const imageFile = req.files.find(file => file.fieldname === `team[${i}][image]`);
                    if (imageFile) {
                        const cloudinaryUrl = await uploadToCloudinary(imageFile.buffer);
                        aboutUsData.team[i].image = cloudinaryUrl;
                    }
                }
            }
        }

        const savedData = await aboutUs.create(aboutUsData);

        res.status(201).json({
            success: true,
            message: "About us data saved successfully",
            data: savedData
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to set about us data",
            details: error.message
        });
    }
};

export const updateData = async (req, res) => {
    try {
        const existingData = await aboutUs.findById(req.params.id);
        if (!existingData) {
            return res.status(404).json({ error: "About us data not found" });
        }

        const aboutUsData = { ...req.body };

        // Parse hero section text fields if they exist
        if (req.body['hero[heroTitle]'] || req.body['hero[heroDescription]']) {
            if (!aboutUsData.hero) {
                aboutUsData.hero = {};
            }
            if (req.body['hero[heroTitle]']) {
                aboutUsData.hero.heroTitle = req.body['hero[heroTitle]'];
            }
            if (req.body['hero[heroDescription]']) {
                aboutUsData.hero.heroDescription = req.body['hero[heroDescription]'];
            }
            // Clean up the flat fields
            if (req.body['hero[heroBackground]']) {
                aboutUsData.hero.heroBackground = req.body['hero[heroBackground]'];
            }
            delete aboutUsData['hero[heroTitle]'];
            delete aboutUsData['hero[heroDescription]'];
            delete aboutUsData['hero[heroBackground]'];
        }

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            // Process hero background image
            const heroBackgroundFile = req.files.find(file => file.fieldname === 'hero[heroBackground]');
            if (heroBackgroundFile) {
                // Delete old hero background if exists
                if (existingData.hero && existingData.hero.heroBackground) {
                    await deleteFromCloudinary(existingData.hero.heroBackground);
                }

                const cloudinaryUrl = await uploadToCloudinary(heroBackgroundFile.buffer);
                if (!aboutUsData.hero) {
                    aboutUsData.hero = {};
                }
                aboutUsData.hero.heroBackground = cloudinaryUrl;
            }

            // Process team member images
            if (aboutUsData.team) {
                for (let i = 0; i < aboutUsData.team.length; i++) {
                    const imageFile = req.files.find(file => file.fieldname === `team[${i}][image]`);
                    if (imageFile) {
                        // Delete old image if exists
                        if (existingData.team && existingData.team[i] && existingData.team[i].image) {
                            await deleteFromCloudinary(existingData.team[i].image);
                        }

                        const cloudinaryUrl = await uploadToCloudinary(imageFile.buffer);
                        aboutUsData.team[i].image = cloudinaryUrl;
                    }
                }
            }
        }

        const updatedData = await aboutUs.findByIdAndUpdate(req.params.id, aboutUsData, {
            new: true,
        });

        res.json({
            success: true,
            message: "About us data updated successfully",
            data: updatedData
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to update about us data",
            details: error.message
        });
    }
};

export const deleteData = async (req, res) => {
    try {
        const data = await aboutUs.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ error: "About us data not found" });
        }

        // Delete hero background image from Cloudinary
        if (data.hero && data.hero.heroBackground) {
            await deleteFromCloudinary(data.hero.heroBackground);
        }

        // Delete team member images from Cloudinary
        if (data.team && data.team.length > 0) {
            for (const member of data.team) {
                if (member.image) {
                    await deleteFromCloudinary(member.image);
                }
            }
        }

        await aboutUs.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "About us data deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to delete about us data",
            details: error.message
        });
    }
};