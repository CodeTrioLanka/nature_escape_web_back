import aboutUs from "../models/aboutUs.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
import fs from "fs";

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

        // Handle image uploads for team members
        if (req.files && req.files.length > 0) {
            // Process team member images
            if (aboutUsData.team) {
                for (let i = 0; i < aboutUsData.team.length; i++) {
                    const imageFile = req.files.find(file => file.fieldname === `team[${i}][image]`);
                    if (imageFile) {
                        const filePath = imageFile.path || imageFile.buffer;
                        const cloudinaryUrl = await uploadToCloudinary(filePath);
                        aboutUsData.team[i].image = cloudinaryUrl;
                        
                        if (imageFile.path) {
                            fs.unlinkSync(imageFile.path);
                        }
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

        // Handle image uploads for team members
        if (req.files && req.files.length > 0) {
            // Process team member images
            if (aboutUsData.team) {
                for (let i = 0; i < aboutUsData.team.length; i++) {
                    const imageFile = req.files.find(file => file.fieldname === `team[${i}][image]`);
                    if (imageFile) {
                        // Delete old image if exists
                        if (existingData.team && existingData.team[i] && existingData.team[i].image) {
                            await deleteFromCloudinary(existingData.team[i].image);
                        }
                        
                        const filePath = imageFile.path || imageFile.buffer;
                        const cloudinaryUrl = await uploadToCloudinary(filePath);
                        aboutUsData.team[i].image = cloudinaryUrl;
                        
                        if (imageFile.path) {
                            fs.unlinkSync(imageFile.path);
                        }
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