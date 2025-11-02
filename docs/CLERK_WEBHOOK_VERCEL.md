# Clerk Webhook Setup for Vercel Deployment

Quick guide to configure Clerk webhooks with your Vercel deployment.

---

## Step 1: Get Your Vercel Deployment URL

### Option A: From Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your `kringlelist` project
3. You'll see your deployment URLs

You should have:
- **Production**: `https://kringlelist.vercel.app` (if deployed to main branch)
- **Preview (Branch)**: `https://kringlelist-git-001-gift-finder-mvp-[team].vercel.app`

### Option B: From GitHub
1. Go to your GitHub repository
2. Look for the Vercel bot comment on your latest commit/PR
3. Copy the deployment URL

### Your Webhook URL Format:
```
https://[your-vercel-url]/api/webhooks/clerk
```

**Examples:**
```
https://kringlelist-git-001-gift-finder-mvp-yourteam.vercel.app/api/webhooks/clerk
```
OR
```
https://kringlelist.vercel.app/api/webhooks/clerk
```

---

## Step 2: Configure Webhook in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com

2. **Select your application**: "cuddly-tiger-26"

3. **Click "Webhooks"** in the left sidebar

4. **Click "Add Endpoint"** button

5. **Configure the webhook**:

   **Endpoint URL**: (paste your Vercel URL)
   ```
   https://kringlelist-git-001-gift-finder-mvp-[team].vercel.app/api/webhooks/clerk
   ```

   **Subscribe to events** (check these 3):
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`

6. **Click "Create"**

7. **Verify Signing Secret**:
   - After creating, you'll see a **"Signing Secret"**
   - Copy it (starts with `whsec_...`)
   - **Check if it matches your `.env` file**:
     ```
     CLERK_WEBHOOK_SECRET=whsec_p8e0I8E6UPqcgidSUWn8JgEJDYdFnjVe
     ```

---

## Step 3: Verify Environment Variables in Vercel

The webhook secret must be in Vercel's environment variables:

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar
4. Verify `CLERK_WEBHOOK_SECRET` exists:

   **Key**: `CLERK_WEBHOOK_SECRET`
   **Value**: `whsec_p8e0I8E6UPqcgidSUWn8JgEJDYdFnjVe`
   **Environments**: ✅ Production, ✅ Preview, ✅ Development

5. If missing or different, add/update it:
   - Click "Add New"
   - Enter the key and value
   - Select all environments
   - Click "Save"

6. **Redeploy** if you changed environment variables:
   - Go to "Deployments" tab
   - Click ⋮ on latest deployment
   - Click "Redeploy"

---

## Step 4: Test the Webhook

### Option A: Test in Clerk Dashboard
1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click the **"Testing"** tab
4. Click **"Send Example"** → Select `user.created`
5. You should see **200 OK** response

### Option B: Test by Signing Up
1. Go to your Vercel URL: `https://kringlelist-git-001-gift-finder-mvp-[team].vercel.app`
2. Click "Sign Up"
3. Create a test account
4. After signup, check Supabase database

**Verify in Supabase**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor"
4. Open the `users` table
5. You should see your new user! ✅

---

## Step 5: Check Webhook Logs (If Issues)

### In Clerk Dashboard:
1. Go to Webhooks → Click your endpoint
2. Click **"Logs"** tab
3. Look for recent requests
4. Check status codes:
   - **200**: Success ✅
   - **400**: Bad request (check signing secret)
   - **500**: Server error (check Vercel function logs)

### In Vercel Dashboard:
1. Go to your project
2. Click **"Functions"** tab
3. Look for `/api/webhooks/clerk`
4. Click to see execution logs
5. Look for errors

---

## Troubleshooting

### Webhook returns 400 error
**Cause**: Signing secret mismatch

**Fix**:
1. Copy signing secret from Clerk webhook dashboard
2. Update in Vercel environment variables
3. Redeploy

### Webhook returns 500 error
**Cause**: Database connection issue

**Fix**:
1. Verify `DATABASE_URL` and `DIRECT_URL` are set in Vercel
2. Check Supabase project is active (not paused)
3. Check Vercel function logs for specific error

### Users still not syncing
**Check**:
- [ ] Webhook URL is correct (ends with `/api/webhooks/clerk`)
- [ ] Events subscribed: `user.created`, `user.updated`, `user.deleted`
- [ ] `CLERK_WEBHOOK_SECRET` matches in Vercel and Clerk
- [ ] Database connection works (check other Vercel functions)
- [ ] Webhook logs show 200 OK responses

---

## Multiple Deployment URLs?

If you have both Production and Preview deployments:

### Best Practice:
Create **separate webhooks** for each environment:

**For Preview/Development**:
- URL: `https://kringlelist-git-001-gift-finder-mvp-[team].vercel.app/api/webhooks/clerk`
- Use development Clerk app keys

**For Production**:
- URL: `https://kringlelist.vercel.app/api/webhooks/clerk`
- Use production Clerk app keys

**OR** just use one webhook pointed at your preview URL for now, and update it when you deploy to production.

---

## Quick Checklist

- [ ] Got Vercel deployment URL
- [ ] Added webhook in Clerk dashboard
- [ ] Webhook URL: `https://[vercel-url]/api/webhooks/clerk`
- [ ] Subscribed to: `user.created`, `user.updated`, `user.deleted`
- [ ] Copied signing secret from Clerk
- [ ] Verified `CLERK_WEBHOOK_SECRET` in Vercel environment variables
- [ ] Tested webhook (send example or sign up new user)
- [ ] Verified user appears in Supabase `users` table

---

## What Happens Next

Once configured, every time a user signs up:

1. ✅ User creates account in Clerk
2. ✅ Clerk sends webhook to your Vercel deployment
3. ✅ Your webhook handler creates user in Supabase
4. ✅ User record available for your app to use
5. ✅ User redirected to dashboard

---

## Need Your Exact URL?

If you're not sure of your Vercel URL, you can:

1. **Check recent git push output** - Vercel bot usually comments
2. **Check Vercel dashboard** - https://vercel.com/dashboard
3. **Run locally and deploy**:
   ```bash
   # Install Vercel CLI (optional)
   npm install -g vercel

   # Login
   vercel login

   # Deploy
   vercel

   # Get URL
   vercel ls
   ```

---

**Your webhook URL will be**: `https://[your-vercel-url]/api/webhooks/clerk`

Just replace `[your-vercel-url]` with your actual Vercel deployment URL!
