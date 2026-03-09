# Local Development Database Setup

Since TrueHost blocks external MySQL connections, here's how to set up local development.

## Install MySQL Locally

### Windows (using Chocolatey):
```bash
choco install mysql
```

### Or download MySQL Community Server:
https://dev.mysql.com/downloads/mysql/

## Setup Local Database

### 1. Start MySQL service:
```bash
net start mysql
```

### 2. Connect to MySQL:
```bash
mysql -u root -p
```

### 3. Create your database:
```sql
CREATE DATABASE ohnokmqf_esena_pharmacy;
CREATE USER 'ohnokmqf_esena_user'@'localhost' IDENTIFIED BY 'Es3n@ph@rm@cy';
GRANT ALL PRIVILEGES ON ohnokmqf_esena_pharmacy.* TO 'ohnokmqf_esena_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Import your schema:
```bash
mysql -u ohnokmqf_esena_user -p ohnokmqf_esena_pharmacy < database/schema.sql
```

### 5. Update .env for local development:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=ohnokmqf_esena_user
DB_PASSWORD=Es3n@ph@rm@cy
DB_NAME=ohnokmqf_esena_pharmacy
```

## Export Data from Production

### 1. In cPanel phpMyAdmin:
- Select your database
- Click "Export"
- Choose "Quick" export method
- Download the .sql file

### 2. Import to local:
```bash
mysql -u ohnokmqf_esena_user -p ohnokmqf_esena_pharmacy < exported_data.sql
```

## Sync Changes Back

When ready to deploy:
1. Export your local changes
2. Import via cPanel phpMyAdmin
3. Or use deployment scripts