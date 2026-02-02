import app from './index.js';
import connectDB from './config/db.js';

// Connect to database
let isConnected = false;

const handler = async (req, res) => {
    // Connect to database if not already connected
    if (!isConnected) {
        try {
            await connectDB();
            isConnected = true;
        } catch (error) {
            console.error('Database connection error:', error);
            return res.status(500).json({
                error: 'Database connection failed',
                details: error.message
            });
        }
    }

    // Handle the request with Express
    return app(req, res);
};

export default handler;
