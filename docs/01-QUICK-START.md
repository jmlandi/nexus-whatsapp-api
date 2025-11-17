# 🚀 Quick Start Guide

Get Nexus WhatsApp API running in 5 minutes!

---

## 📋 Prerequisites

Ensure you have:

- ✅ **Node.js 18+** ([download](https://nodejs.org/))
- ✅ **PostgreSQL 14+** ([download](https://www.postgresql.org/))
- ✅ **Git** installed
- ✅ API credentials:
  - WhatsApp Business API (Meta)
  - AWS S3 bucket
  - Anthropic Claude API key

---

## ⚡ Local Setup (5 Minutes)

### 1. Clone and Install

```bash
git clone <your-repo-url> nexus
cd nexus
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required variables:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_db"
JWT_SECRET="<generate 32+ character secret>"
WHATSAPP_PHONE_NUMBER_ID="your_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="your_id"
WHATSAPP_ACCESS_TOKEN="your_token"
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
AWS_S3_BUCKET_NAME="your-bucket"
ANTHROPIC_API_KEY="sk-ant-xxx"
```

> 💡 Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate dev
npm run create-admin  # Follow prompts
```

### 4. Start Server

```bash
npm run dev  # Development
npm start    # Production
```

### 5. Verify

Visit http://localhost:3000/health

**Expected:**
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "whatsapp": "configured",
    "s3": "configured",
    "anthropic": "configured"
  }
}
```

✅ **Running on** `http://localhost:3000`

---

## 🐳 Docker Setup

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

## 🌐 Render.com Deployment

### 1. Create Services

**Web Service:**
- Name: `nexus-api`
- Build: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start: `npm start`
- Health Check: `/health`

**PostgreSQL:**
- Name: `nexus-db`
- Copy Internal Database URL

### 2. Environment Variables

Add in Render dashboard:

```bash
DATABASE_URL=<internal database URL>
JWT_SECRET=<32+ characters>
WHATSAPP_PHONE_NUMBER_ID=<your_id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<your_id>
WHATSAPP_ACCESS_TOKEN=<your_token>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your_key>
AWS_SECRET_ACCESS_KEY=<your_secret>
AWS_S3_BUCKET_NAME=<your_bucket>
ANTHROPIC_API_KEY=<your_key>
ALLOWED_ORIGINS=https://yourdomain.com
```

### 3. Deploy

Click **Create Web Service** and wait for deployment.

Verify: `https://your-app.onrender.com/health`

---

## 📱 WhatsApp Configuration

### 1. Meta App Setup

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create App → **Business** type
3. Add **WhatsApp** product

### 2. Configure Webhook

In WhatsApp Configuration:
```
Callback URL: https://your-domain.com/api/webchat/webhook
Verify Token: <same as WHATSAPP_WEBHOOK_VERIFY_TOKEN>
Subscribe to: messages
```

### 3. Get Credentials

- **Phone Number ID**: WhatsApp → API Setup
- **Business Account ID**: App Dashboard
- **Access Token**: Generate (create permanent token later)

---

## 🪣 AWS S3 Setup

### 1. Create Bucket

```bash
aws s3 mb s3://nexus-reports --region us-east-1
```

Or via console:
1. [S3 Console](https://console.aws.amazon.com/s3/)
2. Create bucket: `nexus-reports`
3. Region: `us-east-1`
4. Uncheck "Block all public access" (using signed URLs)

### 2. Create IAM User

1. [IAM Console](https://console.aws.amazon.com/iam/)
2. Users → Add user: `nexus-api`
3. Access type: **Programmatic**
4. Attach policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::nexus-reports/*"
  }]
}
```

5. Save Access Key ID and Secret

---

## 🤖 Anthropic Setup

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create API Key
3. Choose model:
   - `claude-3-5-sonnet-20241022` (recommended)
   - `claude-3-opus-20240229` (highest quality)
   - `claude-3-sonnet-20240229` (fast)

---

## 🔧 Common Issues

### Database connection fails

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### JWT_SECRET too short

```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### WhatsApp API errors

- Verify token in Meta App Dashboard
- Regenerate if expired
- Ensure token has WhatsApp permissions

### S3 upload fails

- Check IAM permissions
- Verify bucket name
- Ensure region matches

---

## 📚 Next Steps

- **Test API:** Use `/api/auth/login` to get JWT
- **Create Customers:** POST to `/api/customers`
- **Upload Reports:** POST to `/api/reports`
- **Send WhatsApp:** POST to `/api/templates/send`
- **Monitor:** Check `/health` regularly

---

## 📖 Documentation

- **[Installation Guide](./02-INSTALLATION.md)** - Detailed setup
- **[Configuration](./03-CONFIGURATION.md)** - All settings
- **[API Reference](./06-API-REFERENCE.md)** - Endpoints
- **[Deployment](./10-DEPLOYMENT.md)** - Production guide
- **[Troubleshooting](./19-TROUBLESHOOTING.md)** - Common issues

---

## 🆘 Support

- Health Check: `/health`
- Logs: `logs/combined.log`
- Debug: `LOG_LEVEL=debug` in `.env`

---

**Ready!** Your Nexus API is running! 🎉
