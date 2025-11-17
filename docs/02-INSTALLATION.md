# 📦 Installation Guide

Complete installation instructions for Nexus WhatsApp API.

---

## 📋 System Requirements

### Minimum Requirements
- **OS:** Linux, macOS, Windows (WSL2)
- **Node.js:** 18.x or higher
- **PostgreSQL:** 14.x or higher
- **RAM:** 512MB minimum, 1GB recommended
- **Disk:** 1GB available space

### Recommended for Production
- **RAM:** 2GB+
- **CPU:** 2 cores+
- **Disk:** 10GB+ (for logs and temp files)
- **Network:** Stable internet connection

---

## 🔧 Development Installation

### Step 1: Install Dependencies

#### Node.js
```bash
# macOS (Homebrew)
brew install node@18

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version  # Should be 18+
npm --version
```

#### PostgreSQL
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

#### Git
```bash
# macOS
brew install git

# Linux
sudo apt-get install git

# Verify
git --version
```

### Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/nexus-whatsapp-api.git nexus
cd nexus
```

### Step 3: Install Node Modules

```bash
npm install
```

**Expected output:**
```
added 300+ packages in 30s
```

### Step 4: Database Setup

#### Create Database
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# In psql shell:
CREATE DATABASE nexus_db;
CREATE USER nexus_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE nexus_db TO nexus_user;
\q
```

#### Configure Connection
```bash
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL="postgresql://nexus_user:secure_password@localhost:5432/nexus_db?schema=public"
```

#### Run Migrations
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Verify
npx prisma studio  # Opens GUI at http://localhost:5555
```

### Step 5: Configure Environment

Edit `.env` with required credentials:

```bash
# ========================================
# DATABASE
# ========================================
DATABASE_URL="postgresql://nexus_user:secure_password@localhost:5432/nexus_db?schema=public"

# ========================================
# SERVER
# ========================================
PORT=3000
NODE_ENV=development

# ========================================
# SECURITY
# ========================================
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_generated_32plus_character_secret_here"
JWT_EXPIRES_IN="24h"

# ========================================
# WHATSAPP BUSINESS API
# ========================================
WHATSAPP_API_VERSION="v21.0"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_business_account_id"
WHATSAPP_ACCESS_TOKEN="your_access_token"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_custom_verify_token"

# ========================================
# AWS S3
# ========================================
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# ========================================
# ANTHROPIC AI
# ========================================
ANTHROPIC_API_KEY="sk-ant-your_api_key"
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
ANTHROPIC_MAX_TOKENS=1024

# ========================================
# APPLICATION SETTINGS
# ========================================
CHAT_TIMEOUT_MINUTES=15
LOG_LEVEL=debug  # debug, info, warn, error

# ========================================
# CORS (Development)
# ========================================
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### Step 6: Create Admin User

```bash
npm run create-admin
```

**Follow prompts:**
```
Email: admin@nexus.com
Password: ********
Confirm Password: ********
✅ Admin user created successfully!
```

### Step 7: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
[INFO] Environment validation passed
[INFO] Server starting on port 3000...
[INFO] Database connected
[INFO] Cron jobs initialized
[INFO] ✅ Server running on http://localhost:3000
```

### Step 8: Verify Installation

Visit http://localhost:3000/health

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T10:30:00.000Z",
  "uptime": 5.234,
  "services": {
    "database": "connected",
    "whatsapp": "configured",
    "s3": "configured",
    "anthropic": "configured"
  },
  "memory": {
    "used": "45.2 MB",
    "total": "512 MB"
  }
}
```

---

## 🐳 Docker Installation

### Prerequisites
```bash
# Install Docker
# macOS/Windows: Download Docker Desktop
# Linux: https://docs.docker.com/engine/install/

# Verify
docker --version
docker-compose --version
```

### Option 1: Full Stack (App + DB)

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Stop
docker-compose down
```

### Option 2: DB Only (Develop Locally)

```bash
# Start PostgreSQL only
docker-compose -f docker-compose.db.yml up -d

# Configure .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexus_db"

# Run app locally
npm run dev
```

### Docker Commands

```bash
# Rebuild after changes
docker-compose up -d --build

