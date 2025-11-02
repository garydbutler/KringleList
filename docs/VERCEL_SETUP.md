# Vercel Deployment Setup Guide - KringleList

This guide walks you through deploying your KringleList MVP to Vercel, from initial setup to production deployment.

**Estimated Time**: 15-20 minutes

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Your code committed to a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ A Vercel account (free tier is fine)
- ✅ All required environment variables ready (from `.env.local`)
- ✅ Supabase and Clerk accounts set up (optional but recommended)

---

## 🚀 Part 1: Initial Vercel Setup

### Step 1: Create a Vercel Account

1. **Go to Vercel**: https://vercel.com
2. Click **"Sign Up"**
3. Choose your preferred sign-up method:
   - **GitHub** (recommended - easier Git integration)
   - GitLab
   - Bitbucket
   - Email
4. Click **"Continue with GitHub"** (or your choice)
5. Authorize Vercel to access your GitHub account

✅ **You now have a Vercel account!**

---

### Step 2: Push Your Code to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "feat: initial KringleList setup with Phase 1 & 2 foundation"

# Create a new repository on GitHub (via web interface):
# - Go to https://github.com/new
# - Name: kringlelist
# - Make it private (recommended for now)
# - Don't initialize with README (you already have code)
# - Click "Create repository"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/kringlelist.git

# Push your code
git push -u origin 001-gift-finder-mvp

# Also push main branch if it exists
git checkout -b main
git push -u origin main
git checkout 001-gift-finder-mvp
```

✅ **Your code is now on GitHub!**

---

### Step 3: Import Your Project to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. Click **"Add New..."** button (top right)
3. Select **"Project"**
4. You'll see **"Import Git Repository"** page

5. **Connect GitHub** (if not already connected):
   - Click **"Connect Git Provider"** → **GitHub**
   - Authorize Vercel to access your repositories
   - You can choose:
     - **All repositories** (easier)
     - **Only select repositories** (more secure)

6. **Find and Import Your Repository**:
   - Search for `kringlelist` in the search box
   - Click **"Import"** next to your repository

7. **Configure Your Project**:

   **Project Settings:**
   - **Project Name**: `kringlelist` (or `kringlelist-mvp`)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `.` (leave as default)
   - **Build Command**: `npm run build` (should auto-populate)
   - **Output Directory**: `.next` (should auto-populate)
   - **Install Command**: `npm install` (should auto-populate)

   **Leave these as defaults** - Vercel auto-detects Next.js projects correctly.

✅ **Project imported and configured!**

---

### Step 4: Add Environment Variables

**IMPORTANT**: Before deploying, add your environment variables.

1. **Expand "Environment Variables" section** on the configuration page

2. **Add each variable** from your `.env.local`:

   **Required for Initial Deployment:**
   ```
   # Database
   DATABASE_URL = postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL = postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
   CLERK_SECRET_KEY = sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard

   # App URL (will update this after deployment)
   NEXT_PUBLIC_APP_URL = https://kringlelist.vercel.app
   ```

3. **For each variable**:
   - Click **"Add Another"** or the **"+ Add"** button
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value (paste from `.env.local`)
   - **Environments**: Select all three (Production, Preview, Development)
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Optional variables** (can add later):
   ```
   CLERK_WEBHOOK_SECRET = whsec_...
   MEILISEARCH_HOST = http://localhost:7700
   MEILISEARCH_API_KEY = masterKey
   UPSTASH_REDIS_REST_URL = https://...upstash.io
   UPSTASH_REDIS_REST_TOKEN = ...
   RESEND_API_KEY = re_...
   NEXT_PUBLIC_POSTHOG_KEY = phc_...
   NEXT_PUBLIC_POSTHOG_HOST = https://app.posthog.com
   SENTRY_DSN = https://...@sentry.io/...
   ```

**Pro Tip**: You can also add environment variables later via:
**Project Settings** → **Environment Variables**

✅ **Environment variables configured!**

---

### Step 5: Deploy Your First Preview

1. **Click "Deploy"** button at the bottom

2. **Wait for build** (2-5 minutes for first deployment):
   - You'll see a build log showing progress
   - Installing dependencies...
   - Building Next.js app...
   - Running type checks...

3. **Deployment Complete!** 🎉

   You'll see a success screen with:
   - **Preview URL**: `https://kringlelist-git-001-gift-finder-mvp-yourteam.vercel.app`
   - Screenshot of your deployed site
   - Options to visit or share

