# ⚙️ Configuration Guide

Complete reference for all configuration options in Nexus WhatsApp API.

---

## 📁 Configuration Files

### `.env` - Environment Variables
Main configuration file for all application settings.

### `.env.example` - Template
Template with all available options and documentation.

### `prisma/schema.prisma` - Database Schema
Database models and relationships.

### `package.json` - Dependencies
Node.js dependencies and scripts.

---

## 🔐 Environment Variables Reference

### Database Configuration

```bash
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_db?schema=public"

# Examples:
# Local: postgresql://postgres:postgres@localhost:5432/nexus_db
# Render: postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/nexus_db
# Docker: postgresql://postgres:postgres@db:5432/nexus_db
```

**Notes:**
- Use `localhost` for local development
- Use internal URL for Render (starts with `dpg-`)
- Use service name (`db`) for Docker Compose

---

### Server Configuration

```bash
# Port (default: 3000)
PORT=3000

# Environment (development, production, test)
NODE_ENV=development

# Log level (debug, info, warn, error)
LOG_LEVEL=info
```

**Recommended:**
- Development: `NODE_ENV=development`, `LOG_LEVEL=debug`
- Production: `NODE_ENV=production`, `LOG_LEVEL=info`
- Testing: `NODE_ENV=test`, `LOG_LEVEL=warn`

---

### Security Configuration

```bash
# JWT Secret (MUST be 32+ characters!)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your_64_character_hex_string_here"

# JWT expiration time
# Examples: 15m, 1h, 24h, 7d
JWT_EXPIRES_IN="24h"
```

**Security Requirements:**
- ✅ **Minimum 32 characters**
- ✅ Use cryptographically secure random bytes
- ✅ Never commit to version control
- ✅ Different secret per environment
- ✅ Rotate periodically (every 90 days)

**Generate secure secret:**
```bash
# Method 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: OpenSSL
openssl rand -hex 32

# Method 3: Online (use with caution)
# https://www.random.org/strings/
```

---

### WhatsApp Business API Configuration

```bash
# API version (default: v21.0)
WHATSAPP_API_VERSION="v21.0"

# Phone Number ID (from Meta App)
WHATSAPP_PHONE_NUMBER_ID="123456789012345"

# Business Account ID (from Meta App)
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321098765"

# Access Token (from Meta App)
WHATSAPP_ACCESS_TOKEN="EAAxxxxxxxxxxxxxxxxxx"

# Webhook Verify Token (custom, create your own)
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_custom_verify_token_here"
```

**How to get credentials:**

1. **Phone Number ID:**
   - Meta App Dashboard → WhatsApp → API Setup
   - Copy "Phone number ID"

2. **Business Account ID:**
   - Meta App Dashboard → Settings → Basic
   - Copy "WhatsApp Business Account ID"

3. **Access Token:**
   - Meta App Dashboard → WhatsApp → API Setup
   - Generate temporary token (24h)
   - Create System User for permanent token

4. **Webhook Verify Token:**
   - Create your own secure random string
   - Use same value when configuring webhook in Meta

