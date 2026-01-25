import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
import fs from "fs";

const router = Router();

// Single image upload endpoint
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: "No image file provided" });
    }

    // For memory storage, we need to save the buffer to a temporary file
    const tempPath = `uploads/${Date.now()}-${req.file.originalname}`;
    fs.writeFileSync(tempPath, req.file.buffer);
    
    console.log('Uploading to Cloudinary:', tempPath);
    const cloudinaryUrl = await uploadToCloudinary(tempPath);
    console.log('Cloudinary URL:', cloudinaryUrl);
    
    // Clean up temporary file
    fs.unlinkSync(tempPath);
    
    res.json({ 
      url: cloudinaryUrl,
      message: "Image uploaded successfully" 
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    res.status(500).json({ 
      error: "Failed to upload image",
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