4. **Click "Visit"** to see your deployed site

✅ **Your first preview deployment is live!**

---

## 🌐 Part 2: Understanding Your Vercel URLs

Vercel gives you **3 types of URLs**:

### 1. Production URL
```
https://kringlelist.vercel.app
```
- Your main production domain
- Updates when you push to `main` branch
- Can add custom domain later

### 2. Branch Preview URL
```
https://kringlelist-git-[branch-name]-[team].vercel.app
```
- Example: `https://kringlelist-git-001-gift-finder-mvp-yourteam.vercel.app`
- Created for every branch you push
- Stable - doesn't change for the same branch

### 3. Deployment-Specific URL
```
https://kringlelist-[unique-hash].vercel.app
```
- Example: `https://kringlelist-abc123xyz.vercel.app`
- Created for every commit
- Immutable - never changes

---

## 🔧 Part 3: Configure Webhooks with Your Vercel URL

Now that you have your Vercel URL, configure Clerk webhooks:

### Step 1: Get Your Vercel URL

From the deployment success page or:
1. Go to **Vercel Dashboard** → Your Project
2. Click on the latest deployment
3. Copy the URL shown under **"Domains"**

**Your webhook URL will be:**
```
https://your-vercel-url.vercel.app/api/webhooks/clerk
```

**Example:**
```
https://kringlelist-git-001-gift-finder-mvp-yourteam.vercel.app/api/webhooks/clerk
```

---

### Step 2: Configure Clerk Webhook

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. Select your application
3. Click **"Webhooks"** in the left sidebar
4. Click **"Add Endpoint"**

5. **Configure the webhook**:
   - **Endpoint URL**:
     ```
     https://your-vercel-url.vercel.app/api/webhooks/clerk
     ```
   - **Subscribe to events**:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - Leave other events unchecked for now

6. Click **"Create"**

7. **Copy the Signing Secret**:
   - After creating, you'll see a **"Signing Secret"**
   - Copy this value (starts with `whsec_...`)

---

### Step 3: Add Webhook Secret to Vercel

1. **Go to Vercel Dashboard** → Your Project
2. Click **"Settings"** (top nav)
3. Click **"Environment Variables"** (left sidebar)
4. Click **"Add New"**

5. **Add the webhook secret**:
   - **Key**: `CLERK_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (paste from Clerk)
   - **Environments**: Check all three
     - ✅ Production
     - ✅ Preview
     - ✅ Development

6. Click **"Save"**

7. **Redeploy to apply changes**:
   - Go to **Deployments** tab
   - Click **⋮** (three dots) on latest deployment
   - Click **"Redeploy"**
   - Or just push a new commit to trigger auto-deploy

✅ **Webhooks configured and working!**

---

## 🎯 Part 4: Production Deployment

Once you're ready to deploy to production:

### Step 1: Merge to Main Branch

```bash
# Switch to main branch
git checkout main

# Merge your feature branch
git merge 001-gift-finder-mvp

# Push to GitHub
git push origin main
```

Vercel **automatically deploys** when you push to `main`.

---

### Step 2: Verify Production Deployment

1. Go to **Vercel Dashboard** → Your Project
2. Click **"Deployments"** tab
3. You should see a new deployment with:
   - **Environment**: Production
   - **Branch**: main
   - **URL**: `https://kringlelist.vercel.app`

---

### Step 3: Add Production Domain (Optional)

To use your own domain (e.g., `kringlelist.com`):

1. **Go to Project** → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `kringlelist.com`
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

**DNS Records to Add** (at your domain provider):
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

✅ **Custom domain configured!**

---

## 📊 Part 5: Monitoring & Analytics

### Built-in Vercel Analytics

1. **Go to Project** → **Analytics** tab
2. View:
   - Page views
   - Top pages
   - Top referrers
   - Device breakdown

### Speed Insights (Optional - $10/month)

1. **Go to Project** → **Speed Insights**
2. Click **"Enable"**
3. Provides:
   - Real User Monitoring (RUM)
   - Core Web Vitals
   - Performance scores

---

## 🔄 Part 6: Automatic Deployments

Vercel automatically deploys when you:

