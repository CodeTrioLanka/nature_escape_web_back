import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";


const router = Router();

// Single image/video upload endpoint
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: "No file provided" });
    }

    // Check if it's a video or image
    const isVideo = req.file.mimetype.startsWith('video/');
    const fileType = isVideo ? 'video' : 'image';

    console.log(`File type detected: ${fileType}`);

    // Use buffer directly for upload, compatible with Vercel/Serverless
    console.log(`Uploading ${fileType} to Cloudinary`);
    const cloudinaryUrl = await uploadToCloudinary(req.file.buffer);
    console.log('Cloudinary URL:', cloudinaryUrl);

    res.json({
      url: cloudinaryUrl,
      message: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`,
      fileType: fileType
    });
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      error: "Failed to upload file",
      details: error.message
    });
  }
});

// Delete image from Cloudinary
router.delete("/delete", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    await deleteFromCloudinary(imageUrl);

    res.json({
      message: "Image deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      error: "Failed to delete image",
      details: error.message
    });
  }
});

export default router;