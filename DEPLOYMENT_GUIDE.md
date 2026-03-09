# cPanel Deployment Guide for Esena Pharmacy

## 🚀 Quick Deployment Steps

### 1. Add Deployment Configuration
The `.cpanel.yml` file has been created and will:
- Build your React frontend
- Copy frontend files to `public_html/`
- Copy backend files to `public_html/api/`
- Install production dependencies

### 2. Commit and Push to GitHub
```bash
git add .cpanel.yml frontend/public/.htaccess backend/app.js backend/startup.js DEPLOYMENT_GUIDE.md
git commit -m "Add cPanel deployment configuration"
git push
```

### 3. Deploy in cPanel
1. Go to **Git Version Control** → **Manage Repository**
2. Click **Pull or Deploy**
3. Click **Deploy HEAD Commit**

## 🔧 Node.js Backend Setup (IMPORTANT!)

Since your app has a Node.js backend, you need to set up Node.js in cPanel:

### Step 1: Check Node.js Support
1. Search for "**Setup Node.js App**" in cPanel
2. If you find it, proceed to Step 2
3. If not found, contact Truehost support to enable Node.js

### Step 2: Create Node.js App
1. Go to **Setup Node.js App**
2. Click **Create Application**
3. Set these values:
   - **Node.js version**: Latest available (18+ recommended)
   - **Application mode**: Production
   - **Application root**: `public_html/api`
   - **Application URL**: `yourdomain.co.ke/api`
   - **Application startup file**: `app.js`

### Step 3: Install Dependencies
After creating the app:
1. Click **Run NPM Install** in the Node.js app interface
2. Or use the terminal: `cd public_html/api && npm install --production`

## 📁 File Structure After Deployment
```
public_html/
├── index.html              # React app entry point
├── static/                 # React build files
├── .htaccess              # React Router configuration
└── api/                   # Node.js backend
    ├── server.js
    ├── app.js             # cPanel entry point
    ├── package.json
    ├── .env               # Environment variables
    └── ... (all backend files)
```

## 🌐 URLs After Deployment
- **Frontend**: `https://esena.co.ke/`
- **Backend API**: `https://esena.co.ke/api/`
- **Health Check**: `https://esena.co.ke/api/` (should return JSON)

## ⚙️ Environment Variables
Make sure your `backend/.env` file contains:
```env
NODE_ENV=production
PORT=5000
# Your database and other config...
```

## 🔍 Troubleshooting

### Frontend loads but API calls fail:
1. Check if Node.js app is running in cPanel
2. Verify the API URL in browser: `https://esena.co.ke/api/`
3. Check Node.js app logs in cPanel

### Database connection issues:
1. Update database credentials in `backend/.env`
2. Ensure database server allows connections from web server
3. Check if database exists and tables are created

### File permissions:
```bash
chmod -R 755 public_html/
chmod 600 public_html/api/.env
```

## 📞 Next Steps
1. Deploy using the steps above
2. Test the frontend at your domain
3. Test API endpoints at `yourdomain.co.ke/api/`
4. Set up Node.js app if API calls fail
5. Configure database connection for production

Let me know if you encounter any issues during deployment!