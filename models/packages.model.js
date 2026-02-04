import mongoose from "mongoose";

const packagesSchema = new mongoose.Schema(
    {
        packageName: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        tourCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tour",
            required: true,
        },
        // Hero Section
        hero: {
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                default: "",
            },
            backgroundImage: {
                type: String,
                required: true,
            },
        },
        // Trip Overview
        overview: {
            duration: {
                days: {
                    type: Number,
                    required: true,
                },
                nights: {
                    type: Number,
                    required: true,
                },
            },
            groupSize: {
                type: String,
                default: "2-15",
            },
        },
        // Day by Day Itinerary
        itinerary: [
            {
                day: {
                    type: String,
                    required: true,
                },
                title: {
                    type: String,
                    required: true,
                },
                activities: {
                    type: [String],
                    default: [],
                },
                description: {
                    type: String,
                    default: "",
                },
                accommodation: {
                    type: String,
                    default: "",
                },
                meals: {
                    breakfast: {
                        type: Boolean,
                        default: false,
                    },
                    lunch: {
                        type: Boolean,
                        default: false,
                    },
                    dinner: {
                        type: Boolean,
                        default: false,
                    },
                },
            },
        ],
        // Visual Galleries
        galleries: [
            {
                title: {
                    type: String,
                    default: "Visual Journeys",
                },
                images: {
                    type: [String],
                    default: [],
                },
            },
        ],

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Indexes for performance
packagesSchema.index({ slug: 1 });
packagesSchema.index({ tourCategory: 1, isActive: 1 });
packagesSchema.index({ featured: 1, isActive: 1 });

export default mongoose.model("package", packagesSchema);
