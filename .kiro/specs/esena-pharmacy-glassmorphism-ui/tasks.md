# Implementation Plan: Esena Pharmacy Glassmorphism UI

## Overview

This implementation plan breaks down the Esena Pharmacy Glassmorphism UI feature into discrete, actionable coding tasks. The feature is a full-stack responsive web application with a modern frosted glass aesthetic, including customer-facing pages for browsing products, placing orders, booking appointments, and an admin dashboard for managing the system.

The implementation follows a bottom-up approach: database setup → backend API → frontend components → page integration → testing. Each task builds incrementally on previous work, with checkpoints to validate functionality.

## Technology Stack

- Frontend: React 18.2, Tailwind CSS 3.3, React Router 6.16
- Backend: Express.js 4.18, Node.js
- Database: MySQL 8.0
- Authentication: JWT with bcrypt
- Email: Nodemailer
- File Upload: Multer

## Tasks

- [x] 1. Set up database schema and backend foundation
  - [x] 1.1 Create MySQL database schema with all tables
    - Create users, products, orders, order_items, appointments, contacts tables
    - Add indexes on token, email, category, status columns
    - Set up foreign key constraints for referential integrity
    - _Requirements: 27.1, 27.6, 27.7_
  
  - [x] 1.2 Set up Express.js server with middleware
    - Initialize Express app with CORS, JSON parsing, and error handling
    - Configure environment variables from .env file
    - Set up MySQL connection pool with error handling
    - _Requirements: 23.1, 23.2, 23.5_
  
  - [x] 1.3 Implement token generation utility
    - Create generateUniqueToken() function with crypto random bytes
    - Implement uniqueness check across orders and appointments tables
    - Add retry logic (up to 10 attempts) for collision handling
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_
  
  - [x]* 1.4 Write property test for token generation
    - **Property 2: Token Uniqueness**
    - **Validates: Requirements 13.5, 13.6**
    - Test that generated tokens are unique across multiple generations
    - Test that tokens are exactly 50 characters and alphanumeric

- [x] 2. Implement authentication and authorization
  - [x] 2.1 Create authentication controller
    - Implement login endpoint with bcrypt password verification
    - Generate JWT tokens with userId and role in payload
    - Set token expiration to 24 hours
    - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_
  
  - [x] 2.2 Create JWT verification middleware
    - Extract and verify JWT token from Authorization header
    - Validate token signature and expiration
    - Attach decoded user info to request object
    - Return 401 for invalid/expired tokens
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_
  
  - [x]* 2.3 Write property test for JWT verification
    - **Property 6: Authentication Token Validity**
    - **Validates: Requirements 11.3, 11.4**
    - Test that valid tokens are accepted and invalid tokens are rejected
    - Test token expiration handling

- [x] 3. Implement product management backend
  - [x] 3.1 Create product controller with CRUD operations
    - Implement getAllProducts with optional category filtering
    - Implement getProductById, createProduct, updateProduct, deleteProduct
    - Add validation for name, category, price, stock
    - _Requirements: 3.2, 12.1, 12.2, 12.3, 12.4, 12.10, 12.11, 12.12_
  
  - [x] 3.2 Set up Multer file upload middleware
    - Configure file type validation (jpg, png, webp, mp4, webm)
    - Set file size limits (5MB for images, 50MB for videos)
    - Generate unique filenames and store in uploads directory
    - _Requirements: 12.5, 12.6, 12.7, 12.8, 12.9, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8_
  
  - [x] 3.3 Create product routes
    - Set up GET /api/products, GET /api/products/:id
    - Set up POST /api/products (protected), PUT /api/products/:id (protected)
    - Set up DELETE /api/products/:id (protected)
    - Apply JWT middleware to protected routes
    - _Requirements: 3.2, 12.1_


