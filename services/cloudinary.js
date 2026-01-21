import { v2 as cloudinary } from 'cloudinary';
import { application } from '../config/application.js';

cloudinary.config({
  cloud_name: application.CLOUDINARY_CLOUD_NAME,
  api_key: application.CLOUDINARY_API_KEY,
  api_secret: application.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
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
