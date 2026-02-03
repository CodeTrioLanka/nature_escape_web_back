import connectDB from './config/db.js';
import Log from './models/log.model.js';
import { logAction } from './utils/logger.js';

/**
 * Script to create test logs for testing the User Logs interface
 */
async function createTestLogs() {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Connected to MongoDB');

        // Create some test logs
        const testUser = {
            sub: '507f1f77bcf86cd799439011', // Dummy user ID
            email: 'admin@test.com',
            username: 'admin@test.com',
            role: 'admin'
        };

        console.log('\nCreating test logs...');

        // Create various types of logs
        await logAction(testUser, 'USER_LOGIN', {
            userId: testUser.sub,
            email: testUser.email,
            role: testUser.role
        });
        console.log('✓ Created USER_LOGIN log');

        await logAction(testUser, 'CREATE_PACKAGE', {
            packageId: '507f1f77bcf86cd799439012',
            packageName: 'Sigiriya Day Tour',
            slug: 'sigiriya-day-tour',
            tourCategory: 'Day Tours'
        });
        console.log('✓ Created CREATE_PACKAGE log');

        await logAction(testUser, 'UPDATE_PACKAGE', {
            packageId: '507f1f77bcf86cd799439012',
            packageName: 'Sigiriya Day Tour',
            updatedFields: ['hero', 'overview', 'itinerary']
        });
        console.log('✓ Created UPDATE_PACKAGE log');

        await logAction(testUser, 'UPDATE_HOME_PAGE', {
            updatedFields: ['title', 'subtitle', 'gallery']
        });
        console.log('✓ Created UPDATE_HOME_PAGE log');

        await logAction(testUser, 'CREATE_TOUR', {
            tourId: '507f1f77bcf86cd799439013',
            tourName: 'Cultural Triangle Tour',
            category: 'Cultural Tours'
        });
        console.log('✓ Created CREATE_TOUR log');

        await logAction(testUser, 'APPROVE_REVIEW', {
            reviewId: '507f1f77bcf86cd799439014',
            reviewerName: 'John Doe',
            rating: 5
        });
        console.log('✓ Created APPROVE_REVIEW log');

        // Count total logs
        const count = await Log.countDocuments();
        console.log(`\n✅ Successfully created test logs!`);
        console.log(`📊 Total logs in database: ${count}`);

        // Show some sample logs
        const recentLogs = await Log.find().sort({ timestamp: -1 }).limit(3);
        console.log('\n📝 Recent logs:');
        recentLogs.forEach((log, index) => {
            console.log(`${index + 1}. ${log.action} by ${log.username} at ${log.timestamp}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test logs:', error);
        process.exit(1);
    }
}

createTestLogs();
