// import { de } from "zod/locales";
import aboutUs from "../models/aboutUs.model.js";

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
        const aboutUsData = new aboutUs(req.body);
        const savedData = await aboutUsData.save();

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