# Environment Variables Reference for Render

Quick reference for setting up environment variables in Render Dashboard.

## 🔑 Required Environment Variables

### Database (Auto-configured by Render)
```
DATABASE_URL=<automatically set from PostgreSQL service>
```

### Node.js Configuration
```
NODE_ENV=production
PORT=10000
```

### WhatsApp Business API (Meta)
```
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=<your_phone_number_id>
WHATSAPP_BUSINESS_ACCOUNT_ID=<your_business_account_id>
WHATSAPP_ACCESS_TOKEN=<your_access_token>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<generate_random_secure_token>
```

**Where to get WhatsApp credentials:**
1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Navigate to WhatsApp API Settings
3. Find your Phone Number ID and Business Account ID
4. Generate or use existing Access Token

### AWS S3
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your_access_key>
AWS_SECRET_ACCESS_KEY=<your_secret_key>
AWS_S3_BUCKET_NAME=<your_bucket_name>
```

**Where to get AWS credentials:**
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create a new IAM user with S3 permissions
3. Generate Access Key and Secret Key
4. Create an S3 bucket in the desired region

### Anthropic AI (Claude)
```
ANTHROPIC_API_KEY=<your_anthropic_api_key>
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024
```

**Where to get Anthropic API Key:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Generate a new API key

### JWT Authentication
```
JWT_SECRET=<generate_random_secure_token>
JWT_EXPIRES_IN=24h
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Application Settings
```
CHAT_TIMEOUT_MINUTES=15
MAX_PAGE_SIZE=100
DEFAULT_PAGE_SIZE=20
```

---

## 🚀 Quick Setup in Render Dashboard

1. **Go to your Web Service** → Environment tab
2. **Click "Add Environment Variable"** for each variable below
3. **Mark sensitive variables as "Secret"** (they'll be hidden)

### Copy-Paste Template (Replace values with yours)

```bash
# Node Configuration
NODE_ENV=production
PORT=10000

# WhatsApp (REPLACE WITH YOUR VALUES)
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=generate_random_token_here

# AWS S3 (REPLACE WITH YOUR VALUES)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_S3_BUCKET_NAME=your_bucket_name_here

# Anthropic AI (REPLACE WITH YOUR VALUE)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024

# JWT (GENERATE A RANDOM TOKEN)
JWT_SECRET=generate_random_64_char_hex_here
JWT_EXPIRES_IN=24h

# Application
CHAT_TIMEOUT_MINUTES=15
MAX_PAGE_SIZE=100
DEFAULT_PAGE_SIZE=20
```

---

## 🔒 Security Notes

- **NEVER** commit `.env` files to Git
- **ALWAYS** mark sensitive variables as "Secret" in Render
- **ROTATE** tokens regularly (every 90 days recommended)
- **USE** strong random values for JWT_SECRET and WHATSAPP_WEBHOOK_VERIFY_TOKEN
- **LIMIT** IAM permissions for AWS credentials (only S3 access needed)

---

## ✅ Validation Checklist

After setting all variables:

- [ ] All required variables are set
- [ ] Sensitive variables are marked as Secret
- [ ] DATABASE_URL is automatically set from PostgreSQL service
- [ ] JWT_SECRET is a strong random value (64+ characters)
- [ ] WHATSAPP_WEBHOOK_VERIFY_TOKEN matches what you'll use in Meta settings
- [ ] AWS credentials have S3 permissions
- [ ] Anthropic API key is valid and has credits

---

## 🧪 Testing Variables

After deploy, test that variables are loaded:

```bash
# SSH into Render shell and run:
node -e "console.log({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN ? '✓ Set' : '✗ Missing',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✓ Set' : '✗ Missing',
  JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ Missing'
})"
```

Expected output should show all variables as "✓ Set".
