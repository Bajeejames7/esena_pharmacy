-- Esena Pharmacy Database Schema


-- Users / Admins
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','doctor') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('Prescription','OTC','Chronic','Supplements','PersonalCare') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  video VARCHAR(255),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

-- Orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  delivery_address TEXT,
  notes TEXT,
  total DECIMAL(10,2),
  token VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending','payment_requested','paid','dispatched','completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Order Items
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Appointments
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  service ENUM('Dermatology','LabTest','Pharmacist') NOT NULL,
  date DATE NOT NULL,
  message TEXT,
  token VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending','confirmed','completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Contacts
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2a$10$rZ5qH8qF9xK3yL7mN9pO4.xJ5vK8wL9mN6pO4xJ5vK8wL9mN6pO4x', 'admin');
-- Blogs
CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  image VARCHAR(255),
  author VARCHAR(255) DEFAULT 'Esena Pharmacy',
  status ENUM('draft','published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Insert sample blog posts
INSERT INTO blogs (title, slug, excerpt, content, status) VALUES
('Understanding Your Medications: A Complete Guide', 'understanding-your-medications', 'Learn how to properly manage your medications for better health outcomes.', 
'<h2>Introduction</h2><p>Proper medication management is crucial for maintaining good health and ensuring that treatments are effective. This comprehensive guide will help you understand how to take your medications safely and effectively.</p><h2>Key Points to Remember</h2><ul><li>Always follow your doctor''s instructions</li><li>Take medications at the same time each day</li><li>Never skip doses</li><li>Store medications properly</li></ul><h2>Common Mistakes to Avoid</h2><p>Many people make simple mistakes that can reduce the effectiveness of their medications or cause harmful side effects. Here are the most common ones to avoid...</p>', 'published'),

('Seasonal Health Tips for Better Wellness', 'seasonal-health-tips', 'Stay healthy throughout the year with these seasonal wellness strategies.', 
'<h2>Spring Health Tips</h2><p>As the weather warms up, it''s important to adjust your health routine. Spring is the perfect time to start fresh with new healthy habits.</p><h2>Summer Wellness</h2><p>Hot weather brings unique health challenges. Stay hydrated, protect your skin from UV rays, and maintain a balanced diet rich in fresh fruits and vegetables.</p><h2>Fall Preparation</h2><p>Prepare your immune system for the colder months ahead with proper nutrition and preventive care.</p><h2>Winter Health</h2><p>Combat seasonal depression and maintain your health during the darker, colder months.</p>', 'published'),

('The Importance of Preventive Healthcare', 'preventive-healthcare-importance', 'Discover why prevention is better than cure and how to stay ahead of health issues.', 
'<h2>What is Preventive Healthcare?</h2><p>Preventive healthcare involves taking proactive steps to prevent illness and disease before they occur. This approach is not only better for your health but also more cost-effective in the long run.</p><h2>Types of Preventive Care</h2><ul><li>Regular check-ups and screenings</li><li>Vaccinations</li><li>Healthy lifestyle choices</li><li>Early detection programs</li></ul><h2>Benefits</h2><p>Regular preventive care can help detect health issues early when they''re most treatable, reduce healthcare costs, and improve quality of life.</p>', 'published');