- [x] 4. Implement order management backend
  - [x] 4.1 Create order controller
    - Implement createOrder endpoint with validation
    - Calculate order total from cart items
    - Generate unique token for order tracking
    - Insert order and order_items in database transaction
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.10_
  
  - [x]* 4.2 Write property test for order total calculation
    - **Property 3: Order Total Correctness**
    - **Validates: Requirements 5.4**
    - Test that order total equals sum of all item subtotals
    - Test with various cart item combinations
  
  - [x] 4.3 Implement order tracking endpoint
    - Create getOrderByToken endpoint
    - Query database for order with matching token
    - Return order details with items, or 404 if not found
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.4 Implement order status management
    - Create updateOrderStatus endpoint (protected)
    - Validate status transitions follow workflow rules
    - Return 400 for invalid transitions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x]* 4.5 Write property test for order status workflow
    - **Property 5: Order Status Workflow**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
    - Test that only valid status transitions are allowed
    - Test that invalid transitions are rejected
  
  - [x] 4.6 Create order routes
    - Set up POST /api/orders, GET /api/orders/:token
    - Set up GET /api/orders (protected), PUT /api/orders/:id/status (protected)
    - Apply JWT middleware to protected routes
    - _Requirements: 5.2, 6.1, 7.1_

- [x] 5. Implement email notification system
  - [x] 5.1 Configure Nodemailer with SMTP settings
    - Set up email transporter with environment variables
    - Create email templates for orders and appointments
    - Implement error handling for email failures
    - _Requirements: 14.9, 14.10_
  
  - [x] 5.2 Add email notifications to order controller
    - Send confirmation email to customer on order creation
    - Send notification email to admin on order creation
    - Send payment request email on status change to 'payment_requested'
    - Send dispatch notification on status change to 'dispatched'
    - _Requirements: 5.8, 5.9, 14.1, 14.2, 14.3, 7.7, 7.8, 7.9_
  
  - [x]* 5.3 Write unit tests for email service
    - Test email sending with mock SMTP server
    - Test error handling when email service fails
    - Test that order creation succeeds even if email fails
    - _Requirements: 14.9, 14.10_

- [x] 6. Implement appointment management backend
  - [x] 6.1 Create appointment controller
    - Implement createAppointment endpoint with validation
    - Validate date is in the future
    - Generate unique token for appointment tracking
    - Insert appointment in database
    - _Requirements: 8.6, 8.7, 8.8, 8.9_
  
  - [x] 6.2 Add email notifications to appointment controller
    - Send confirmation email to customer on appointment creation
    - Send notification email to admin on appointment creation
    - Send confirmation update when status changes to 'confirmed'
    - _Requirements: 8.10, 8.11, 14.4, 14.5, 14.6, 9.6_
  
  - [x] 6.3 Implement appointment tracking endpoint
    - Create getAppointmentByToken endpoint
    - Query database for appointment with matching token
    - Return appointment details or 404 if not found
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 6.4 Create appointment routes
    - Set up POST /api/appointments, GET /api/appointments/:token
    - Set up GET /api/appointments (protected), PUT /api/appointments/:id/status (protected)
    - Apply JWT middleware to protected routes
    - _Requirements: 8.6, 9.1_


- [x] 7. Implement contact form backend
  - [x] 7.1 Create contact controller
    - Implement submitContact endpoint with validation
    - Insert contact message in database
    - Send notification email to admin
    - _Requirements: 16.4, 16.5, 16.6_
  
  - [x] 7.2 Create contact routes
    - Set up POST /api/contact
    - _Requirements: 16.4_

- [x] 8. Checkpoint - Backend API complete
  - Ensure all backend tests pass
  - Test all API endpoints with Postman or similar tool
  - Verify database schema and relationships
  - Ask the user if questions arise

- [x] 9. Set up frontend React application
  - [x] 9.1 Initialize React app with required dependencies
    - Install react, react-dom, react-router-dom, axios
    - Install tailwindcss, autoprefixer, postcss
    - Set up Tailwind configuration with glassmorphism utilities
    - _Requirements: 1.1_
  
  - [x] 9.2 Configure Tailwind CSS for glassmorphism
    - Add backdrop-blur utilities to Tailwind config
    - Create custom glass color palette with RGBA values
    - Add custom border and shadow utilities
    - Configure responsive breakpoints (mobile: <768px, tablet: 768-1024px, desktop: >1024px)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3_
  
  - [x] 9.3 Set up React Router with route structure
    - Create routes for Home, Products, Appointments, Track Order, Contact, Cart
    - Create admin routes for Login, Dashboard, Products, Orders, Appointments
    - Implement protected route wrapper for admin routes
    - _Requirements: 19.1_

