# 🚀 KringleList Deployment Checklist

Quick reference checklist for deploying to Vercel.

---

## Pre-Deployment Setup

- [ ] Code is committed to Git
- [ ] Pushed to GitHub/GitLab/Bitbucket
- [ ] `.env.local` has all required values
- [ ] Local build succeeds: `npm run build`
- [ ] All tests pass (if applicable)

---

## Vercel Account Setup

- [ ] Created Vercel account at https://vercel.com
- [ ] Connected GitHub account to Vercel
- [ ] Authorized Vercel to access repositories

---

## Project Import & Configuration

- [ ] Imported repository to Vercel
- [ ] Project name: `kringlelist` (or your choice)
- [ ] Framework: Next.js (auto-detected)
- [ ] Root directory: `.` (default)
- [ ] Build command: `npm run build` (default)

---

## Environment Variables in Vercel

### Required (Minimum for deployment):

- [ ] `DATABASE_URL` - Supabase Transaction Pooler
- [ ] `DIRECT_URL` - Supabase Session Pooler
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - `/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - `/dashboard`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - `/dashboard`
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel URL

### Optional (Can add later):

- [ ] `CLERK_WEBHOOK_SECRET` - After configuring webhooks
- [ ] `MEILISEARCH_HOST` - Search engine
- [ ] `MEILISEARCH_API_KEY` - Search API key
- [ ] `UPSTASH_REDIS_REST_URL` - Cache URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Cache token
- [ ] `RESEND_API_KEY` - Email service
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` - Analytics host
- [ ] `SENTRY_DSN` - Error tracking

---

## First Deployment

- [ ] Clicked "Deploy" button in Vercel
- [ ] Build completed successfully (2-5 min)
- [ ] Deployment URL received
- [ ] Visited deployment URL - site loads ✅

---

## Webhook Configuration

### Get Your Vercel URL:
- [ ] Copied deployment URL from Vercel
  - Format: `https://kringlelist-git-[branch]-[team].vercel.app`

### Configure Clerk Webhook:
- [ ] Opened Clerk Dashboard → Webhooks
- [ ] Added endpoint: `https://your-vercel-url.vercel.app/api/webhooks/clerk`
- [ ] Selected events:
  - [ ] `user.created`
  - [ ] `user.updated`
  - [ ] `user.deleted`
- [ ] Copied signing secret (`whsec_...`)

### Add Webhook Secret to Vercel:
- [ ] Vercel Project → Settings → Environment Variables
- [ ] Added `CLERK_WEBHOOK_SECRET` = `whsec_...`
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed to apply changes

---

## Post-Deployment Testing

### Basic Functionality:
- [ ] Homepage loads without errors
- [ ] Sign-up flow works
- [ ] User can create account
- [ ] User is redirected to dashboard after sign-up

### Database Integration:
- [ ] Opened Supabase dashboard
- [ ] Checked `users` table
- [ ] New user row exists (webhook worked!)

### Auth Flow:
- [ ] Sign out works
- [ ] Sign in works
- [ ] Protected routes redirect to sign-in when not authenticated

### Vercel Monitoring:
- [ ] Checked deployment logs - no errors
- [ ] Checked function logs - webhooks executing
- [ ] Checked analytics (if enabled)

---

## Production Deployment (When Ready)

- [ ] Merged feature branch to `main`
- [ ] Pushed to GitHub: `git push origin main`
- [ ] Vercel auto-deployed to production
- [ ] Production URL: `https://kringlelist.vercel.app`
- [ ] Updated `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Created separate Clerk production app (recommended)
- [ ] Updated production environment variables

---

## Custom Domain (Optional)

- [ ] Purchased domain (e.g., `kringlelist.com`)
- [ ] Added domain in Vercel: Settings → Domains
- [ ] Configured DNS records:
  - [ ] A record: `@` → `76.76.21.21`
  - [ ] CNAME record: `www` → `cname.vercel-dns.com`
- [ ] SSL certificate auto-provisioned by Vercel
- [ ] Domain verified and working

---

## URLs Reference

Once deployed, you'll have these URLs:

| Type | URL Pattern | Example |
|------|-------------|---------|
| **Branch Preview** | `https://[project]-git-[branch]-[team].vercel.app` | `https://kringlelist-git-001-gift-finder-mvp-yourteam.vercel.app` |
| **Production** | `https://[project].vercel.app` | `https://kringlelist.vercel.app` |
| **Custom Domain** | Your domain | `https://kringlelist.com` |
| **Deployment** | `https://[project]-[hash].vercel.app` | `https://kringlelist-abc123.vercel.app` |

---

## Quick Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Pull environment variables
vercel env pull .env.local

# View logs
vercel logs

# List deployments
vercel ls
```

---

## Troubleshooting Quick Checks

**Build Failed?**
- [ ] Run `npm run build` locally - does it work?
- [ ] Check Vercel build logs for specific error
- [ ] Verify all environment variables are set

**Site Loads But Auth Broken?**
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set?
- [ ] Using correct Clerk app (dev vs prod)?
- [ ] Domain allowed in Clerk dashboard?

**Webhooks Not Working?**
- [ ] `CLERK_WEBHOOK_SECRET` set in Vercel?
- [ ] Webhook URL correct in Clerk?
- [ ] Check Vercel function logs for errors

**Database Connection Error?**
- [ ] `DATABASE_URL` has `?pgbouncer=true`?
- [ ] `DIRECT_URL` is set?
- [ ] Supabase project is active?

---

## Success Criteria ✅

Your deployment is successful when:

- ✅ Vercel URL loads without errors
- ✅ Users can sign up via Clerk
- ✅ New users appear in Supabase `users` table
- ✅ No errors in Vercel logs
- ✅ Webhooks execute successfully
- ✅ Protected routes require authentication

---

## Next Steps After Deployment

1. **Monitor**: Check Vercel Analytics daily
2. **Update**: Continue implementing User Stories 1 & 2
3. **Test**: Verify each feature on the live URL
4. **Iterate**: Push updates → Auto-deploys!
5. **Scale**: Upgrade Vercel plan when needed

---

**For detailed instructions, see `docs/VERCEL_SETUP.md`**

**For Supabase setup, see `docs/SUPABASE_SETUP.md`**

**For quick commands, see `docs/QUICK_REFERENCE.md`**
