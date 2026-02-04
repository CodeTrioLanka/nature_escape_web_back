import Tour from "../models/tours.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
import { logAction } from "../utils/logger.js";


export const tourGet = async (req, res) => {
    try {
        const tours = await Tour.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
        res.json({ tours });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tours" });
    }
};

export const tourGetById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ error: "Tour not found" });
        }
        res.json({ tour });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tour" });
    }
};

export const tourGetBySlug = async (req, res) => {
    try {
        const tour = await Tour.findOne({ slug: req.params.slug });
        if (!tour) {
            return res.status(404).json({ error: "Tour category not found" });
        }
        res.json({ tour });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tour category" });
    }
};

export const tourCreate = async (req, res) => {
    try {
        console.log('Create payload:', req.body);
        const tourData = { ...req.body };

        // Handle images array (expecting 2 images)
        if (req.files && req.files.images) {
            const imageUrls = [];
            for (const file of req.files.images) {
                // Use buffer instead of path (memory storage)
                const cloudinaryUrl = await uploadToCloudinary(file.buffer);
                imageUrls.push(cloudinaryUrl);
            }
            tourData.images = imageUrls;
        }

        // Handle scheduleImage upload
        if (req.files && req.files.scheduleImage) {
            const file = req.files.scheduleImage[0];
            const cloudinaryUrl = await uploadToCloudinary(file.buffer);
            tourData.scheduleImage = cloudinaryUrl;
        }

        const tour = await Tour.create(tourData);

        // Log the action
        if (req.user) {
            await logAction(req.user, "CREATE_TOUR", {
                tourId: tour._id,
                tourName: tour.name,
                slug: tour.slug
            });
        }

        res.status(201).json({ tour, message: "Tour created successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const tourEdit = async (req, res) => {
    try {
        console.log('Edit request received for ID:', req.params.id);
        console.log('Request body:', req.body);

        const existingTour = await Tour.findById(req.params.id);
        if (!existingTour) {
            return res.status(404).json({ error: "Tour not found" });
        }

        const tourData = { ...req.body };
        console.log('Tour data to update:', tourData);

        // Handle image uploads if any
        if (req.files && req.files.images) {
            // Delete old images from Cloudinary
            if (existingTour.images && existingTour.images.length > 0) {
                for (const imageUrl of existingTour.images) {
                    await deleteFromCloudinary(imageUrl);
                }
            }

            // Upload new images (use buffer instead of path)
            const imageUrls = [];
            for (const file of req.files.images) {
                const cloudinaryUrl = await uploadToCloudinary(file.buffer);
                imageUrls.push(cloudinaryUrl);
            }
            tourData.images = imageUrls;
        }

        // Handle scheduleImage upload
        if (req.files && req.files.scheduleImage) {
            // Delete old image
            if (existingTour.scheduleImage) {
                await deleteFromCloudinary(existingTour.scheduleImage);
            }
            const file = req.files.scheduleImage[0];
            const cloudinaryUrl = await uploadToCloudinary(file.buffer);
            tourData.scheduleImage = cloudinaryUrl;
        }
        // Handle direct URL updates (when images are pre-uploaded)
        else if (tourData.images && JSON.stringify(tourData.images) !== JSON.stringify(existingTour.images)) {
            // Delete old images that are not in the new images array
            if (existingTour.images && existingTour.images.length > 0) {
                for (const oldImageUrl of existingTour.images) {
                    if (!tourData.images.includes(oldImageUrl)) {
                        await deleteFromCloudinary(oldImageUrl);
                    }
                }
            }
        }

        // Handle scheduleImage URL update
        if (tourData.scheduleImage !== undefined && tourData.scheduleImage !== existingTour.scheduleImage) {
            if (existingTour.scheduleImage) {
                await deleteFromCloudinary(existingTour.scheduleImage);
            }
        }

        const tour = await Tour.findByIdAndUpdate(req.params.id, tourData, {
            new: true,
        });

        // Log the action
        if (req.user) {
            await logAction(req.user, "UPDATE_TOUR", {
                tourId: tour._id,
                tourName: tour.name,
                slug: tour.slug,
                updatedFields: Object.keys(tourData)
            });
        }

        console.log('Updated tour:', tour);
        res.json({ tour, message: "Tour updated successfully" });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ error: error.message });
    }
};

export const tourDelete = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        if (!tour) {
            return res.status(404).json({ error: "Tour not found" });
        }

        // Delete images from Cloudinary
        if (tour.images && tour.images.length > 0) {
            for (const imageUrl of tour.images) {
                await deleteFromCloudinary(imageUrl);
            }
        }

        if (tour.scheduleImage) {
            await deleteFromCloudinary(tour.scheduleImage);
        }

        await Tour.findByIdAndDelete(req.params.id);

        // Log the action
        if (req.user) {
            await logAction(req.user, "DELETE_TOUR", {
                tourId: tour._id,
                tourName: tour.name,
                slug: tour.slug
            });
        }

        res.json({ message: "Tour deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