- [x] 10. Create core glassmorphism components
  - [x] 10.1 Create GlassCard component
    - Implement reusable card with backdrop-blur, semi-transparent background, border
    - Support blur intensity props (sm, md, lg)
    - Support opacity customization
    - Add hover effects when interactive
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x]* 10.2 Write property test for GlassCard styling
    - **Property 1: Glassmorphism Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - Test that all glass components have required CSS properties
    - Test with different blur and opacity values
  
  - [x] 10.3 Create responsive utility functions
    - Implement applyResponsiveBreakpoint() function
    - Implement calculateResponsiveLayout() function
    - Create custom hook useBreakpoint() for responsive behavior
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x]* 10.4 Write property test for responsive breakpoints
    - **Property 4: Responsive Breakpoint Coverage**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Test that every window width maps to exactly one breakpoint
    - Test breakpoint transitions at boundary values

- [x] 11. Create layout components
  - [x] 11.1 Create Header component
    - Implement navigation with logo and links
    - Add hamburger menu for mobile (<768px)
    - Display cart icon with item count badge
    - Apply glassmorphism styling with backdrop blur
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8_
  
  - [x] 11.2 Create Footer component
    - Display pharmacy information and contact details
    - Add social media links
    - Apply glassmorphism styling
    - _Requirements: 1.1_
  
  - [x] 11.3 Create WhatsApp floating button
    - Position button in bottom-right corner
    - Apply glassmorphism styling
    - Open WhatsApp with pre-filled message on click
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_


- [x] 12. Implement shopping cart functionality
  - [x] 12.1 Create cart context and state management
    - Implement CartContext with add, remove, update, clear actions
    - Calculate cart total dynamically
    - Persist cart to localStorage
    - Restore cart from localStorage on app load
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x]* 12.2 Write property test for cart total calculation
    - **Property 3: Order Total Correctness**
    - **Validates: Requirements 4.6**
    - Test that cart total equals sum of all item subtotals
    - Test with various item combinations and quantities
  
  - [x]* 12.3 Write unit tests for cart operations
    - Test add to cart functionality
    - Test quantity updates
    - Test item removal
    - Test localStorage persistence
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.8_

- [x] 13. Create product-related components
  - [x] 13.1 Create ProductCard component
    - Display product image, name, price, description, stock status
    - Show "Add to Cart" button with glass styling
    - Support grid and list layout modes
    - Handle responsive image sizing
    - _Requirements: 3.3, 3.4, 3.5_
  
  - [x] 13.2 Create ProductGrid component
    - Display products in responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
    - Implement lazy loading for product images
    - _Requirements: 3.1, 2.1, 2.2, 2.3, 25.4_
  
  - [x] 13.3 Create product search and filter components
    - Implement search input with real-time filtering
    - Create category filter dropdown
    - Add "In Stock Only" toggle
    - Apply filters to product list
    - _Requirements: 3.6, 3.7, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [x] 14. Create form components with validation
  - [x] 14.1 Create form validation utilities
    - Implement validateOrderForm() function
    - Implement validateAppointmentForm() function
    - Implement validateContactForm() function
    - Add email format validation
    - Add phone number validation
    - Add date validation (future dates only)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_
  
  - [x]* 14.2 Write property test for form validation
    - **Property 8: Form Validation Completeness**
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4**
    - Test that validation is consistent for same input
    - Test all validation rules
  
  - [x] 14.3 Create glass-styled form input components
    - Create GlassInput component with glassmorphism styling
    - Create GlassTextarea component
    - Create GlassSelect component
    - Create GlassButton component
    - Add focus states and error styling
    - _Requirements: 1.1, 29.5, 29.6_

