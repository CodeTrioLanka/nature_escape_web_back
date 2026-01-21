import Home from "../models/home.model.js";
import { uploadToCloudinary ,deleteFromCloudinary  } from "../services/cloudinary.js";
import fs from "fs";

export const homeGet = async (req, res) => {
  try {
    const homes = await Home.find().sort({ createdAt: -1 });
    res.json({ homes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch homes" });
  }
};

// export const homeCretae = async (req, res) => {
//   try {
//     // console.log('Request Body:', req.body);
//     // console.log('Request Files:', req.files);
    
//     const homeData = { ...req.body };

//     const imageFields = [
//       "gallery",
//       "homebg",
//       "destinationImage", 
//       "personalizedImage",
//     ];

//     for (const field of imageFields) {
//       if (req.files && req.files[field]) {
//         const file = req.files[field][0];
//         console.log(`Uploading ${field}:`, file.filename);
//         const cloudinaryUrl = await uploadToCloudinary(file.path);
//         homeData[field] = cloudinaryUrl;
//         console.log(`${field} uploaded:`, cloudinaryUrl);
        
//         fs.unlinkSync(file.path);
//       }
//     }

//     console.log('Final homeData:', homeData);
//     const home = await Home.create(homeData);
//     res.status(201).json({ home, message: "Home created successfully" });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(400).json({ error: error.message });
//   }
// };

export const homeCretae = async (req, res) => {
  try {
    const homeData = { ...req.body };

    // Handle multiple gallery images
    if (req.files && req.files.gallery) {
      const galleryUrls = [];
      for (const file of req.files.gallery) {
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        galleryUrls.push(cloudinaryUrl);
        fs.unlinkSync(file.path);
      }
      homeData.gallery = galleryUrls;
    }

    // Handle single images
    const singleImageFields = ['homebg', 'destinationImage', 'personalizedImage'];
    for (const field of singleImageFields) {
      if (req.files && req.files[field]) {
        const file = req.files[field][0];
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        homeData[field] = cloudinaryUrl;
        fs.unlinkSync(file.path);
      }
    }

    const home = await Home.create(homeData);
    res.status(201).json({ home, message: "Home created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// export const homeEdit = async (req, res) => {
//   try {
//     //     console.log('PUT Request Body:', req.body);
//     // console.log('PUT Request Files:', req.files);
    
//     const existingHome = await Home.findById(req.params.id);
//     if (!existingHome) {
//       return res.status(404).json({ error: "Home not found" });
//     }

//     const homeData = { ...req.body };
//     const imageFields = ['gallery', 'homebg', 'destinationImage', 'personalizedImage'];

//     for (const field of imageFields) {
//       if (req.files && req.files[field]) {
//         // Delete old image from Cloudinary if exists
//         if (existingHome[field]) {
//           await deleteFromCloudinary(existingHome[field]);
//         }
        
//         // Upload new image
//         const file = req.files[field][0];
//         const cloudinaryUrl = await uploadToCloudinary(file.path);
//         homeData[field] = cloudinaryUrl;
        
//         fs.unlinkSync(file.path);
//       }
//     }

//     const home = await Home.findByIdAndUpdate(req.params.id, homeData, {
//       new: true,
//     });
    
//     res.json({ home, message: "Home updated successfully" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
export const homeEdit = async (req, res) => {
  try {
    const existingHome = await Home.findById(req.params.id);
    if (!existingHome) {
      return res.status(404).json({ error: "Home not found" });
    }

    const homeData = { ...req.body };

    // Handle multiple gallery images
    if (req.files && req.files.gallery) {
      // Delete old gallery images
      if (existingHome.gallery && existingHome.gallery.length > 0) {
        for (const imageUrl of existingHome.gallery) {
          await deleteFromCloudinary(imageUrl);
        }
      }
      
      // Upload new gallery images
      const galleryUrls = [];
      for (const file of req.files.gallery) {
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        galleryUrls.push(cloudinaryUrl);
        fs.unlinkSync(file.path);
      }
      homeData.gallery = galleryUrls;
    }

    // Handle single images
    const singleImageFields = ['homebg', 'destinationImage', 'personalizedImage'];
    for (const field of singleImageFields) {
      if (req.files && req.files[field]) {
        if (existingHome[field]) {
          await deleteFromCloudinary(existingHome[field]);
        }
        
        const file = req.files[field][0];
        const cloudinaryUrl = await uploadToCloudinary(file.path);
        homeData[field] = cloudinaryUrl;
        fs.unlinkSync(file.path);
      }
    }

    const home = await Home.findByIdAndUpdate(req.params.id, homeData, {
      new: true,
    });
    
    res.json({ home, message: "Home updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// export const homeDelete = async (req, res) => {
//   try {
//     const home = await Home.findById(req.params.id);
//     if (!home) {
//       return res.status(404).json({ error: "Home not found" });
//     }

//     // Delete images from Cloudinary
//     const imageFields = ['gallery', 'homebg', 'destinationImage', 'personalizedImage'];
//     for (const field of imageFields) {
//       if (home[field]) {
//         await deleteFromCloudinary(home[field]);
//       }
//     }

//     await Home.findByIdAndDelete(req.params.id);
//     res.json({ message: "Home deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
export const homeDelete = async (req, res) => {
  try {
    const home = await Home.findById(req.params.id);
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }

    // Delete gallery images (array)
    if (home.gallery && home.gallery.length > 0) {
      for (const imageUrl of home.gallery) {
        await deleteFromCloudinary(imageUrl);
      }
    }

    // Delete single images
    const singleImageFields = ['homebg', 'destinationImage', 'personalizedImage'];
    for (const field of singleImageFields) {
      if (home[field]) {
        await deleteFromCloudinary(home[field]);
      }
    }

    await Home.findByIdAndDelete(req.params.id);
    res.json({ message: "Home deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
