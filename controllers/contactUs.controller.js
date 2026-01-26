import contactUs from '../models/contactUs.model.js';

export const getData = async (req, res) => {
    try {
        const data = await contactUs.find();
        
        res.status(200).json({
            success: true,
            message: "Contact us data fetched successfully",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to get contact us data",
            details: error.message
        });
    }
};

export const setData = async (req, res) => {
    try {
        const contactUsData = new contactUs(req.body);
        const savedData = await contactUsData.save(); 

        res.status(201).json({
            success: true,
            message: "Contact us data saved successfully",
            data: savedData
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to set contact us data",     
            details: error.message
        });
    }   
}; 