- [ ] 15. Implement customer-facing pages
  - [ ] 15.1 Create Home page
    - Display hero section with glassmorphism
    - Show featured products
    - Add call-to-action sections
    - Implement responsive layout
    - _Requirements: 1.1, 2.1, 2.2, 2.3_
  
  - [ ] 15.2 Create Products page
    - Display ProductGrid with all products
    - Add search and filter functionality
    - Implement category navigation
    - Show product count and filtering status
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ] 15.3 Create Cart page
    - Display cart items with quantity controls
    - Show cart total
    - Add "Proceed to Checkout" button
    - Handle empty cart state
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  
  - [ ] 15.4 Create Checkout page
    - Display order form with customer information fields
    - Show order summary with cart items and total
    - Implement form validation with real-time feedback
    - Handle order submission and redirect to success page
    - _Requirements: 5.1, 5.2, 5.11, 15.1, 15.2, 15.3, 15.4, 15.7, 15.8_


  - [ ] 15.5 Create Track Order page
    - Display token input form
    - Show order details in glass card when found
    - Display order status timeline
    - Show all order items with quantities and prices
    - Handle invalid token with error message
    - _Requirements: 6.1, 6.5, 6.6, 6.7_
  
  - [ ] 15.6 Create Appointments page
    - Display appointment booking form with glass styling
    - Add service selection dropdown (Dermatology, LabTest, Pharmacist)
    - Implement date picker for future dates only
    - Handle form submission and show success message
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.13_
  
  - [ ] 15.7 Create Contact page
    - Display contact form with glass styling
    - Show pharmacy contact information
    - Implement form validation
    - Handle form submission and show success message
    - _Requirements: 16.1, 16.2, 16.3, 16.7, 16.8_

- [ ] 16. Checkpoint - Customer pages complete
  - Test all customer-facing pages on mobile, tablet, and desktop
  - Verify glassmorphism effects render correctly
  - Test form validations and submissions
  - Ensure all tests pass
  - Ask the user if questions arise

- [ ] 17. Implement admin authentication
  - [ ] 17.1 Create admin login page
    - Display login form with username and password fields
    - Apply glassmorphism styling
    - Handle form submission
    - Store JWT token in localStorage on success
    - Redirect to dashboard on successful login
    - Display error message on failed login
    - _Requirements: 10.1, 10.2, 10.9, 10.10_
  
  - [ ] 17.2 Create protected route wrapper
    - Check for JWT token in localStorage
    - Verify token is not expired
    - Redirect to login if token is missing or invalid
    - Allow access to protected routes if token is valid
    - _Requirements: 11.10_
  
  - [ ] 17.3 Create API service with authentication
    - Create axios instance with interceptors
    - Add Authorization header with JWT token to all requests
    - Handle 401 responses by redirecting to login
    - Remove token from localStorage on 401
    - _Requirements: 11.10_

- [ ] 18. Create admin dashboard components
  - [ ] 18.1 Create AdminSidebar component
    - Display navigation menu with icons
    - Highlight active route
    - Support collapse/expand on mobile
    - Apply glassmorphism styling
    - Show user role and logout button
    - _Requirements: 2.7_
  
  - [ ] 18.2 Create dashboard statistics cards
    - Display pending orders count
    - Display pending appointments count
    - Display products in stock count
    - Display total revenue from completed orders
    - Apply glassmorphism styling to stat cards
    - _Requirements: 17.2, 17.3, 17.4, 17.5, 17.7_
  
  - [ ] 18.3 Create data table component
    - Display data in responsive table with glass styling
    - Support sorting and pagination
    - Add action buttons for each row
    - Handle mobile layout (stacked cards)
    - _Requirements: 17.8, 17.9_

