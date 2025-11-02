# Quickstart Guide: KringleList Gift Finder MVP

**Feature**: 001-gift-finder-mvp
**Branch**: `001-gift-finder-mvp`
**Date**: 2025-11-01

## Overview

This quickstart guide walks through setting up the KringleList development environment, configuring all required services (Clerk, Supabase, Meilisearch, etc.), and running the application locally.

**Estimated Setup Time**: 45-60 minutes

---

## Prerequisites

Ensure the following are installed on your system:

| Tool | Version | Installation |
|------|---------|--------------|
| **Node.js** | 20+ LTS | [nodejs.org](https://nodejs.org) |
| **npm** | 10+ | Included with Node.js |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com) |
| **PostgreSQL** | 15+ | [postgresql.org](https://postgresql.org) OR use Supabase (recommended) |
| **Redis** | 7+ | [redis.io](https://redis.io) OR use Upstash (recommended) |
| **Docker** (optional) | 24+ | [docker.com](https://docker.com) - for local Meilisearch |

**Verify installations**:
```bash
node --version    # v20.x.x
npm --version     # 10.x.x
git --version     # 2.40+
```

---

## Step 1: Clone Repository and Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-org/kringlelist.git
cd kringlelist

# Checkout feature branch
git checkout 001-gift-finder-mvp

# Install dependencies
npm install

# Verify Next.js installation
npx next --version  # 14.x.x
```

---

## Step 2: Environment Configuration

Copy the example environment file and configure secrets:

```bash
# Copy example env file
cp .env.example .env.local

# Open .env.local in your editor
# Fill in values from services configured in steps below
```

**`.env.local` Template**:
```bash
# ==========================================
# DATABASE (Supabase PostgreSQL)
# ==========================================
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"

# Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# ==========================================
# AUTHENTICATION (Clerk)
# ==========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123...
CLERK_SECRET_KEY=sk_test_xyz789...

# Clerk URLs (Next.js App Router defaults)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Webhook secret (configured in Step 4)
CLERK_WEBHOOK_SECRET=whsec_...

# ==========================================
# SEARCH (Meilisearch)
# ==========================================
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey123  # Change in production!

# ==========================================
# CACHE (Upstash Redis)
# ==========================================
UPSTASH_REDIS_REST_URL=https://[REGION]-[ID].upstash.io
UPSTASH_REDIS_REST_TOKEN=[TOKEN]

# ==========================================
# STORAGE (Vercel Blob)
# ==========================================
BLOB_READ_WRITE_TOKEN=[TOKEN]  # Auto-populated by Vercel

# ==========================================
# EMAIL (Resend)
# ==========================================
RESEND_API_KEY=re_abc123...
RESEND_FROM_EMAIL=noreply@kringlelist.com

# ==========================================
# ANALYTICS
# ==========================================
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_abc123...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics 4 (optional)
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# ==========================================
# ERROR TRACKING (Sentry)
# ==========================================
SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]
NEXT_PUBLIC_SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]

# ==========================================
# PAYMENTS (Stripe - Post-MVP)
# ==========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ==========================================
# MISC
# ==========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3: Database Setup (Supabase)

### Option A: Supabase Cloud (Recommended)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Enter project details:
     - Name: `kringlelist-dev`
     - Database Password: (save securely)
     - Region: (closest to you)
   - Click "Create new project" (takes 2-3 minutes)

2. **Get Database Credentials**:
   - Navigate to Settings → Database
   - Copy "Connection String" (Transaction Mode) → `DATABASE_URL`
   - Copy "Connection String" (Session Mode) → `DIRECT_URL`
   - Update `.env.local` with connection strings

3. **Get Supabase API Keys**:
   - Navigate to Settings → API
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

4. **Run Database Migrations**:
   ```bash
   # Generate Prisma client from schema
   npx prisma generate

   # Run migrations to create tables
   npx prisma migrate dev --name init

   # Verify tables created in Supabase dashboard (Table Editor)
   ```

5. **Seed Database** (optional):
   ```bash
   # Seed with sample data (users, children, products)
   npm run db:seed
   ```

### Option B: Local PostgreSQL

```bash
# Create database
createdb kringlelist_dev

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/kringlelist_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/kringlelist_dev"

# Run migrations
npx prisma migrate dev --name init
```

---

## Step 4: Authentication Setup (Clerk)

1. **Create Clerk Application**:
   - Go to [clerk.com](https://clerk.com)
   - Sign up or log in
   - Click "Add Application"
   - Enter application name: `KringleList Dev`
   - Select "Next.js" framework
   - Click "Create Application"

2. **Get API Keys**:
   - Copy "Publishable Key" → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy "Secret Key" → `CLERK_SECRET_KEY`
   - Paste into `.env.local`

3. **Configure Social Login** (optional):
   - Navigate to User & Authentication → Social Connections
   - Enable "Google" and "Apple"
   - Follow OAuth setup instructions

4. **Configure Webhooks**:
   - Navigate to Webhooks → Add Endpoint
   - Enter endpoint URL:
     - **Local dev**: Use ngrok or Clerk's testing mode
     - **Staging**: `https://your-staging-url.vercel.app/api/webhooks/clerk`
   - Select events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `session.created`
     - `session.ended`
   - Click "Create"
   - Copy "Signing Secret" → `CLERK_WEBHOOK_SECRET` in `.env.local`

5. **Test Webhooks Locally** (optional):
   ```bash
   # Install ngrok
   npm install -g ngrok

   # Start ngrok tunnel
   ngrok http 3000

   # Copy HTTPS URL (e.g., https://abc123.ngrok.io)
   # Update Clerk webhook endpoint: https://abc123.ngrok.io/api/webhooks/clerk
   ```

---

## Step 5: Search Engine Setup (Meilisearch)

### Option A: Docker (Recommended for Local Dev)

```bash
# Pull Meilisearch image
docker pull getmeili/meilisearch:v1.5

# Run Meilisearch container
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY=masterKey123 \
  -v $(pwd)/data.ms:/meili_data \
  getmeili/meilisearch:v1.5

# Verify running
curl http://localhost:7700/health
# Response: {"status":"available"}
```

**Update `.env.local`**:
```bash
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey123
```

### Option B: Meilisearch Cloud

1. **Create Meilisearch Cloud Project**:
   - Go to [meilisearch.com/cloud](https://www.meilisearch.com/cloud)
   - Sign up and create project
   - Copy "Host URL" → `MEILISEARCH_HOST`
   - Copy "API Key" → `MEILISEARCH_API_KEY`

2. **Create Product Index**:
   ```bash
   # Run index creation script
   npm run search:init

   # Verify index created
   curl http://localhost:7700/indexes
   ```

3. **Index Sample Products** (optional):
   ```bash
   # Index seed products
   npm run search:seed
   ```

---

## Step 6: Cache Setup (Upstash Redis)

1. **Create Upstash Redis Database**:
   - Go to [upstash.com](https://upstash.com)
   - Sign up or log in
   - Click "Create Database"
   - Enter name: `kringlelist-dev`
   - Select region (closest to you)
   - Click "Create"

2. **Get Redis Credentials**:
   - Copy "REST URL" → `UPSTASH_REDIS_REST_URL`
   - Copy "REST Token" → `UPSTASH_REDIS_REST_TOKEN`
   - Paste into `.env.local`

3. **Test Connection**:
   ```bash
   # Run Redis test script
   npm run test:redis
   # Expected: "Redis connection successful"
   ```

---

## Step 7: Email Setup (Resend)

1. **Create Resend Account**:
   - Go to [resend.com](https://resend.com)
   - Sign up with email
   - Verify email address

2. **Get API Key**:
   - Navigate to API Keys
   - Click "Create API Key"
   - Enter name: `kringlelist-dev`
   - Copy key → `RESEND_API_KEY` in `.env.local`

3. **Configure Sender Domain** (production only):
   - Navigate to Domains
   - Click "Add Domain"
   - Enter domain: `kringlelist.com`
   - Follow DNS setup instructions
   - **Local dev**: Use `onboarding@resend.dev` (test email)

4. **Update `.env.local`**:
   ```bash
   RESEND_API_KEY=re_abc123...
   RESEND_FROM_EMAIL=onboarding@resend.dev  # Or your verified domain
   ```

---

## Step 8: Storage Setup (Vercel Blob)

**Note**: Vercel Blob is automatically configured when deploying to Vercel. For local development, use test mode or S3-compatible alternative.

### Option A: Vercel Blob (Production/Staging)

1. **Link Project to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Link project
   vercel link
   # Follow prompts to create/link project
   ```

2. **Enable Vercel Blob**:
   - Go to Vercel Dashboard → Your Project → Storage
   - Click "Create Database" → "Blob"
   - Follow setup instructions
   - Environment variables auto-populated in Vercel

### Option B: Local Development (Mock Storage)

```bash
# Use local filesystem for development
# Blob uploads saved to ./public/uploads

# No additional configuration needed
# Vercel Blob SDK will use filesystem fallback
```

---

## Step 9: Analytics Setup (PostHog)

1. **Create PostHog Project**:
   - Go to [posthog.com](https://posthog.com)
   - Sign up (free tier available)
   - Create new project: `KringleList`

2. **Get Project API Key**:
   - Navigate to Project Settings
   - Copy "Project API Key" → `NEXT_PUBLIC_POSTHOG_KEY`
   - Copy "Host" (usually `https://app.posthog.com`) → `NEXT_PUBLIC_POSTHOG_HOST`

3. **Update `.env.local`**:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_abc123...
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### Google Analytics 4 (Optional)

1. **Create GA4 Property**:
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create property: `KringleList`
   - Copy "Measurement ID" (G-XXXXXXXXXX) → `NEXT_PUBLIC_GA4_MEASUREMENT_ID`

---

## Step 10: Error Tracking Setup (Sentry)

1. **Create Sentry Project**:
   - Go to [sentry.io](https://sentry.io)
   - Sign up or log in
   - Click "Create Project"
   - Select "Next.js" platform
   - Enter name: `kringlelist`
   - Click "Create Project"

2. **Get DSN**:
   - Copy "DSN" → `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
   - Paste into `.env.local`

3. **Install Sentry SDK**:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   # Follow prompts (auto-configures Sentry)
   ```

---

## Step 11: Run Development Server

```bash
# Start Next.js dev server
npm run dev

# Server starts at http://localhost:3000
```

**Verify setup**:
- Navigate to `http://localhost:3000`
- You should see the homepage
- Click "Sign Up" → create test account
- Verify Clerk authentication works
- Check Supabase dashboard → `users` table should have new row

---

## Step 12: Verify All Services

Run the comprehensive health check script:

```bash
# Run health check script
npm run health:check

# Expected output:
# ✅ Database (Supabase): Connected
# ✅ Redis (Upstash): Connected
# ✅ Search (Meilisearch): Connected
# ✅ Auth (Clerk): Configured
# ✅ Email (Resend): Configured
# ✅ Analytics (PostHog): Configured
# ✅ Errors (Sentry): Configured
```

---

## Step 13: Run Tests

```bash
# Unit tests (Vitest)
npm run test

# Integration tests (Supertest)
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# All tests
npm run test:all
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run search:init` | Create Meilisearch indexes |
| `npm run search:seed` | Index sample products |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run E2E tests (Playwright) |

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 [PID]  # macOS/Linux
taskkill /PID [PID] /F  # Windows

# Or run on different port
PORT=3001 npm run dev
```

---

### Database Connection Failed

**Check**:
1. `DATABASE_URL` correct in `.env.local`
2. Supabase project active (not paused)
3. Network allows connections to Supabase (firewall/VPN)
4. Database password correct (no special characters causing issues)

**Solution**:
```bash
# Test connection manually
npx prisma db push --skip-generate

# If fails, re-copy connection string from Supabase dashboard
```

---

### Clerk Authentication Not Working

**Check**:
1. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` correct
2. Clerk application not in "Development Mode Only" (if deploying)
3. HTTPS required for production (Vercel auto-provides)
4. Webhook endpoint accessible (use ngrok for local testing)

**Solution**:
```bash
# Verify Clerk config
curl -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  https://api.clerk.com/v1/instance

# Should return instance details
```

---

### Meilisearch Not Responding

**Check**:
1. Docker container running: `docker ps | grep meilisearch`
2. Port 7700 not in use by another service
3. `MEILISEARCH_API_KEY` matches `MEILI_MASTER_KEY` from Docker run command

**Solution**:
```bash
# Restart Meilisearch container
docker restart meilisearch

# Check logs
docker logs meilisearch
```

---

### Redis Connection Failed

**Check**:
1. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` correct
2. Upstash database active (not paused)
3. Network allows connections (firewall/VPN)

**Solution**:
```bash
# Test Redis connection with curl
curl -X POST $UPSTASH_REDIS_REST_URL/get/test \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"

# Should return {"result":null} if key doesn't exist
```

---

### Build Fails

**Common causes**:
- TypeScript errors (run `npm run type-check`)
- ESLint errors (run `npm run lint`)
- Missing environment variables

**Solution**:
```bash
# Check for TypeScript errors
npm run type-check

# Fix ESLint issues
npm run lint:fix

# Ensure all required env vars set
npm run env:check
```

---

## Next Steps

Once the development environment is running:

1. **Read the Feature Spec**: Review `specs/001-gift-finder-mvp/spec.md` for user stories and requirements
2. **Review Data Model**: Understand database schema in `specs/001-gift-finder-mvp/data-model.md`
3. **Explore API Contracts**: Review REST API in `specs/001-gift-finder-mvp/contracts/openapi.yaml`
4. **Start Implementing**: Follow tasks in `specs/001-gift-finder-mvp/tasks.md` (generated via `/speckit.tasks`)

---

## Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Meilisearch Docs](https://www.meilisearch.com/docs)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Resend Docs](https://resend.com/docs)

### Community & Support
- [GitHub Discussions](https://github.com/your-org/kringlelist/discussions)
- [Slack Channel](https://your-org.slack.com/channels/kringlelist) (internal team)
- Stack Overflow: Tag questions with `kringlelist`

---

## License

MIT License - see LICENSE file for details
