import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Middleware to verify JWT token from cookies or Authorization header
 * Also fetches full user details for logging purposes
 */
export const verifyToken = async (req, res, next) => {
    try {
        // Get token from cookie (accessToken) or Authorization header
        const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch full user details from database for logging
        try {
            const user = await User.findById(decoded.sub);
            if (user) {
                req.user = {
                    sub: decoded.sub,
                    id: decoded.sub,
                    role: decoded.role,
                    email: user.email,
                    username: user.username || user.email
                };
            } else {
                // Fallback if user not found in DB
                req.user = decoded;
            }
        } catch (dbError) {
            // Fallback to decoded token if DB fetch fails
            console.error('Error fetching user details:', dbError);
            req.user = decoded;
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Alias for verifyToken (used in some routes)
export const authenticate = verifyToken;

/**
 * Middleware to check if user is admin or superadmin
 */
export const isAdmin = (req, res, next) => {
    if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