# View logs
docker-compose logs -f api
docker-compose logs -f db

# Execute commands in container
docker-compose exec api npm run create-admin
docker-compose exec api npx prisma studio

# Access database
docker-compose exec db psql -U postgres nexus_db

# Clean up
docker-compose down -v  # Removes volumes too
```

---

## 🌐 Production Installation

### Render.com (Recommended)

#### 1. Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Configure:
   ```
   Name: nexus-db
   Database: nexus_db
   User: nexus_user
   Region: (Choose closest to users)
   Plan: (Free/Starter)
   ```
4. Click **Create Database**
5. Copy **Internal Database URL** (starts with `postgresql://`)

#### 2. Create Web Service

1. Click **New +** → **Web Service**
2. Connect GitHub repository
3. Configure:

**Basic:**
```
Name: nexus-api
Environment: Node
Region: (Same as database)
Branch: main
```

**Build & Deploy:**
```
Build Command:
npm install && npx prisma generate && npx prisma migrate deploy

Start Command:
npm start

Health Check Path:
/health
```

**Advanced:**
```
Auto-Deploy: Yes
```

#### 3. Environment Variables

Click **Environment** tab and add:

```bash
DATABASE_URL=<paste internal database URL from step 1>
NODE_ENV=production
PORT=3000
JWT_SECRET=<32+ character secret>
JWT_EXPIRES_IN=24h
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=<your_id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<your_id>
WHATSAPP_ACCESS_TOKEN=<your_token>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<your_token>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your_key>
AWS_SECRET_ACCESS_KEY=<your_secret>
AWS_S3_BUCKET_NAME=<your_bucket>
ANTHROPIC_API_KEY=<your_key>
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024
CHAT_TIMEOUT_MINUTES=15
LOG_LEVEL=info
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### 4. Deploy

1. Click **Create Web Service**
2. Wait for deployment (~2-3 minutes)
3. Visit `https://your-app.onrender.com/health`

#### 5. Create Admin User

```bash
# In Render dashboard, open Shell
npm run create-admin
```

### VPS (Ubuntu 22.04)

#### 1. Initial Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Nginx
sudo apt-get install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Setup Database

```bash
sudo -u postgres psql
CREATE DATABASE nexus_db;
CREATE USER nexus_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nexus_db TO nexus_user;
\q
```

#### 3. Deploy Application

```bash
# Create app user
sudo useradd -m -s /bin/bash nexus
sudo su - nexus

# Clone repository
git clone https://github.com/yourusername/nexus-whatsapp-api.git app
cd app

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Run migrations
npx prisma generate
npx prisma migrate deploy

# Create admin
npm run create-admin
```

#### 4. Setup PM2

```bash
# Start app
pm2 start npm --name "nexus-api" -- start

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
# Run the command it outputs

# Monitor
pm2 status
pm2 logs nexus-api
```

#### 5. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/nexus
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔍 Verification Checklist

After installation, verify:

- [ ] `/health` endpoint returns `200 OK`
- [ ] Database connection successful
- [ ] Environment variables loaded
- [ ] Admin user can login
- [ ] WhatsApp webhook configured
- [ ] S3 upload works
- [ ] AI responses generate
- [ ] Logs being written
- [ ] Cron jobs running

---

## 🧪 Testing Installation

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexus.com","password":"your_password"}'

# Should return JWT token
```

---

## 🔧 Troubleshooting

### Port already in use

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port
PORT=3001 npm run dev
```

### Database connection fails

```bash
# Test connection
psql postgresql://nexus_user:password@localhost:5432/nexus_db -c "SELECT 1"

# Check PostgreSQL is running
sudo systemctl status postgresql
```

### Prisma errors

```bash
# Regenerate client
npx prisma generate

# Reset database (⚠️ deletes data!)
npx prisma migrate reset
```

### Module not found

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

- **[Configuration Guide](./03-CONFIGURATION.md)** - Detailed settings
- **[API Reference](./06-API-REFERENCE.md)** - Explore endpoints
- **[Development Guide](./15-DEVELOPMENT.md)** - Start coding
- **[Deployment Guide](./10-DEPLOYMENT.md)** - Production tips

---

**Installation Complete!** 🎉 Your Nexus API is ready to use.
