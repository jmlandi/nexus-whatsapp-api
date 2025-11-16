# 🔧 Render Deployment - Troubleshooting Guide

Common issues and solutions when deploying Nexus on Render.

## 🚨 Build Phase Issues

### ❌ Error: "build.sh: Permission denied"

**Symptom:**
```
/bin/sh: ./build.sh: Permission denied
```

**Cause:** Build script is not executable

**Solution:**
```bash
chmod +x build.sh
git add build.sh
git commit -m "Make build.sh executable"
git push origin main
```

---

### ❌ Error: "Cannot find module 'prisma'"

**Symptom:**
```
Error: Cannot find module 'prisma'
```

**Cause:** Prisma not installed or wrong dependency section

**Solution:**
Ensure in `package.json`:
```json
{
  "devDependencies": {
    "prisma": "^5.7.0"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0"
  }
}
```

The build script (`build.sh`) installs production dependencies and Prisma separately.

---

### ❌ Error: "Prisma schema not found"

**Symptom:**
```
Error: Could not find a schema.prisma file
```

**Cause:** `prisma/` directory not in repository

**Solution:**
```bash
git add prisma/
git commit -m "Add Prisma schema"
git push origin main
```

---

### ❌ Error: "Migration failed"

**Symptom:**
```
Error: P3009: migrate found failed migrations
```

**Cause:** Conflicting or incomplete migrations

**Solution:**

**Option 1 - Reset migrations (DEV ONLY):**
```bash
# Locally
rm -rf prisma/migrations/
npx prisma migrate dev --name init
git add prisma/migrations/
git commit -m "Reset migrations"
git push
```

**Option 2 - Mark as applied:**
```bash
# In Render shell
npx prisma migrate resolve --applied "migration_name"
```

---

## 🗄️ Database Issues

### ❌ Error: "Can't reach database server"

**Symptom:**
```
Error: Can't reach database server at `host.render.com:5432`
```

**Cause:** DATABASE_URL is incorrect or database not created

**Solution:**

1. **Verify DATABASE_URL in Render:**
   - Dashboard → Web Service → Environment
   - Should be: `postgresql://user:pass@host.render.com/dbname`

2. **Use Internal Database URL:**
   - Dashboard → PostgreSQL service
   - Copy "Internal Database URL" (not External)

3. **Check database is running:**
   - Dashboard → PostgreSQL service
   - Status should be "Available"

---

### ❌ Error: "Database does not exist"

**Symptom:**
```
Error: Database nexus_db does not exist
```

**Cause:** Database name mismatch

**Solution:**

Ensure DATABASE_URL database name matches your PostgreSQL database name:
```
postgresql://user:pass@host.render.com/nexus_db
                                        ^^^^^^^^^
                                        Must match exactly
```

---

### ❌ Error: "Too many connections"

**Symptom:**
```
Error: P1001: Can't reach database (too many connections)
```

**Cause:** Connection pool exhausted (common on Free tier)

**Solution:**

Add to DATABASE_URL:
```
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=5"
```

Or in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 5
}
```

---

## 🌐 Runtime Issues

### ❌ Error: "Application failed to respond"

**Symptom:**
Health check fails, app doesn't start

**Cause:** Port binding issue or startup error

**Solution:**

1. **Check PORT environment variable:**
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```
   Render provides `PORT=10000` automatically.

2. **Check logs:**
   - Dashboard → Logs
   - Look for startup errors

3. **Verify health check path:**
   - Should be `/health`
   - Should return 200 OK

---

### ❌ Error: "Cannot find module"

**Symptom:**
```
Error: Cannot find module 'express'
```

**Cause:** Dependencies not installed

**Solution:**

1. **Verify build command:** Should be `./build.sh`

2. **Check build.sh:**
   ```bash
   npm ci --only=production
   ```

3. **Ensure dependencies in package.json:**
   ```json
   {
     "dependencies": {
       "express": "^4.18.2",
       ...
     }
   }
   ```

---

### ❌ Service goes to sleep (Free tier)

**Symptom:**
App becomes unresponsive after 15 minutes of inactivity

**Cause:** Render Free tier spins down after inactivity

**Solutions:**

**Option 1 - Upgrade ($7/month):**
- Always on, no sleep

**Option 2 - External ping:**
Use UptimeRobot or similar to ping every 10 minutes:
```
https://your-app.onrender.com/health
```

**Option 3 - Accept sleep:**
First request will wake it (15-30 seconds delay)

---

## 🔐 Environment Variable Issues

### ❌ Error: "Missing required environment variable"

**Symptom:**
```
Error: WHATSAPP_ACCESS_TOKEN is required
```

**Cause:** Environment variable not set

**Solution:**

1. **Go to Render Dashboard**
2. **Web Service → Environment**
3. **Add missing variable**
4. **Redeploy**

---

### ❌ Error: "Invalid credentials"

**Symptom:**
WhatsApp API returns 401 or AWS S3 returns 403

**Cause:** Incorrect or expired credentials

**Solution:**

1. **Verify each credential:**
   - Test locally first
   - Ensure no extra spaces
   - Check expiration

2. **Regenerate if needed:**
   - WhatsApp: Meta Business Manager
   - AWS: IAM Console
   - Anthropic: Anthropic Console

3. **Update in Render and redeploy**

---

## 📡 WhatsApp Webhook Issues

### ❌ Webhook verification fails

**Symptom:**
Meta says "Webhook verification failed"

**Cause:** Verify token mismatch

**Solution:**

1. **Check WHATSAPP_WEBHOOK_VERIFY_TOKEN:**
   - Must match exactly in Meta and Render
   - Case-sensitive
   - No spaces

