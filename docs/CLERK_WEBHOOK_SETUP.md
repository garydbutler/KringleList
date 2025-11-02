# Clerk Webhook Setup Guide

This guide will help you configure the Clerk webhook so that users are automatically synced to your Supabase database.

---

## Why You Need This

When a user signs up through Clerk, they need to be added to your Supabase `users` table. The webhook automatically does this by listening to Clerk user events.

**Current Issue**: Users can sign up in Clerk, but they don't appear in your Supabase `users` table because the webhook isn't configured yet.

---

## Quick Setup Steps

### Step 1: Get Your Local Webhook URL

For **local development**, you need to expose your localhost to the internet. Use one of these tools:

#### Option A: Using ngrok (Recommended for testing)

1. **Install ngrok**: https://ngrok.com/download
2. **Start your Next.js dev server**:
   ```bash
   npm run dev
   ```
3. **In a new terminal, run ngrok**:
   ```bash
   ngrok http 3000
   ```
4. **Copy the forwarding URL** (looks like `https://abc123.ngrok.io`)

Your webhook URL will be:
```
https://abc123.ngrok.io/api/webhooks/clerk
```

#### Option B: Using Cloudflare Tunnel

1. **Install cloudflared**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
2. **Run the tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. **Copy the forwarding URL**

---

### Step 2: Configure Webhook in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your application**: "cuddly-tiger-26" (from your publishable key)
3. **Click "Webhooks"** in the left sidebar
4. **Click "Add Endpoint"** button

5. **Configure the webhook**:

   **Endpoint URL**:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/clerk
   ```

   **Subscribe to events** (check these 3):
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`

6. **Click "Create"**

7. **Copy the Signing Secret**:
   - After creating, you'll see a **"Signing Secret"**
   - It starts with `whsec_...`
   - **Verify it matches your `.env` file**:
     ```bash
     CLERK_WEBHOOK_SECRET=whsec_p8e0I8E6UPqcgidSUWn8JgEJDYdFnjVe
     ```
   - If it's different, update your `.env` file and restart your dev server

---

### Step 3: Test the Webhook

1. **In Clerk Dashboard → Webhooks**, click on your webhook endpoint
2. **Click the "Testing" tab**
3. **Click "Send Example"** and select `user.created`
4. You should see a **200 OK** response

**Or test by signing up a new user**:

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create a new account with a test email
4. After signing up, check your Supabase database

**Verify in Supabase**:
```bash
npm run db:studio
```
Open http://localhost:5555 and check the `users` table - you should see the new user!

---

## For Production/Vercel Deployment

When you deploy to Vercel, you'll need to update the webhook URL:

1. **Deploy to Vercel** (follow `docs/VERCEL_SETUP.md`)
2. **Get your Vercel URL**: `https://kringlelist-git-001-gift-finder-mvp-yourteam.vercel.app`
3. **Update Clerk webhook endpoint**:
   ```
   https://your-vercel-url.vercel.app/api/webhooks/clerk
   ```
4. **Add `CLERK_WEBHOOK_SECRET` to Vercel environment variables**

---

## Troubleshooting

### Webhook returns 400 error

**Check**:
- Webhook secret in `.env` matches Clerk dashboard
- You restarted your dev server after changing `.env`

**Fix**:
```bash
# Copy the signing secret from Clerk dashboard
# Update .env file
CLERK_WEBHOOK_SECRET=whsec_YourNewSecret

# Restart dev server
npm run dev
```

---

### Users still not appearing in database

**Check**:
1. Webhook endpoint is accessible (ngrok tunnel is running)
2. Webhook events are subscribed: `user.created`, `user.updated`, `user.deleted`
3. Database connection works:
   ```bash
   npm run db:studio
   ```

**Check webhook logs in Clerk**:
1. Go to Clerk Dashboard → Webhooks
2. Click your endpoint
3. Check the "Logs" tab for errors

---

### ngrok session expired

Free ngrok URLs expire after a few hours. You'll need to:
1. Restart ngrok
2. Get the new URL
3. Update the webhook URL in Clerk dashboard

**Pro tip**: Get a free ngrok account for a stable subdomain that doesn't change.

---

## What the Webhook Does

The webhook handler (`src/app/api/webhooks/clerk/route.ts`) automatically:

**On `user.created`**:
- Creates a new row in the `users` table
- Stores `clerkId` and `email`

**On `user.updated`**:
- Updates the user's email if changed

**On `user.deleted`**:
- Deletes the user from the database (cascades to related data)

---

## Quick Reference

| What | Value |
|------|-------|
| **Webhook URL (local)** | `https://your-ngrok-url.ngrok.io/api/webhooks/clerk` |
| **Webhook URL (production)** | `https://your-vercel-url.vercel.app/api/webhooks/clerk` |
| **Events to subscribe** | `user.created`, `user.updated`, `user.deleted` |
| **Signing Secret** | Starts with `whsec_...` |
| **Test endpoint** | Clerk Dashboard → Webhooks → Testing tab |

---

## Next Steps

Once the webhook is configured and working:

1. ✅ Users will automatically sync to Supabase
2. ✅ You can continue with Phase 2 infrastructure
3. ✅ Ready to implement User Story features

---

**Need help?** Check the Clerk webhook documentation: https://clerk.com/docs/integrations/webhooks