- [ ] 19. Implement admin product management
  - [ ] 19.1 Create admin products list page
    - Display all products in data table
    - Add "Create Product" button
    - Show edit and delete actions for each product
    - Implement pagination (20 items per page)
    - _Requirements: 25.8_
  
  - [ ] 19.2 Create product form component
    - Add fields for name, category, price, description, stock
    - Add image and video upload inputs
    - Implement form validation
    - Handle file uploads with progress indication
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 19.3 Create product create/edit page
    - Use product form component
    - Handle create and update operations
    - Show success/error messages
    - Redirect to products list on success
    - _Requirements: 12.10, 12.11_
  
  - [ ] 19.4 Implement product delete functionality
    - Add confirmation dialog before deletion
    - Handle delete API call
    - Update products list after deletion
    - _Requirements: 12.12_


- [ ] 20. Implement admin order management
  - [ ] 20.1 Create admin orders list page
    - Display all orders in data table
    - Show customer name, total, status, date
    - Add filter by status
    - Implement pagination (20 items per page)
    - Add view details action for each order
    - _Requirements: 17.8, 25.8_
  
  - [ ] 20.2 Create order details page
    - Display full order information in glass cards
    - Show all order items with product details
    - Display customer information
    - Add status update dropdown
    - Handle status update with validation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 20.3 Implement order status update functionality
    - Validate status transitions before submission
    - Show error message for invalid transitions
    - Update order status via API
    - Show success message and refresh order details
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ] 21. Implement admin appointment management
  - [ ] 21.1 Create admin appointments list page
    - Display all appointments in data table
    - Show customer name, service, date, status
    - Add filter by status and service
    - Implement pagination (20 items per page)
    - Add view details action for each appointment
    - _Requirements: 17.9, 25.8_
  
  - [ ] 21.2 Create appointment details page
    - Display full appointment information in glass card
    - Show customer information and message
    - Add status update dropdown
    - Handle status update
    - _Requirements: 9.5, 9.6, 9.7_
  
  - [ ] 21.3 Implement appointment status update functionality
    - Update appointment status via API
    - Show success message and refresh appointment details
    - _Requirements: 9.6, 9.7_

- [ ] 22. Implement admin dashboard overview
  - [ ] 22.1 Create admin dashboard home page
    - Display statistics cards at top
    - Show recent orders table
    - Show recent appointments table
    - Add quick action buttons
    - Apply responsive layout
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9_

- [ ] 23. Checkpoint - Admin dashboard complete
  - Test all admin pages and functionality
  - Verify authentication and authorization
  - Test CRUD operations for products, orders, appointments
  - Ensure all tests pass
  - Ask the user if questions arise

- [ ] 24. Implement accessibility features
  - [ ] 24.1 Add ARIA labels and alt text
    - Add alt text to all product images
    - Add ARIA labels to icon-only buttons
    - Add ARIA live regions for dynamic content
    - _Requirements: 29.1, 29.4_
  
  - [ ] 24.2 Ensure keyboard accessibility
    - Test all interactive elements with keyboard navigation
    - Add visible focus indicators
    - Ensure proper tab order
    - _Requirements: 29.2, 29.6_
  
  - [ ] 24.3 Verify color contrast and labels
    - Ensure sufficient color contrast for text
    - Associate labels with all form inputs
    - _Requirements: 29.3, 29.5_
  
  - [ ]* 24.4 Test with screen reader
    - Verify screen reader navigation works correctly
    - Test form announcements
    - Test dynamic content updates
    - _Requirements: 29.7_

- [ ] 25. Implement performance optimizations
  - [ ] 25.1 Add image optimization
    - Implement lazy loading for product images
    - Add responsive image srcset
    - Compress images to <200KB
    - _Requirements: 25.4_
  
  - [ ] 25.2 Implement code splitting
    - Split admin bundle from customer bundle
    - Lazy load route components
    - Separate vendor bundle
    - _Requirements: 25.5_
  
  - [ ] 25.3 Add API response optimization
    - Implement gzip compression on backend
    - Add pagination to all list endpoints
    - _Requirements: 25.8, 25.9_
  
  - [ ]* 25.4 Run performance audit
    - Test First Contentful Paint (<1.5s target)
    - Test Largest Contentful Paint (<2.5s target)
    - Test Time to Interactive (<3.5s target)
    - _Requirements: 25.1, 25.2, 25.3_


