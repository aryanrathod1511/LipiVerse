// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a base64 image to Cloudinary
 * @param base64Image - The base64 image string
 * @returns {string | null} - The URL of the uploaded image or null if it fails
 */
export const uploadOnCloudinary = async (base64Image: string) => {
  try {
    if (!base64Image) return null;

    const response = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'auto',
      folder: 'blog_images' // Optional: Folder to organize images
    });

    return response.secure_url; // Return the Cloudinary URL
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return null;
  }
};

/**
 * Deletes an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) {
      throw new Error("PublicId doesn't exist");
    }
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Error while deleting');
  }
};
