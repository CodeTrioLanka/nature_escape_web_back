import serviceModel from '../models/services.model.js';

export const addService = async (req, res) => {
    try {
        const newService = new serviceModel(req.body);
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getServices = async (req, res) => {
    try {
        const services = await serviceModel.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const updatedService = await serviceModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        await serviceModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
