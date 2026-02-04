import mongoose from 'mongoose';
import Tour from '../models/tours.model.js';
import { application } from '../config/application.js';

const migrateScheduleImage = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(application.MONGO_URL);
        console.log('Connected to MongoDB');

        // Update all existing tours to add scheduleImage field if it doesn't exist
        const result = await Tour.updateMany(
            { scheduleImage: { $exists: false } }, // Only update documents without scheduleImage
            { $set: { scheduleImage: '' } }        // Set it to empty string (default)
        );

        console.log(`Migration complete!`);
        console.log(`Documents matched: ${result.matchedCount}`);
        console.log(`Documents modified: ${result.modifiedCount}`);

        // Disconnect
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateScheduleImage();
