import ServicePageModel from '../models/service.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';
import { logAction } from '../utils/logger.js';

// --- PUBLIC / COMBINED DATA ---
export const getServicePageData = async (req, res) => {
    try {
        const data = await ServicePageModel.findOne();
        if (!data) {
            return res.status(200).json({ hero: null, services: [] });
        }
        res.status(200).json({
            hero: data.serviceheroes?.[0] || null,
            services: data.services || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- HERO SECTION ---
export const getServiceHero = async (req, res) => {
    try {
        const data = await ServicePageModel.findOne();
        res.status(200).json({ hero: data?.serviceheroes?.[0] || null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const setServiceHero = async (req, res) => {
    try {
        let heroData = req.body.data ? JSON.parse(req.body.data) : req.body;

        let doc = await ServicePageModel.findOne();
        if (!doc) {
            doc = new ServicePageModel({ serviceheroes: [], services: [] });
        }

        const oldHero = doc.serviceheroes?.[0];
        const oldImage = oldHero?.heroImage;
        let newImage = heroData.heroImage;

        if (req.file) {
            newImage = await uploadToCloudinary(req.file.buffer);
            heroData.heroImage = newImage;
        }

        // Delete old image if it was replaced
        if (oldImage && newImage && oldImage !== newImage) {
            await deleteFromCloudinary(oldImage);
        }

        // Remove _id to prevent modification errors on sub-document
        delete heroData._id;

        doc.serviceheroes = [heroData];
        await doc.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "UPDATE_SERVICE_HERO", {
                heroTitle: heroData.heroTitle || "Service Hero"
            });
        }

        res.status(200).json({ hero: doc.serviceheroes[0], message: 'Hero saved successfully' });
    } catch (error) {
        console.error('Error saving hero:', error);
        res.status(500).json({ error: error.message });
    }
};

// --- INDIVIDUAL SERVICES ---
export const getServices = async (req, res) => {
    try {
        const data = await ServicePageModel.findOne();
        res.status(200).json({ services: data?.services || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const data = await ServicePageModel.findOne();
        const service = data?.services?.id(req.params.id);
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.status(200).json({ service });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addService = async (req, res) => {
    try {
        console.log('Adding new service. Data:', req.body.data);
        console.log('File received:', req.file ? 'Yes' : 'No');

        let serviceData = req.body.data ? JSON.parse(req.body.data) : req.body;
        if (req.file) {
            serviceData.image = await uploadToCloudinary(req.file.buffer);
        }

        let doc = await ServicePageModel.findOne();
        if (!doc) doc = new ServicePageModel({ serviceheroes: [], services: [] });

        doc.services.push(serviceData);
        await doc.save();

        const newService = doc.services[doc.services.length - 1];

        // Log the action
        if (req.user) {
            await logAction(req.user, "CREATE_SERVICE", {
                serviceId: newService._id,
                serviceName: newService.title || "Service"
            });
        }

        console.log('Service added successfully:', newService._id);
        res.status(201).json({ service: newService });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        console.log('Updating service:', req.params.id);
        console.log('Data:', req.body.data);
        console.log('File received:', req.file ? 'Yes' : 'No');

        let serviceData = req.body.data ? JSON.parse(req.body.data) : req.body;

        // Try to find the specific document
        let doc = await ServicePageModel.findOne({ "services._id": req.params.id });

        // FAIL SAFE: If specific query fails, just get the first singleton document and try to find it there
        // This handles cases where _id querying on subdocs might be acting up in this specific Mongoose version
        if (!doc) {
            console.log('UpdateService: Direct query failed, falling back to singleton check...');
            doc = await ServicePageModel.findOne();
        }

        if (!doc) {
            return res.status(404).json({ error: 'No ServicePage document found' });
        }

        console.log('UpdateService: Using doc:', doc._id);
        const service = doc.services.find(s => s._id.toString() === req.params.id);

        if (!service) {
            console.log('UpdateService: Service ID', req.params.id, 'not found inside doc', doc._id);
            // Log available IDs to debug console so the user can see mismatches
            const available = doc.services.map(s => s._id.toString());
            console.log('Available IDs:', available);
            return res.status(404).json({
                error: 'Individual service not found',
                debug: { requested: req.params.id, available }
            });
        }

        const oldImage = service.image;
        let newImage = serviceData.image;

        if (req.file) {
            newImage = await uploadToCloudinary(req.file.buffer);
            serviceData.image = newImage;
        }

        // Delete old image if it's different and was a Cloudinary image
        if (oldImage && newImage && oldImage !== newImage) {
            console.log('Deleting old image from Cloudinary:', oldImage);
            await deleteFromCloudinary(oldImage);
        }

        // Remove _id from serviceData to prevent Mongoose errors when updating sub-document
        delete serviceData._id;

        // Use .set() for reliable sub-document updates in Mongoose
        console.log('Final serviceData before set:', serviceData);
        service.set(serviceData);
        await doc.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "UPDATE_SERVICE", {
                serviceId: service._id,
                serviceName: service.title || "Service",
                updatedFields: Object.keys(serviceData)
            });
        }

        console.log('Service updated successfully');
        res.status(200).json({ service });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const doc = await ServicePageModel.findOne({ "services._id": req.params.id });
        if (!doc) return res.status(404).json({ error: 'Service not found' });

        const service = doc.services.find(s => s._id.toString() === req.params.id);
        if (!service) return res.status(404).json({ error: 'Service subdocument not found' });

        if (service.image) await deleteFromCloudinary(service.image);

        // Use pull to remove the subdocument reliable
        doc.services.pull({ _id: req.params.id });
        await doc.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "DELETE_SERVICE", {
                serviceId: service._id,
                serviceName: service.title || "Service"
            });
        }

        res.status(200).json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
