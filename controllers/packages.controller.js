import Package from "../models/packages.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
import { logAction } from "../utils/logger.js";

export const packageGet = async (req, res) => {
    try {
        const packages = await Package.find({ isActive: true })
            .populate("tourCategory")

            .sort({ displayOrder: 1, createdAt: -1 });
        res.json({ packages });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch packages" });
    }
};

export const packageGetById = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id)
            .populate("tourCategory")

        if (!pkg) {
            return res.status(404).json({ error: "Package not found" });
        }
        res.json({ package: pkg });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch package" });
    }
};

export const packageGetBySlug = async (req, res) => {
    try {
        const pkg = await Package.findOne({ slug: req.params.slug })
            .populate("tourCategory")

        if (!pkg) {
            return res.status(404).json({ error: "Package not found" });
        }
        res.json({ package: pkg });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch package" });
    }
};

export const packageGetByCategory = async (req, res) => {
    try {
        const packages = await Package.find({
            tourCategory: req.params.categoryId,
            isActive: true
        })
            .select("_id slug packageName overview.duration hero.backgroundImage hero.title displayOrder")
            .sort({ displayOrder: 1, createdAt: -1 });
        res.json({ packages });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch packages" });
    }
};

export const packageCreate = async (req, res) => {
    try {
        const packageData = JSON.parse(req.body.data || "{}");

        // Handle hero background image
        if (req.files && req.files.heroBackground) {
            const file = req.files.heroBackground[0];
            packageData.hero = packageData.hero || {};
            packageData.hero.backgroundImage = await uploadToCloudinary(file.buffer);
        }

        // Handle map image
        if (req.files && req.files.mapImage) {
            const file = req.files.mapImage[0];
            packageData.map = packageData.map || {};
            packageData.map.image = await uploadToCloudinary(file.buffer);
        }

        // Handle gallery images
        if (req.files && req.files.galleryImages) {
            const galleryUrls = [];
            for (const file of req.files.galleryImages) {
                const url = await uploadToCloudinary(file.buffer);
                galleryUrls.push(url);
            }
            packageData.galleries = packageData.galleries || [{}];
            packageData.galleries[0].images = galleryUrls;
        }

        // Handle attraction images
        if (req.files && req.files.attractionImages) {
            packageData.attractions = packageData.attractions || [];
            for (let i = 0; i < req.files.attractionImages.length; i++) {
                const file = req.files.attractionImages[i];
                const url = await uploadToCloudinary(file.buffer);
                if (packageData.attractions[i]) {
                    packageData.attractions[i].image = url;
                }
            }
        }

        const pkg = await Package.create(packageData);

        // Log the action
        if (req.user) {
            await logAction(req.user, "CREATE_PACKAGE", {
                packageId: pkg._id,
                packageName: pkg.packageName,
                slug: pkg.slug,
                tourCategory: pkg.tourCategory
            });
        }

        res.status(201).json({ package: pkg, message: "Package created successfully" });
    } catch (error) {
        console.error('Create error:', error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `A package with this ${field} already exists. Please use a unique ${field}.` });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ error: `Validation failed: ${messages}` });
        }

        res.status(400).json({ error: error.message || 'Failed to create package' });
    }
};

export const packageEdit = async (req, res) => {
    try {
        const existingPackage = await Package.findById(req.params.id);
        if (!existingPackage) {
            return res.status(404).json({ error: "Package not found" });
        }

        const packageData = JSON.parse(req.body.data || "{}");

        // Handle hero background image update
        if (req.files && req.files.heroBackground) {
            if (existingPackage.hero?.backgroundImage) {
                await deleteFromCloudinary(existingPackage.hero.backgroundImage);
            }
            const file = req.files.heroBackground[0];
            packageData.hero = packageData.hero || {};
            packageData.hero.backgroundImage = await uploadToCloudinary(file.buffer);
        }

        // Handle map image update
        if (req.files && req.files.mapImage) {
            if (existingPackage.map?.image) {
                await deleteFromCloudinary(existingPackage.map.image);
            }
            const file = req.files.mapImage[0];
            packageData.map = packageData.map || {};
            packageData.map.image = await uploadToCloudinary(file.buffer);
        }

        // Handle gallery images update
        if (req.files && req.files.galleryImages) {
            // Delete old gallery images
            if (existingPackage.galleries && existingPackage.galleries[0]?.images) {
                for (const imageUrl of existingPackage.galleries[0].images) {
                    await deleteFromCloudinary(imageUrl);
                }
            }

            const galleryUrls = [];
            for (const file of req.files.galleryImages) {
                const url = await uploadToCloudinary(file.buffer);
                galleryUrls.push(url);
            }
            packageData.galleries = packageData.galleries || [{}];
            packageData.galleries[0].images = galleryUrls;
        }

        // Handle attraction images update
        if (req.files && req.files.attractionImages) {
            for (let i = 0; i < req.files.attractionImages.length; i++) {
                const file = req.files.attractionImages[i];

                // Delete old attraction image if exists
                if (existingPackage.attractions && existingPackage.attractions[i]?.image) {
                    await deleteFromCloudinary(existingPackage.attractions[i].image);
                }

                const url = await uploadToCloudinary(file.buffer);
                packageData.attractions = packageData.attractions || [];
                if (packageData.attractions[i]) {
                    packageData.attractions[i].image = url;
                }
            }
        }

        const pkg = await Package.findByIdAndUpdate(req.params.id, packageData, {
            new: true,
        });

        // Log the action
        if (req.user) {
            await logAction(req.user, "UPDATE_PACKAGE", {
                packageId: pkg._id,
                packageName: pkg.packageName,
                slug: pkg.slug,
                updatedFields: Object.keys(packageData)
            });
        }

        res.json({ package: pkg, message: "Package updated successfully" });
    } catch (error) {
        console.error('Update error:', error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ error: `A package with this ${field} already exists. Please use a unique ${field}.` });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ error: `Validation failed: ${messages}` });
        }

        res.status(400).json({ error: error.message || 'Failed to update package' });
    }
};

export const packageDelete = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) {
            return res.status(404).json({ error: "Package not found" });
        }

        // Delete hero background image
        if (pkg.hero?.backgroundImage) {
            await deleteFromCloudinary(pkg.hero.backgroundImage);
        }

        // Delete map image
        if (pkg.map?.image) {
            await deleteFromCloudinary(pkg.map.image);
        }

        // Delete gallery images
        if (pkg.galleries && pkg.galleries[0]?.images) {
            for (const imageUrl of pkg.galleries[0].images) {
                await deleteFromCloudinary(imageUrl);
            }
        }

        // Delete attraction images
        if (pkg.attractions && pkg.attractions.length > 0) {
            for (const attraction of pkg.attractions) {
                if (attraction.image) {
                    await deleteFromCloudinary(attraction.image);
                }
            }
        }

        await Package.findByIdAndDelete(req.params.id);

        // Log the action
        if (req.user) {
            await logAction(req.user, "DELETE_PACKAGE", {
                packageId: pkg._id,
                packageName: pkg.packageName,
                slug: pkg.slug
            });
        }

        res.json({ message: "Package deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

