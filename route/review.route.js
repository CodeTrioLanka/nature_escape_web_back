import express from 'express';
import {
    submitReview,
    getPublicReviews,
    getAllReviews,
    addAdminReview,
    updateReview,
    deleteReview,
    approveReview,
    toggleVisibility,
    syncGoogleReviews,
    getReviewStats
} from '../controllers/review.controller.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// User review submission
router.post('/submit', submitReview);

// Get public reviews (approved only)
router.get('/public', getPublicReviews);

// Get review statistics
router.get('/stats', getReviewStats);

// ==================== ADMIN ROUTES (No Auth Required) ====================
// Get all reviews with moderation status
router.get('/all', getAllReviews);

// Add admin review
router.post('/admin', addAdminReview);

// Update review
router.put('/:id', updateReview);

// Delete review
router.delete('/:id', deleteReview);

// Approve user review
router.patch('/:id/approve', approveReview);

// Toggle visibility
router.patch('/:id/visibility', toggleVisibility);

// Sync Google reviews
router.get('/google/sync', syncGoogleReviews);

export default router;
