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
            subtitle: {
                type: String,
                default: "",
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
            difficulty: {
                type: String,
                enum: ["Easy", "Moderate", "Challenging", "Difficult"],
                default: "Easy",
            },
            price: {
                amount: {
                    type: Number,
                    default: 0,
                },
                currency: {
                    type: String,
                    default: "USD",
                },
            },
        },
        // Day by Day Itinerary
        itinerary: [
            {
                day: {
                    type: Number,
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
        // Attractions/Highlights
        attractions: [
            {
                title: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    default: "",
                },
                image: {
                    type: String,
                    required: true,
                },
            },
        ],
        // Need to Know Section
        needToKnow: {
            title: {
                type: String,
                default: "You Need to Know",
            },
            items: {
                type: [String],
                default: [],
            },
        },
        // Map Section
        map: {
            image: {
                type: String,
                default: "",
            },
            description: {
                type: String,
                default: "",
            },
        },
        // What's Included/Excluded
        included: {
            type: [String],
            default: [],
        },
        excluded: {
            type: [String],
            default: [],
        },
        // Recommendations
        recommendedFor: {
            type: [String],
            default: [],
        },
        // Related Packages
        relatedPackages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "package",
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
