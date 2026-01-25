import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary.js";
import fs from "fs";

const router = Router();

// Single image upload endpoint
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const cloudinaryUrl = await uploadToCloudinary(req.file.path);
    
    // Clean up local file
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      url: cloudinaryUrl,
      message: "Image uploaded successfully" 
    });
  } catch (error) {
    // Clean up local file if upload fails
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }
    
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