import { getLogs, cleanupOldLogs } from "../utils/logger.js";

/**
 * Get logs with filtering and pagination
 * GET /api/logs?userId=xxx&action=xxx&startDate=xxx&endDate=xxx&page=1&limit=50
 */
export const getLogsController = async (req, res) => {
    try {
        const { userId, action, startDate, endDate, page = 1, limit = 50 } = req.query;

        const filters = {};
        if (userId) filters.userId = userId;
        if (action) filters.action = action;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        const result = await getLogs(filters, parseInt(page), parseInt(limit));

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("getLogsController: Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch logs",
            error: error.message
        });
    }
};

/**
 * Cleanup old logs
 * DELETE /api/logs/cleanup?days=90
 */
export const cleanupLogsController = async (req, res) => {
    try {
        const { days = 90 } = req.query;
        const deletedCount = await cleanupOldLogs(parseInt(days));

        res.json({
            success: true,
            message: `Deleted ${deletedCount} logs older than ${days} days`,
            deletedCount
        });
    } catch (error) {
        console.error("cleanupLogsController: Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cleanup logs",
            error: error.message
        });
    }
};

/**
 * Get log statistics
 * GET /api/logs/stats
 */
export const getLogStatsController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const filters = {};
        if (startDate || endDate) {
            filters.timestamp = {};
            if (startDate) filters.timestamp.$gte = new Date(startDate);
            if (endDate) filters.timestamp.$lte = new Date(endDate);
        }

        const Log = (await import("../models/log.model.js")).default;

        const [totalLogs, actionStats, userStats] = await Promise.all([
            Log.countDocuments(filters),
            Log.aggregate([
                { $match: filters },
                { $group: { _id: "$action", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Log.aggregate([
                { $match: filters },
                { $group: { _id: { userId: "$userId", username: "$username" }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        res.json({
            success: true,
            stats: {
                totalLogs,
                topActions: actionStats.map(stat => ({
                    action: stat._id,
                    count: stat.count
                })),
                topUsers: userStats.map(stat => ({
                    userId: stat._id.userId,
                    username: stat._id.username,
                    count: stat.count
                }))
            }
        });
    } catch (error) {
        console.error("getLogStatsController: Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch log statistics",
            error: error.message
        });
    }
};
