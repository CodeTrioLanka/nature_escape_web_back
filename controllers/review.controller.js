import Review from '../models/review.model.js';
import googlePlacesService from '../services/googlePlaces.service.js';
import { logAction } from '../utils/logger.js';

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Submit a new review (User-facing)
 * POST /api/reviews/submit
 */
export const submitReview = async (req, res) => {
    try {
        const { name, email, rating, reviewText } = req.body;

        // Validation
        if (!name || !rating || !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'Name, rating, and review text are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Create new review
        const review = new Review({
            name,
            email,
            rating,
            reviewText,
            source: 'user',
            isApproved: false, // Requires approval
            isVisible: true
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Thank you for your review! It will be published after approval.',
            data: review
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review',
            error: error.message
        });
    }
};

/**
 * Get all approved and visible reviews (Public)
 * GET /api/reviews/public
 */
export const getPublicReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, rating } = req.query;

        // Build query
        const query = {
            isVisible: true,
            $or: [
                { source: 'google' },
                { source: 'admin' },
                { source: 'user', isApproved: true }
            ]
        };

        // Filter by rating if provided
        if (rating) {
            query.rating = parseInt(rating);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find(query)
            .sort({ reviewDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await Review.countDocuments(query);

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching public reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all reviews with moderation status (Admin)
 * GET /api/reviews/all
 */
export const getAllReviews = async (req, res) => {
    try {
        const { source, isApproved, page = 1, limit = 20 } = req.query;

        // Build query
        const query = {};
        if (source) query.source = source;
        if (isApproved !== undefined) query.isApproved = isApproved === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await Review.countDocuments(query);

        // Get statistics
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        const pendingCount = await Review.countDocuments({
            source: 'user',
            isApproved: false
        });

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            stats: {
                bySource: stats,
                pendingApproval: pendingCount
            }
        });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

/**
 * Add a new review (Admin)
 * POST /api/reviews/admin
 */
export const addAdminReview = async (req, res) => {
    try {
        const { name, email, rating, reviewText, avatarUrl, reviewDate } = req.body;

        // Validation
        if (!name || !rating || !reviewText) {
            return res.status(400).json({
                success: false,
                message: 'Name, rating, and review text are required'
            });
        }

        const review = new Review({
            name,
            email,
            rating,
            reviewText,
            avatarUrl,
            reviewDate: reviewDate || new Date(),
            source: 'admin',
            isApproved: true,
            isVisible: true
        });

        await review.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "CREATE_REVIEW", {
                reviewId: review._id,
                reviewerName: review.name,
                rating: review.rating,
                source: "admin"
            });
        }

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: review
        });
    } catch (error) {
        console.error('Error adding admin review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add review',
            error: error.message
        });
    }
};

/**
 * Update a review (Admin)
 * PUT /api/reviews/:id
 */
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, rating, reviewText, avatarUrl, isVisible } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Don't allow editing Google reviews
        if (review.source === 'google') {
            return res.status(403).json({
                success: false,
                message: 'Cannot edit Google reviews'
            });
        }

        // Update fields
        if (name) review.name = name;
        if (email !== undefined) review.email = email;
        if (rating) review.rating = rating;
        if (reviewText) review.reviewText = reviewText;
        if (avatarUrl !== undefined) review.avatarUrl = avatarUrl;
        if (isVisible !== undefined) review.isVisible = isVisible;

        await review.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "UPDATE_REVIEW", {
                reviewId: review._id,
                reviewerName: review.name,
                updatedFields: Object.keys(req.body)
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};

/**
 * Delete a review (Admin)
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Don't allow deleting Google reviews (just hide them instead)
        if (review.source === 'google') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete Google reviews. Use visibility toggle instead.'
            });
        }

        await Review.findByIdAndDelete(id);

        // Log the action
        if (req.user) {
            await logAction(req.user, "DELETE_REVIEW", {
                reviewId: review._id,
                reviewerName: review.name,
                rating: review.rating
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
};

/**
 * Approve a user review (Admin)
 * PATCH /api/reviews/:id/approve
 */
export const approveReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.isApproved = true;
        await review.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "APPROVE_REVIEW", {
                reviewId: review._id,
                reviewerName: review.name,
                rating: review.rating
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review approved successfully',
            data: review
        });
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve review',
            error: error.message
        });
    }
};

/**
 * Toggle review visibility (Admin)
 * PATCH /api/reviews/:id/visibility
 */
export const toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVisible } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.isVisible = isVisible !== undefined ? isVisible : !review.isVisible;
        await review.save();

        // Log the action
        if (req.user) {
            await logAction(req.user, "TOGGLE_REVIEW_VISIBILITY", {
                reviewId: review._id,
                reviewerName: review.name,
                isVisible: review.isVisible
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review visibility updated',
            data: review
        });
    } catch (error) {
        console.error('Error toggling visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update visibility',
            error: error.message
        });
    }
};

// ==================== GOOGLE INTEGRATION ====================

/**
 * Sync Google reviews (Admin)
 * GET /api/reviews/google/sync
 */
export const syncGoogleReviews = async (req, res) => {
    try {
        const googleReviews = await googlePlacesService.fetchGoogleReviews();

        let newCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        for (const reviewData of googleReviews) {
            try {
                const existing = await Review.findOne({
                    googleReviewId: reviewData.googleReviewId
                });

                if (existing) {
                    // Update existing review
                    existing.rating = reviewData.rating;
                    existing.reviewText = reviewData.reviewText;
                    existing.avatarUrl = reviewData.avatarUrl;
                    existing.googleData = reviewData.googleData;
                    await existing.save();
                    updatedCount++;
                } else {
                    // Create new review
                    await Review.create(reviewData);
                    newCount++;
                }
            } catch (err) {
                console.error('Error processing review:', err);
                errorCount++;
            }
        }

        // Log the action
        if (req.user) {
            await logAction(req.user, "SYNC_GOOGLE_REVIEWS", {
                total: googleReviews.length,
                new: newCount,
                updated: updatedCount,
                errors: errorCount
            });
        }

        res.status(200).json({
            success: true,
            message: 'Google reviews synced successfully',
            data: {
                total: googleReviews.length,
                new: newCount,
                updated: updatedCount,
                errors: errorCount
            }
        });
    } catch (error) {
        console.error('Error syncing Google reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync Google reviews',
            error: error.message
        });
    }
};

/**
 * Get review statistics
 * GET /api/reviews/stats
 */
export const getReviewStats = async (req, res) => {
    try {
        const totalReviews = await Review.countDocuments({
            isVisible: true,
            $or: [
                { source: 'google' },
                { source: 'admin' },
                { source: 'user', isApproved: true }
            ]
        });

        const avgRating = await Review.aggregate([
            {
                $match: {
                    isVisible: true,
                    $or: [
                        { source: 'google' },
                        { source: 'admin' },
                        { source: 'user', isApproved: true }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);

        const ratingDistribution = await Review.aggregate([
            {
                $match: {
                    isVisible: true,
                    $or: [
                        { source: 'google' },
                        { source: 'admin' },
                        { source: 'user', isApproved: true }
                    ]
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalReviews,
                averageRating: avgRating[0]?.avgRating || 0,
                ratingDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};
