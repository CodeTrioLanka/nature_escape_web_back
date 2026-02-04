import mongoose from "mongoose";

const toursSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        images: {
            type: [String],
            required: true,
            validate: {
                validator: function (v) {
                    return v && v.length === 2;
                },
                message: 'Tour must have exactly 2 images'
            }
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            default: '',
        },
        // Hero Image for category page
        heroImage: {
            type: String,
            default: '',
        },
        // Schedule Image for tour page
        scheduleImage: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

// Index for performance
toursSchema.index({ slug: 1 });
toursSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model("tour", toursSchema);
