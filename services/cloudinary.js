import { v2 as cloudinary } from 'cloudinary';
import { application } from '../config/application.js';

cloudinary.config({
  cloud_name: application.CLOUDINARY_CLOUD_NAME,
  api_key: application.CLOUDINARY_API_KEY,
  api_secret: application.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file) => {
  try {
    let result;
    
    // Handle buffer (memory storage)
    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file);
      });
    } 
    // Handle file path (disk storage)
    else {
      result = await cloudinary.uploader.upload(file);
    }
    
    return result.secure_url;
  } catch (error) {
    throw error;
  }
};

export const deleteFromCloudinary = async (imageUrl) => {
  try {
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};
