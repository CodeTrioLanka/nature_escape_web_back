import serviceModel from '../models/services.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';

// Create a new service
export const addService = async (req, res) => {
    try {
        let serviceData = {};

        // Handle multipart form data with image
        if (req.file) {
            serviceData = JSON.parse(req.body.data || '{}');
            serviceData.image = await uploadToCloudinary(req.file.buffer);
        } else if (req.body.data) {
            serviceData = JSON.parse(req.body.data);
        } else {
            serviceData = req.body;
        }

        // Validation
        if (!serviceData.title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!serviceData.description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const newService = new serviceModel(serviceData);
        const savedService = await newService.save();
        res.status(201).json({
            service: savedService,
            message: 'Service created successfully'
        });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all services
export const getServices = async (req, res) => {
    try {
        const services = await serviceModel.find().sort({ createdAt: -1 });
        res.status(200).json({ services });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single service by ID
export const getServiceById = async (req, res) => {
    try {
        const service = await serviceModel.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json({ service });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update service by ID
export const updateService = async (req, res) => {
    try {
        const existingService = await serviceModel.findById(req.params.id);
        if (!existingService) {
            return res.status(404).json({ error: 'Service not found' });
        }

        let serviceData = {};

        // Handle multipart form data with image
        if (req.file) {
            serviceData = JSON.parse(req.body.data || '{}');

            // Delete old image from Cloudinary if exists
            if (existingService.image) {
                await deleteFromCloudinary(existingService.image);
            }

            // Upload new image
            serviceData.image = await uploadToCloudinary(req.file.buffer);
        } else if (req.body.data) {
            serviceData = JSON.parse(req.body.data);
        } else {
            serviceData = req.body;
        }

        const updatedService = await serviceModel.findByIdAndUpdate(
            req.params.id,
            serviceData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            service: updatedService,
            message: 'Service updated successfully'
        });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete service by ID
export const deleteService = async (req, res) => {
    try {
        const service = await serviceModel.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Delete image from Cloudinary if exists
        if (service.image) {
            await deleteFromCloudinary(service.image);
        }

        await serviceModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: error.message });
    }
};
