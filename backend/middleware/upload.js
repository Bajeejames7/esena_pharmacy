const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = ["uploads", "uploads/products", "uploads/videos"];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage with unique filenames (Requirements 12.9, 22.5, 22.6)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Separate folders for images and videos
    const folder = file.fieldname === "video" ? "uploads/videos" : "uploads/products";
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp + random string + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, basename + "-" + uniqueSuffix + ext);
  }
});

// File type validation (Requirements 12.5, 12.7, 22.1, 22.2)
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const imageTypes = /jpeg|jpg|png|webp/;
  const videoTypes = /mp4|webm/;
  
  const extname = path.extname(file.originalname).toLowerCase().substring(1);
  const mimetype = file.mimetype.toLowerCase();
  
  // Validate based on field name
  if (file.fieldname === "image") {
    // Check image file types (jpg, png, webp)
    const validExt = imageTypes.test(extname);
    const validMime = mimetype.startsWith('image/') && 
                      (mimetype.includes('jpeg') || 
                       mimetype.includes('jpg') || 
                       mimetype.includes('png') || 
                       mimetype.includes('webp'));
    
    if (validExt && validMime) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type. Only jpg, png, and webp are allowed."), false);
    }
  } else if (file.fieldname === "video") {
    // Check video file types (mp4, webm)
    const validExt = videoTypes.test(extname);
    const validMime = mimetype.startsWith('video/') && 
                      (mimetype.includes('mp4') || mimetype.includes('webm'));
    
    if (validExt && validMime) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video file type. Only mp4 and webm are allowed."), false);
    }
  } else {
    cb(new Error("Invalid field name for file upload"), false);
  }
};

// Configure multer with file size limits (Requirements 12.6, 12.8, 22.3, 22.4)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (will be checked per field)
    files: 2 // Maximum 2 files (image + video)
  }
});

// Custom middleware to enforce different size limits for images and videos
const uploadWithSizeLimits = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]);
  
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: "File too large",
          error: "File size exceeds the maximum allowed limit"
        });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          message: "Too many files",
          error: "Maximum 2 files allowed (1 image and 1 video)"
        });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          message: "Unexpected field",
          error: "Only 'image' and 'video' fields are allowed"
        });
      }
      return res.status(400).json({ 
        message: "Upload error",
        error: err.message 
      });
    } else if (err) {
      // Handle custom errors (from fileFilter)
      return res.status(400).json({ 
        message: "File validation failed",
        error: err.message 
      });
    }
    
    // Additional size validation per file type (Requirements 12.6, 12.8, 22.3, 22.4)
    if (req.files) {
      // Check image size (5MB limit)
      if (req.files.image && req.files.image[0]) {
        const imageSize = req.files.image[0].size;
        const maxImageSize = 5 * 1024 * 1024; // 5MB
        
        if (imageSize > maxImageSize) {
          // Delete the uploaded file
          fs.unlinkSync(req.files.image[0].path);
          return res.status(400).json({ 
            message: "Image file too large",
            error: "Image size must be less than 5MB"
          });
        }
      }
      
      // Check video size (50MB limit)
      if (req.files.video && req.files.video[0]) {
        const videoSize = req.files.video[0].size;
        const maxVideoSize = 50 * 1024 * 1024; // 50MB
        
        if (videoSize > maxVideoSize) {
          // Delete the uploaded file
          fs.unlinkSync(req.files.video[0].path);
          // Also delete image if it was uploaded
          if (req.files.image && req.files.image[0]) {
            fs.unlinkSync(req.files.image[0].path);
          }
          return res.status(400).json({ 
            message: "Video file too large",
            error: "Video size must be less than 50MB"
          });
        }
      }
    }
    
    next();
  });
};

module.exports = uploadWithSizeLimits;
