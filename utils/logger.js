import Log from "../models/log.model.js";
import connectDB from "../config/db.js";

/**
 * Log user actions to the database
 * @param {Object} user - User object from req.user (must contain sub/id, role, and email/username)
 * @param {String} action - Action description (e.g., "CREATE_PACKAGE", "UPDATE_SERVICE")
 * @param {Object} details - Additional details about the action (optional)
 * @returns {Promise<void>}
 */
export async function logAction(user, action, details = {}) {
    try {
        // Validate user object
        if (!user || !user.sub) {
            console.log("logAction: No valid user object, skipping log");
            return;
        }

        // Only log actions for admin and superadmin roles
        if (!["admin", "superadmin"].includes(user.role)) {
            console.log("logAction: User role not admin/superadmin, skipping log");
            return;
        }

        // Ensure database connection
        await connectDB();

        // Create log entry
        const log = new Log({
            userId: user.sub || user.id,
            username: user.email || user.username || "Unknown",
            role: user.role,
            action,
            details,
        });

        await log.save();
        console.log(`logAction: Logged action "${action}" for user ${user.email || user.username}`);
    } catch (err) {
        console.error("logAction: Error:", err);
        // Don't throw error - logging should not break the main flow
    }
}

/**
 * Get logs with filtering and pagination
 * @param {Object} filters - Filter options (userId, action, startDate, endDate)
 * @param {Number} page - Page number (default: 1)
 * @param {Number} limit - Items per page (default: 50)
 * @returns {Promise<Object>} - Logs and pagination info
 */
export async function getLogs(filters = {}, page = 1, limit = 50) {
    try {
        await connectDB();

        const query = {};

        if (filters.userId) {
            query.userId = filters.userId;
        }

        if (filters.action) {
            query.action = filters.action;
        }

        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate) {
                query.timestamp.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.timestamp.$lte = new Date(filters.endDate);
            }
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            Log.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Log.countDocuments(query)
        ]);

        return {
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (err) {
        console.error("getLogs: Error:", err);
        throw err;
    }
}

/**
 * Delete old logs (cleanup utility)
 * @param {Number} daysToKeep - Number of days to keep logs (default: 90)
 * @returns {Promise<Number>} - Number of deleted logs
 */
export async function cleanupOldLogs(daysToKeep = 90) {
    try {
        await connectDB();

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await Log.deleteMany({
            timestamp: { $lt: cutoffDate }
        });

        console.log(`cleanupOldLogs: Deleted ${result.deletedCount} logs older than ${daysToKeep} days`);
        return result.deletedCount;
    } catch (err) {
        console.error("cleanupOldLogs: Error:", err);
        throw err;
    }
}