2. **Test endpoint manually:**
   ```bash
   curl "https://your-app.onrender.com/api/webhook/whatsapp?hub.verify_token=YOUR_TOKEN&hub.challenge=123"
   ```
   Should return: `123`

---

### ❌ Webhook receives no messages

**Symptom:**
Webhook verified but no messages arrive

**Cause:** Subscription not configured

**Solution:**

1. **In Meta Business Manager:**
   - WhatsApp → Configuration → Webhooks
   - Subscribe to: `messages`, `message_status`

2. **Verify webhook URL:**
   ```
   https://your-app.onrender.com/api/webhook/whatsapp
   ```

3. **Check logs:**
   - Render Dashboard → Logs
   - Should see incoming webhook calls

---

## 📦 AWS S3 Issues

### ❌ Error: "Access Denied" when uploading

**Symptom:**
```
Error: Access Denied
```

**Cause:** IAM permissions insufficient

**Solution:**

Ensure IAM policy includes:
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
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

---

### ❌ Error: "Bucket does not exist"

**Symptom:**
```
Error: The specified bucket does not exist
```

**Cause:** Bucket name incorrect or region mismatch

**Solution:**

1. **Verify bucket exists:**
   - AWS Console → S3
   - Check bucket name exactly

2. **Check region:**
   - Bucket region must match `AWS_REGION` variable

---

## 🤖 Anthropic AI Issues

### ❌ Error: "Invalid API key"

**Symptom:**
```
Error: Invalid API key
```

**Cause:** API key incorrect or expired

**Solution:**

1. **Regenerate key:**
   - Anthropic Console → API Keys
   - Create new key
   - Update in Render

2. **Check format:**
   - Should start with `sk-ant-`
   - No spaces or newlines

---

### ❌ Error: "Rate limit exceeded"

**Symptom:**
```
Error: Rate limit exceeded
```

**Cause:** Too many requests or insufficient tier

**Solution:**

1. **Check usage:**
   - Anthropic Console → Usage
   - Verify limits for your tier

2. **Implement retry logic** (already in code)

3. **Upgrade tier if needed**

---

## 🔄 Deployment Issues

### ❌ Auto-deploy not working

**Symptom:**
Push to GitHub doesn't trigger deploy

**Cause:** Auto-deploy disabled or wrong branch

**Solution:**

1. **Check settings:**
   - Dashboard → Web Service → Settings
   - Auto-Deploy: Enabled
   - Branch: `main` (or your default)

2. **Manual deploy:**
   - Dashboard → Manual Deploy → Deploy latest commit

---

### ❌ Rollback needed

**Symptom:**
New deployment broke something

**Solution:**

1. **Go to Events:**
   - Dashboard → Web Service → Events

2. **Find last working deploy:**
   - Click on successful deployment

3. **Rollback:**
   - Click "Rollback to this deploy"

---

## 📊 Performance Issues

### ❌ Slow response times

**Symptom:**
API responses take >5 seconds

**Causes & Solutions:**

1. **Database on different region:**
   - Move database to same region as web service

2. **Free tier limitations:**
   - Upgrade to Standard plan

3. **Cold start (after sleep):**
   - First request takes 15-30 seconds
   - Upgrade to paid plan for always-on

4. **Inefficient queries:**
   - Check logs for slow queries
   - Add database indexes

---

### ❌ Out of memory

**Symptom:**
```
Error: JavaScript heap out of memory
```

**Solution:**

1. **Upgrade plan:**
   - Free: 512MB RAM
   - Standard: 2GB RAM

2. **Optimize code:**
   - Process large files in chunks
   - Implement pagination

---

## 🔍 Debugging Tips

### View Real-Time Logs

```bash
# In Render Dashboard:
Web Service → Logs → Enable "Follow logs"
```

### SSH into Service

```bash
# In Render Dashboard:
Web Service → Shell
```

Then run:
```bash
# Check environment variables
env | grep -E 'DATABASE|WHATSAPP|AWS|ANTHROPIC'

# Check Prisma migrations
npx prisma migrate status

# Test database connection
node -e "const prisma = require('./src/utils/prisma'); prisma.$queryRaw\`SELECT 1\`.then(console.log).catch(console.error)"

# Check logs
tail -f logs/combined.log
```

---

## 🆘 Still Having Issues?

### 1. Check Render Status
https://status.render.com/

### 2. Review Logs Thoroughly
- Build logs (for build failures)
- Deploy logs (for startup issues)
- Runtime logs (for runtime errors)

### 3. Test Locally First
```bash
docker-compose up -d
docker-compose logs -f api
```

### 4. Search Render Community
https://community.render.com/

### 5. Contact Support
- Render Support (for platform issues)
- Check your repository issues

---

## 📝 Helpful Commands

### Test Health Check
```bash
curl https://your-app.onrender.com/health
```

### Test Database Connection
```bash
# In Render shell
npx prisma migrate status
```

### View Environment Variables
```bash
# In Render shell (safe - won't show values)
env | grep -E 'DATABASE|NODE_ENV|PORT'
```

### Create Admin User
```bash
# In Render shell
npm run create-admin
```

### Test Login
```bash
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## ✅ Prevention Checklist

To avoid issues:

- [ ] Test locally with Docker Compose before deploying
- [ ] Verify all environment variables before deployment
- [ ] Use the same region for database and web service
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Monitor logs regularly
- [ ] Set up uptime monitoring
- [ ] Have rollback plan ready

---

**Need more help?** Review `RENDER_DEPLOY.md` for complete deployment guide.
