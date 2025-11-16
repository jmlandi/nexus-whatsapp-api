# 🚀 Pre-Deployment Checklist for Render

Use this checklist before deploying to Render to ensure everything is ready.

## 📋 Repository Preparation

- [ ] **Code is committed and pushed to main branch**
  ```bash
  git status  # Should be clean
  git push origin main
  ```

- [ ] **All Render configuration files are present:**
  - [ ] `render.yaml` (Blueprint configuration)
  - [ ] `build.sh` (Build script)
  - [ ] `.renderignore` (Files to exclude)
  - [ ] `package.json` (with correct scripts)

- [ ] **No sensitive data in repository:**
  - [ ] No `.env` files committed
  - [ ] No API keys in code
  - [ ] No passwords in code

## 🔑 Credentials Ready

Have the following credentials ready to paste into Render:

### WhatsApp Business API
- [ ] **WHATSAPP_PHONE_NUMBER_ID** (from Meta Business Suite)
- [ ] **WHATSAPP_BUSINESS_ACCOUNT_ID** (from Meta Business Suite)
- [ ] **WHATSAPP_ACCESS_TOKEN** (from Meta Business Suite)
- [ ] **WHATSAPP_WEBHOOK_VERIFY_TOKEN** (generate random: `openssl rand -hex 32`)

**Get WhatsApp credentials at:** https://business.facebook.com/

### AWS S3
- [ ] **AWS_ACCESS_KEY_ID** (from AWS IAM)
- [ ] **AWS_SECRET_ACCESS_KEY** (from AWS IAM)
- [ ] **AWS_S3_BUCKET_NAME** (bucket must exist)
- [ ] **AWS_REGION** (e.g., us-east-1)

**S3 Bucket Requirements:**
- [ ] Bucket is created
- [ ] Bucket has public read access (for report URLs)
- [ ] CORS is configured
- [ ] IAM user has S3 permissions

**Setup S3 at:** https://console.aws.amazon.com/s3/

### Anthropic AI
- [ ] **ANTHROPIC_API_KEY** (from Anthropic Console)
- [ ] Account has available credits

**Get API key at:** https://console.anthropic.com/

### JWT Secret
- [ ] **JWT_SECRET** (generate random: `openssl rand -hex 64`)

## 🧪 Local Testing

Before deploying, test locally:

- [ ] **Docker Compose works:**
  ```bash
  docker-compose up -d
  docker-compose logs -f api
  ```

- [ ] **Health check responds:**
  ```bash
  curl http://localhost:3000/health
  # Should return: {"status":"ok",...}
  ```

- [ ] **Database migrations work:**
  ```bash
  docker-compose exec api npx prisma migrate status
  # Should show all migrations applied
  ```

- [ ] **Can create admin user:**
  ```bash
  docker-compose exec api npm run create-admin
  ```

- [ ] **Can login:**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123"}'
  ```

- [ ] **Cleanup after testing:**
  ```bash
  docker-compose down
  ```

## 📦 Build Script Verification

- [ ] **build.sh is executable:**
  ```bash
  chmod +x build.sh
  ls -l build.sh  # Should show -rwxr-xr-x
  ```

- [ ] **build.sh runs successfully locally:**
  ```bash
  # Test in a clean environment
  npm ci --only=production
  npx prisma generate
  # Should complete without errors
  ```

## 🔍 Code Review

- [ ] **All environment variables are loaded from process.env:**
  ```bash
  grep -r "hardcoded_password\|hardcoded_key" src/
  # Should return nothing
  ```

- [ ] **Logger is used instead of console.log:**
  ```bash
  grep -r "console\.log\|console\.error" src/
  # Should return minimal or no results
  ```

- [ ] **Database connection uses DATABASE_URL from env:**
  ```bash
  grep -r "DATABASE_URL" prisma/schema.prisma
  # Should show: url = env("DATABASE_URL")
  ```

- [ ] **No CORS issues for production domain**
  - Check `src/server.js` CORS configuration
  - Update if specific domain needed

## 📚 Documentation

- [ ] **README.md is up to date**
- [ ] **RENDER_DEPLOY.md exists and is complete**
- [ ] **RENDER_ENV_VARIABLES.md exists for reference**
- [ ] **API documentation is current** (`docs/03-API.md`)

## 🌐 External Services Configuration

### Meta Business Suite (WhatsApp)
- [ ] WhatsApp Business Account is verified
- [ ] Phone number is registered
- [ ] Test phone numbers are added (for testing)
- [ ] Ready to configure webhook after deploy

### AWS S3
- [ ] Bucket exists and is configured
- [ ] Bucket policy allows public read (for report URLs)
- [ ] CORS is configured for your domain
- [ ] IAM user has only S3 access (principle of least privilege)

### Anthropic
- [ ] Account has sufficient credits
- [ ] API key is active
- [ ] Rate limits understood

## 🚀 Ready to Deploy

If all items above are checked, you're ready to deploy!

### Deployment Options:

**Option 1: Blueprint (Automated - Recommended)**
1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Follow prompts to set secret environment variables
5. Click "Apply"

**Option 2: Manual**
1. Follow steps in `RENDER_DEPLOY.md` under "Método 2: Deploy Manual"

---

## ⚠️ Common Pre-Deployment Issues

### Issue: build.sh not executable
**Fix:**
```bash
chmod +x build.sh
git add build.sh
git commit -m "Make build.sh executable"
git push
```

### Issue: Missing environment variables
**Fix:** Double-check all required variables in `RENDER_ENV_VARIABLES.md`

### Issue: Database migration errors locally
**Fix:**
```bash
# Reset local database
docker-compose down -v
docker-compose up -d
docker-compose exec api npx prisma migrate deploy
```

### Issue: S3 upload fails locally
**Fix:** Verify AWS credentials and bucket permissions

---

## 📞 Getting Help

If you encounter issues:

1. **Check the deployment guide:** `RENDER_DEPLOY.md`
2. **Review environment variables:** `RENDER_ENV_VARIABLES.md`
3. **Test locally first:** Use Docker Compose
4. **Check Render logs:** Dashboard → Your Service → Logs
5. **Verify external services:** Ensure WhatsApp, S3, and Anthropic are configured

---

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] Service is deployed and running
- [ ] Health check returns 200 OK
- [ ] Database is connected
- [ ] All migrations applied
- [ ] Admin user created
- [ ] Can login via API
- [ ] WhatsApp webhook configured
- [ ] Test message flow works
- [ ] S3 upload works
- [ ] AI responses work

See `RENDER_DEPLOY.md` section "✅ Verificação Pós-Deploy" for detailed tests.

---

**🎯 Ready? Let's deploy!**

Follow the guide in `RENDER_DEPLOY.md` to complete your deployment.
