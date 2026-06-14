import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    // Reviewer Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },

    // Review Content
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: true,
        trim: true
    },

    // Source Tracking
    source: {
        type: String,
        enum: ['google', 'user', 'admin'],
        required: true,
        default: 'user'
    },
    googleReviewId: {
        type: String,
        sparse: true,
        unique: true
    },

    // Moderation & Visibility
    isApproved: {
        type: Boolean,
        default: false
    },
    isVisible: {
        type: Boolean,
        default: true
    },

    // Metadata
    reviewDate: {
        type: Date,
        default: Date.now
    },
    avatarUrl: {
        type: String,
        default: ''
    },

    // Additional Google Review Data
    googleData: {
        authorUrl: String,
        relativeTimeDescription: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
reviewSchema.index({ source: 1, isApproved: 1, isVisible: 1 });
reviewSchema.index({ reviewDate: -1 });

// Virtual for display name
reviewSchema.virtual('displayName').get(function () {
    return this.name || 'Anonymous';
});

// Method to check if review should be publicly visible
reviewSchema.methods.isPubliclyVisible = function () {
    return this.isVisible && (this.isApproved || this.source === 'google' || this.source === 'admin');
};

export default mongoose.model("Review", reviewSchema);
