const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure blog uploads folder exists
const blogUploadDir = "uploads/blogs";
if (!fs.existsSync(blogUploadDir)) fs.mkdirSync(blogUploadDir, { recursive: true });

const blogImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, blogUploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, base + '-' + Date.now() + ext);
    }
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    if (allowed.test(ext) && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, png, and webp images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

// Public routes
router.get("/published", blogController.getPublishedBlogs);
router.get("/slug/:slug", blogController.getBlogBySlug);

// Admin routes (protected)
router.get("/", auth, blogController.getAllBlogs);
router.get("/:id", auth, blogController.getBlogById);
router.post("/", auth, blogController.createBlog);
router.put("/:id", auth, blogController.updateBlog);
router.delete("/:id", auth, blogController.deleteBlog);
router.patch("/:id/toggle-status", auth, blogController.toggleBlogStatus);

// Blog image upload
router.post("/upload-image", auth, (req, res) => {
  blogImageUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const imageUrl = `/uploads/blogs/${req.file.filename}`;
    res.json({ imageUrl });
  });
});

module.exports = router;