**Best practices:**
- Use System User token for production (doesn't expire)
- Store token securely (never in logs/commits)
- Rotate tokens periodically
- Monitor token usage in Meta dashboard

---

### AWS S3 Configuration

```bash
# AWS Region (where your bucket is located)
AWS_REGION="us-east-1"

# IAM User credentials
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# S3 Bucket name
AWS_S3_BUCKET_NAME="nexus-reports-prod"
```

**S3 Bucket setup:**

1. **Create bucket:**
   ```bash
   aws s3 mb s3://nexus-reports-prod --region us-east-1
   ```

2. **Configure CORS:**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **IAM Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::nexus-reports-prod/*"
       }
     ]
   }
   ```

**Security notes:**
- Use separate bucket per environment (dev, staging, prod)
- Enable versioning for production
- Use lifecycle policies to archive old files
- Monitor costs with AWS Budgets

---

### Anthropic AI Configuration

```bash
# API Key (from Anthropic Console)
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxx"

# Model version
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"

# Max tokens per response
ANTHROPIC_MAX_TOKENS=1024
```

**Available models:**

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| `claude-3-5-sonnet-20241022` | **Recommended** - Balance | Fast | Medium |
| `claude-3-opus-20240229` | Highest quality | Slow | High |
| `claude-3-sonnet-20240229` | Cost-effective | Fast | Low |
| `claude-haiku-4-5-20251001` | Quick responses | Very Fast | Very Low |

**Token configuration:**
- `256` - Short responses (1-2 paragraphs)
- `512` - Medium responses (2-4 paragraphs)
- `1024` - **Recommended** - Detailed responses
- `2048` - Long-form content
- `4096` - Maximum (use sparingly)

**Cost optimization:**
- Use smaller models for simple queries
- Reduce `ANTHROPIC_MAX_TOKENS` if responses are too long
- Cache customer context when possible
- Monitor usage in Anthropic Console

---

### Application Settings

```bash
# Chat timeout (minutes before auto-close)
CHAT_TIMEOUT_MINUTES=15

# Cron schedule for chat cleanup (default: every hour)
CHAT_CLEANUP_CRON="0 * * * *"
```

**Chat timeout options:**
- `5` - Fast turnaround (high-volume)
- `15` - **Recommended** - Standard
- `30` - Extended conversations
- `60` - Low-priority chats

---

### CORS Configuration

```bash
# Allowed origins (comma-separated)
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com,https://www.yourdomain.com"

# Examples:
# Development: http://localhost:3000,http://localhost:3001
# Production: https://yourdomain.com,https://www.yourdomain.com
# Wildcard: * (⚠️ NOT recommended for production!)
```

**Security levels:**

| Level | Configuration | Use Case |
|-------|---------------|----------|
| **Strict** | Single domain | Production (recommended) |
| **Moderate** | 2-3 domains | Multi-domain apps |
| **Permissive** | Wildcard `*` | Development only |

---

## 📊 Configuration by Environment

### Development (.env.development)

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexus_dev"
JWT_SECRET="dev_secret_min_32_chars_replace_in_prod"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### Staging (.env.staging)

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL="postgresql://user:pass@staging-db:5432/nexus_staging"
JWT_SECRET="<secure 64-char secret>"
ALLOWED_ORIGINS="https://staging.yourdomain.com"
```

### Production (.env.production)

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
DATABASE_URL="postgresql://user:pass@prod-db:5432/nexus_prod"
JWT_SECRET="<secure 64-char secret - different from staging>"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
ANTHROPIC_MAX_TOKENS=512  # Optimize costs
CHAT_TIMEOUT_MINUTES=15
```

---

## 🔒 Security Best Practices

### ✅ Do's

- ✅ Use `.env.example` as template (no secrets)
- ✅ Keep `.env` in `.gitignore`
- ✅ Use different secrets per environment
- ✅ Rotate secrets every 90 days
- ✅ Use environment-specific configs
- ✅ Enable SSL/TLS in production
- ✅ Set `NODE_ENV=production`
- ✅ Limit CORS to specific domains
- ✅ Monitor failed login attempts
- ✅ Use IAM roles instead of keys when possible

### ❌ Don'ts

- ❌ Commit `.env` to version control
- ❌ Share secrets via email/chat
- ❌ Use same secret in dev and prod
- ❌ Leave default/placeholder values
- ❌ Use wildcard CORS (`*`) in production
- ❌ Log sensitive data
- ❌ Expose error details to clients
- ❌ Use short JWT secrets (<32 chars)

---

## 🧪 Validation

The application validates environment variables on startup:

```bash
npm start
```

**Output:**
```
🔍 Validating environment variables...

✅ Configured variables:
   DATABASE_URL - postgresql://****@localhost:5432/nexus_db
   JWT_SECRET - **** (64 characters)
   WHATSAPP_PHONE_NUMBER_ID - 123456789012345

⚠️  Warnings:
   - JWT_SECRET should be rotated every 90 days
   - LOG_LEVEL is set to 'debug' (consider 'info' for production)

✅ All critical environment variables are properly configured!
```

**Common errors:**

| Error | Solution |
|-------|----------|
| `Missing required variable: JWT_SECRET` | Add `JWT_SECRET` to `.env` |
| `Invalid value for JWT_SECRET` | Must be 32+ characters |
| `DATABASE_URL format invalid` | Check connection string format |
| `Cannot connect to database` | Verify PostgreSQL is running |

---

## 📝 Configuration Checklist

Before deploying, ensure:

- [ ] All required variables set
- [ ] JWT_SECRET is 32+ characters
- [ ] Database connection tested
- [ ] WhatsApp credentials valid
- [ ] AWS S3 bucket created
- [ ] Anthropic API key valid
- [ ] CORS origins configured
- [ ] NODE_ENV set correctly
- [ ] LOG_LEVEL appropriate
- [ ] Secrets rotated for production
- [ ] `.env` in `.gitignore`
- [ ] Health endpoint returns 200

---

## 📚 Related Documentation

- **[Installation Guide](./02-INSTALLATION.md)** - Setup instructions
- **[Security Guide](./13-SECURITY.md)** - Security best practices
- **[Deployment Guide](./10-DEPLOYMENT.md)** - Production deployment
- **[Troubleshooting](./19-TROUBLESHOOTING.md)** - Common issues

---

**Configuration complete!** Your Nexus API is properly configured. 🎉