### Push to Any Branch
```bash
git push origin feature-branch
```
→ Creates preview deployment at:
`https://kringlelist-git-feature-branch-team.vercel.app`

### Push to Main Branch
```bash
git push origin main
```
→ Deploys to production:
`https://kringlelist.vercel.app`

### Create Pull Request on GitHub
→ Vercel bot comments with preview URL
→ Updates on every new commit to the PR

---

## 🛠️ Part 7: Useful Vercel CLI Commands

Install Vercel CLI globally:
```bash
npm install -g vercel
```

### Quick Deploy from Local
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Link Local Project
```bash
# Link to existing Vercel project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### List Deployments
```bash
# List all deployments
vercel ls

# Get deployment details
vercel inspect [deployment-url]
```

### Logs
```bash
# View runtime logs
vercel logs [deployment-url]

# Follow logs (real-time)
vercel logs [deployment-url] --follow
```

---

## ⚙️ Part 8: Project Configuration

### vercel.json (Already in your project)

Your `vercel.json` configures deployment settings:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://kringlelist.vercel.app"
  }
}
```

You can customize:
- **regions**: Edge locations (`iad1` = US East, `sfo1` = US West, etc.)
- **buildCommand**: Build script
- **env**: Environment variables

---

## 🔐 Part 9: Security Best Practices

### 1. Environment Variables
- ✅ **Never commit** `.env.local` to Git
- ✅ Use different values for Production vs Preview
- ✅ Rotate secrets regularly

### 2. Production vs Development Clerk Apps
- Create separate Clerk apps:
  - **Production Clerk App** → Use in Production environment
  - **Development Clerk App** → Use in Preview/Development

Set environment-specific variables in Vercel:
```
Production:
  CLERK_SECRET_KEY = sk_live_...

Preview + Development:
  CLERK_SECRET_KEY = sk_test_...
```

### 3. Database Access
- Use connection pooling (`DATABASE_URL` with `?pgbouncer=true`)
- Set `DIRECT_URL` for migrations
- Consider separate databases for production vs staging

---

## 📈 Part 10: Post-Deployment Checklist

After your first deployment:

- [ ] ✅ Visit your Vercel URL and verify site loads
- [ ] ✅ Test sign-up flow (creates user in Clerk)
- [ ] ✅ Check Supabase - verify `users` table has new row
- [ ] ✅ Test webhooks - user creation should sync to database
- [ ] ✅ Check Vercel deployment logs for errors
- [ ] ✅ Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to actual URL
- [ ] ✅ Configure Clerk production instance for `main` branch
- [ ] ✅ Test on mobile (Vercel deployments are mobile-responsive)

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. Build logs in Vercel dashboard
2. Environment variables are set correctly
3. TypeScript errors: Run `npm run build` locally first

**Solution:**
```bash
# Test build locally
npm run build

# If it works locally, check Vercel logs for missing env vars
```

---

### Database Connection Error

**Error**: `Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` is set in Vercel
2. Check `?pgbouncer=true` is appended
3. Ensure Supabase project is active (not paused)

---

### Clerk Auth Not Working

**Error**: User can't sign in/sign up

**Solution:**
1. Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
2. Verify domain is allowed in Clerk dashboard
3. For production, ensure using production Clerk app

---

### Webhook Not Triggering

**Error**: User created but not in database

**Solution:**
1. Check `CLERK_WEBHOOK_SECRET` is set in Vercel
2. Verify webhook URL is correct in Clerk dashboard
3. Check Vercel function logs for webhook errors
4. Ensure webhook endpoint is deployed (check `/api/webhooks/clerk`)

---

## 🎓 Next Steps

After successful deployment:

1. **Monitor**: Check Vercel Analytics and Logs
2. **Optimize**: Review Web Vitals and performance
3. **Scale**: Upgrade Vercel plan if needed (free tier = 100GB bandwidth)
4. **Custom Domain**: Add your own domain
5. **CI/CD**: All automatic via Git integration! ✨

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)

---

## 🆘 Need Help?

- **Vercel Support**: https://vercel.com/help
- **Community Discord**: https://vercel.com/discord
- **Status Page**: https://vercel-status.com

---

**Congratulations! Your KringleList MVP is now deployed on Vercel!** 🎉

Your app is live at: `https://kringlelist-git-001-gift-finder-mvp-yourteam.vercel.app`
