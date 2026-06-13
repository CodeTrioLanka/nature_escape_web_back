import { v2 as cloudinary } from 'cloudinary';
import { application } from '../config/application.js';

cloudinary.config({
  cloud_name: application.CLOUDINARY_CLOUD_NAME,
  api_key: application.CLOUDINARY_API_KEY,
  api_secret: application.CLOUDINARY_API_SECRET,
});

const getUploadOptions = (file) => {
  let isImage = false;

  if (Buffer.isBuffer(file)) {
    if (file.length >= 4) {
      const hex = file.slice(0, 4).toString('hex').toUpperCase();
      // PNG (89504E47), JPEG (FFD8FF), GIF (47494638), WEBP/RIFF (52494646)
      isImage = hex.startsWith('89504E47') || 
                hex.startsWith('FFD8FF') || 
                hex.startsWith('47494638') || 
                hex.startsWith('52494646');
    }
  } else if (typeof file === 'string') {
    const ext = file.split('.').pop().toLowerCase();
    isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'tiff', 'bmp'].includes(ext);
  }

  if (isImage) {
    return {
      resource_type: 'image',
      format: 'webp',
      transformation: [{ quality: 'auto:good' }]
    };
  }

  return {
    resource_type: 'auto'
  };
};

export const uploadToCloudinary = async (file) => {
  try {
    let result;
    const options = getUploadOptions(file);

    // Handle buffer (memory storage)
    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file);
      });
    }
    // Handle file path (disk storage)
    else {
      result = await cloudinary.uploader.upload(file, options);
    }

    return result.secure_url;
  } catch (error) {
    throw error;
  }
};

// Helper to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id].[ext]
    // Or with folders: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/folder/[public_id].[ext]
    const splitUrl = url.split('/');
    const lastPart = splitUrl[splitUrl.length - 1]; // [public_id].[ext]
    const publicIdWithExt = lastPart;

    // Find index of 'upload/'
    const uploadIndex = splitUrl.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;

    // Everything after v[version]/ is the public ID
    // Find the part that starts with 'v' followed by numbers
    const versionIndex = splitUrl.findIndex(part => /^v\d+/.test(part));

    if (versionIndex !== -1 && versionIndex < splitUrl.length - 1) {
      const publicIdParts = splitUrl.slice(versionIndex + 1);
      const publicIdWithExt = publicIdParts.join('/');
      return publicIdWithExt.split('.')[0];
    }

    return publicIdWithExt.split('.')[0];
  } catch (error) {
    console.error('Error parsing public ID:', error);
    return null;
  }
};

export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
  try {
    const publicId = getPublicIdFromUrl(imageUrl);
    if (publicId) {
      // Detect if it's a video based on the URL
      const isVideo = imageUrl.includes('/video/upload/');
      const resourceType = isVideo ? 'video' : 'image';

      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};