- [ ] 26. Implement security enhancements
  - [ ] 26.1 Add security middleware
    - Implement rate limiting (100 requests/minute per IP)
    - Add helmet.js for security headers
    - Configure CORS with origin whitelist
    - Add request size limits
    - _Requirements: 26.4, 26.5, 26.9_
  
  - [ ] 26.2 Implement input sanitization
    - Add express-validator to all endpoints
    - Sanitize user inputs to prevent XSS
    - Validate file uploads with magic numbers
    - _Requirements: 26.3, 22.1_
  
  - [ ] 26.3 Add Content Security Policy
    - Configure CSP headers
    - Whitelist allowed sources for scripts and styles
    - _Requirements: 26.7_
  
  - [ ]* 26.4 Run security audit
    - Run npm audit and fix vulnerabilities
    - Test for SQL injection vulnerabilities
    - Test for XSS vulnerabilities
    - _Requirements: 26.3_

- [ ] 27. Implement error handling and logging
  - [ ] 27.1 Add comprehensive error logging
    - Log all errors with timestamp and stack trace
    - Log failed authentication attempts
    - Implement log rotation
    - _Requirements: 24.1, 24.4, 24.7_
  
  - [ ] 27.2 Implement user-friendly error messages
    - Return generic error messages to clients
    - Add specific field-level validation errors
    - Create error boundary component for React
    - _Requirements: 24.2, 24.5_
  
  - [ ] 27.3 Add admin audit logging
    - Log all admin CRUD operations
    - Log order and appointment status changes
    - Store audit logs in database
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6_

- [ ] 28. Implement browser compatibility and fallbacks
  - [ ] 28.1 Add glassmorphism fallbacks
    - Detect backdrop-filter support
    - Apply solid background colors as fallback
    - Test in older browsers
    - _Requirements: 1.6, 28.5_
  
  - [ ] 28.2 Add browser compatibility message
    - Display message for unsupported browsers
    - Ensure core functionality works without glassmorphism
    - _Requirements: 28.6, 28.7_

- [ ] 29. Implement data persistence and backup
  - [ ] 29.1 Set up database transactions
    - Use transactions for order creation
    - Implement rollback on errors
    - _Requirements: 27.4, 27.5_
  
  - [ ] 29.2 Add database indexes
    - Create indexes on token, email, category, status columns
    - Verify query performance improvements
    - _Requirements: 27.7_
  
  - [ ]* 29.3 Document backup procedures
    - Document daily backup process
    - Document 30-day retention policy
    - _Requirements: 27.2, 27.3_

- [ ] 30. Create API documentation and testing
  - [ ]* 30.1 Write API documentation
    - Document all endpoints with request/response examples
    - Add authentication requirements
    - Document error responses
  
  - [ ]* 30.2 Create Postman collection
    - Add all API endpoints to collection
    - Include authentication examples
    - Add test scripts for common scenarios

- [ ] 31. Final integration and testing
  - [ ] 31.1 End-to-end testing
    - Test complete customer order flow
    - Test complete appointment booking flow
    - Test admin dashboard workflows
    - Test responsive behavior on real devices
    - _Requirements: All_
  
  - [ ]* 31.2 Cross-browser testing
    - Test on Chrome 90+
    - Test on Firefox 88+
    - Test on Safari 14+
    - Test on Edge 90+
    - _Requirements: 28.1, 28.2, 28.3, 28.4_
  
  - [ ]* 31.3 Load testing
    - Test API performance under load
    - Verify database connection pool handling
    - Test concurrent user scenarios
    - _Requirements: 23.1, 25.6, 25.7_

- [ ] 32. Final checkpoint - Feature complete
  - Verify all requirements are met
  - Ensure all tests pass
  - Review code quality and documentation
  - Prepare deployment documentation
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript for frontend and JavaScript for backend as specified in the design
- All glassmorphism effects should gracefully degrade in browsers without backdrop-filter support
- Security and performance are integrated throughout rather than added at the end

