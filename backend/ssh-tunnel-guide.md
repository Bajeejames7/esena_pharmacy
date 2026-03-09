# SSH Tunnel Database Connection Guide

TrueHost blocks direct MySQL connections, so use an SSH tunnel instead.

## Prerequisites
- SSH access to your TrueHost cPanel account
- Your cPanel SSH credentials

## Setup SSH Tunnel

### 1. Get SSH credentials from cPanel:
- Login to cPanel
- Look for "SSH Access" or "Terminal" 
- Note your SSH details:
  - Hostname: bhs109.truehost.cloud (or your server)
  - Username: your_cpanel_username
  - Port: 22 (usually)

### 2. Create SSH tunnel:
Open a terminal and run:
```bash
ssh -L 3307:localhost:3306 your_cpanel_username@bhs109.truehost.cloud
```

This creates a tunnel: localhost:3307 → server:3306

### 3. Update your .env file:
```
DB_HOST=localhost
DB_PORT=3307
DB_USER=ohnokmqf_esena_user
DB_PASSWORD=Es3n@ph@rm@cy
DB_NAME=ohnokmqf_esena_pharmacy
```

### 4. Test connection:
- Keep SSH tunnel running in one terminal
- Run your Node.js app in another terminal

## Benefits
- ✅ Works even with blocked external access
- ✅ Encrypted connection
- ✅ No IP whitelisting needed
- ✅ More secure than direct access

## Alternative: Use phpMyAdmin Export/Import
If SSH doesn't work, you can:
1. Export your database from cPanel phpMyAdmin
2. Import it into a local MySQL instance
3. Develop locally, then sync changes back