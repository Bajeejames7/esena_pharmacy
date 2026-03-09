const db = require("../config/db");

/**
 * Get all published blogs for public viewing
 */
exports.getPublishedBlogs = async (req, res) => {
  try {
    const [blogs] = await db.query(
      "SELECT id, title, slug, excerpt, image, author, created_at FROM blogs WHERE status = 'published' ORDER BY created_at DESC"
    );
    res.json(blogs);
  } catch (error) {
    console.error("Get published blogs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a single blog by slug for public viewing
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [blogs] = await db.query(
      "SELECT * FROM blogs WHERE slug = ? AND status = 'published'",
      [slug]
    );
    
    if (blogs.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    res.json(blogs[0]);
  } catch (error) {
    console.error("Get blog by slug error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all blogs for admin (including drafts)
 */
exports.getAllBlogs = async (req, res) => {
  try {
    const [blogs] = await db.query(
      "SELECT * FROM blogs ORDER BY created_at DESC"
    );
    res.json(blogs);
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get a single blog by ID for admin
 */
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const [blogs] = await db.query("SELECT * FROM blogs WHERE id = ?", [id]);
    
    if (blogs.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    res.json(blogs[0]);
  } catch (error) {
    console.error("Get blog by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new blog post
 */
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, image, author, status } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        message: "Title and content are required" 
      });
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check if slug already exists
    const [existingBlogs] = await db.query(
      "SELECT id FROM blogs WHERE slug = ?",
      [slug]
    );
    
    if (existingBlogs.length > 0) {
      return res.status(400).json({ 
        message: "A blog with this title already exists" 
      });
    }
    
    const [result] = await db.query(
      "INSERT INTO blogs (title, slug, excerpt, content, image, author, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, slug, excerpt, content, image, author || 'Esena Pharmacy', status || 'draft']
    );
    
    res.status(201).json({ 
      id: result.insertId,
      slug,
      message: "Blog post created successfully" 
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update a blog post
 */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, image, author, status } = req.body;
    
    // Check if blog exists
    const [existingBlogs] = await db.query("SELECT * FROM blogs WHERE id = ?", [id]);
    
    if (existingBlogs.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    // Generate new slug if title changed
    let slug = existingBlogs[0].slug;
    if (title && title !== existingBlogs[0].title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // Check if new slug already exists
      const [slugCheck] = await db.query(
        "SELECT id FROM blogs WHERE slug = ? AND id != ?",
        [slug, id]
      );
      
      if (slugCheck.length > 0) {
        return res.status(400).json({ 
          message: "A blog with this title already exists" 
        });
      }
    }
    
    await db.query(
      "UPDATE blogs SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, author = ?, status = ? WHERE id = ?",
      [
        title || existingBlogs[0].title,
        slug,
        excerpt !== undefined ? excerpt : existingBlogs[0].excerpt,
        content || existingBlogs[0].content,
        image !== undefined ? image : existingBlogs[0].image,
        author || existingBlogs[0].author,
        status || existingBlogs[0].status,
        id
      ]
    );
    
    res.json({ 
      slug,
      message: "Blog post updated successfully" 
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a blog post
 */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if blog exists
    const [existingBlogs] = await db.query("SELECT * FROM blogs WHERE id = ?", [id]);
    
    if (existingBlogs.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    await db.query("DELETE FROM blogs WHERE id = ?", [id]);
    
    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Toggle blog status (draft/published)
 */
exports.toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current status
    const [blogs] = await db.query("SELECT status FROM blogs WHERE id = ?", [id]);
    
    if (blogs.length === 0) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    const newStatus = blogs[0].status === 'published' ? 'draft' : 'published';
    
    await db.query("UPDATE blogs SET status = ? WHERE id = ?", [newStatus, id]);
    
    res.json({ 
      status: newStatus,
      message: `Blog post ${newStatus === 'published' ? 'published' : 'saved as draft'}` 
    });
  } catch (error) {
    console.error("Toggle blog status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};