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
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// User review submission
router.post('/submit', submitReview);

// Get public reviews (approved only)
router.get('/public', getPublicReviews);

// Get review statistics
router.get('/stats', getReviewStats);

// ==================== ADMIN ROUTES (No Auth Required) -> (Auth Required) ====================
// Get all reviews with moderation status
router.get('/all', authenticate, getAllReviews);

// Add admin review
router.post('/admin', authenticate, addAdminReview);

// Update review
router.put('/:id', authenticate, updateReview);

// Delete review
router.delete('/:id', authenticate, deleteReview);

// Approve user review
router.patch('/:id/approve', authenticate, approveReview);

// Toggle visibility
router.patch('/:id/visibility', authenticate, toggleVisibility);

// Sync Google reviews
router.get('/google/sync', authenticate, syncGoogleReviews);

export default router;
