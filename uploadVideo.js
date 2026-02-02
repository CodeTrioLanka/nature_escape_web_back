import { v2 as cloudinary } from 'cloudinary';
import { application } from './config/application.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: application.CLOUDINARY_CLOUD_NAME,
    api_key: application.CLOUDINARY_API_KEY,
    api_secret: application.CLOUDINARY_API_SECRET,
});

async function uploadVideo() {
    try {
        console.log('Starting video upload to Cloudinary...');

        // Path to your video file
        const videoPath = path.join(__dirname, 'uploads', '1769959242940-xfyzh5k27drmw0cw372bxnykdw_result_.mp4');

        console.log('Video path:', videoPath);
        console.log('Uploading... This may take a while for large videos.');

        // Upload video to Cloudinary
        const result = await cloudinary.uploader.upload(videoPath, {
            resource_type: 'video',
            folder: 'nature-escape/home',
            chunk_size: 6000000, // 6MB chunks for large files
        });

        console.log('\n✅ Video uploaded successfully!');
        console.log('📹 Video URL:', result.secure_url);
        console.log('\n📋 Copy this URL and paste it in the "Background Video" field in your admin panel.');
        console.log('\nVideo Details:');
        console.log('- Duration:', result.duration, 'seconds');
        console.log('- Format:', result.format);
        console.log('- Size:', (result.bytes / 1024 / 1024).toFixed(2), 'MB');

        return result.secure_url;
    } catch (error) {
        console.error('❌ Error uploading video:', error);
        throw error;
    }
}

// Run the upload
uploadVideo()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error.message);
        process.exit(1);
    });
