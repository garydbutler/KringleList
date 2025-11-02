# Supabase Database Setup Guide

This guide will walk you through setting up Supabase as the PostgreSQL database for KringleList.

---

## 📍 Finding Your Connection Strings in Supabase

### Method 1: Using the "Connect" Button (EASIEST)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click the "Connect" button** at the top-right of the page
4. A modal will appear with connection options

### Method 2: Via Database Settings

1. Go to **Project Settings** (⚙️ gear icon in sidebar)
2. Click **Database** in the left menu
3. Scroll down to **Connection string** section

---

## 🔑 Understanding the 3 Connection String Types

Supabase provides **3 different connection strings**. Here's what you need to know:

### 1️⃣ Transaction Pooler (Port 6543) ⭐ RECOMMENDED for `DATABASE_URL`

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Use this for:**
- ✅ Your `DATABASE_URL` in `.env.local`
- ✅ Application queries (Prisma Client operations)
- ✅ Serverless deployments (Next.js, Vercel)
- ✅ Connection pooling (essential for Next.js API routes)

**Note:** Add `?pgbouncer=true` to the end for proper pooling configuration.

---

### 2️⃣ Session Pooler (Port 5432) ⭐ RECOMMENDED for `DIRECT_URL`

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**Use this for:**
- ✅ Your `DIRECT_URL` in `.env.local`
- ✅ Prisma migrations (`prisma migrate`, `prisma db push`)
- ✅ Prisma introspection
- ✅ Direct database operations via CLI

---

### 3️⃣ Direct Connection (Alternative for `DIRECT_URL`)

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Use this for:**
- ⚠️ Alternative for `DIRECT_URL` if Session Pooler doesn't work
- ⚠️ NOT recommended for `DATABASE_URL` in production

---

## 🛠️ Step-by-Step Setup

### Step 1: Get Your Connection Strings

1. **Click "Connect"** in your Supabase Dashboard
2. Select **"URI"** tab (or **"Connection string"**)
3. You'll see a dropdown with **3 options**:
   - Transaction mode (Port 6543)
   - Session mode (Port 5432)
   - Direct connection
4. **Copy both:**
   - Transaction mode → for `DATABASE_URL`
   - Session mode → for `DIRECT_URL`

**Visual Guide:**
```
Supabase Dashboard
    ↓
"Connect" Button (top right)
    ↓
Select "URI" tab
    ↓
Choose "Transaction" from dropdown → Copy
Choose "Session" from dropdown → Copy
```

---

### Step 2: Find Your Database Password

Your connection strings show `[YOUR-PASSWORD]` placeholder. Here's where to find it:

**Option A: You set it during project creation**
- Check your password manager or notes

**Option B: Reset your password**
1. Go to **Project Settings** → **Database**
2. Scroll to **Database password** section
3. Click **"Reset database password"**
4. Copy and save the new password securely

⚠️ **IMPORTANT:** Save this password! You can't retrieve it later.

---

### Step 3: Configure Your `.env.local` File

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and replace the Supabase section:

   ```bash
   # DATABASE_URL - Transaction Pooler (for app queries)
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

   # DIRECT_URL - Session Pooler (for migrations)
   DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

3. **Replace the placeholders:**
   - `[PROJECT_REF]` - Your project reference (shown in the URL)
   - `[YOUR_PASSWORD]` - Your database password
   - `us-east-1` - Your region (adjust if different)

**Example (with fake credentials):**
```bash
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:MySecretPass123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.abcdefghijklmnop:MySecretPass123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

### Step 4: Verify Your Prisma Configuration

Your `prisma/schema.prisma` should already have:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

✅ This is already configured in your project!

---

### Step 5: Push Your Schema to Supabase

Now that your connection is configured, push your database schema:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to Supabase (creates all tables)
npm run db:push

# Seed the database with sample data
npm run db:seed
```

**What this does:**
- Creates all 18 database tables from your Prisma schema
- Sets up all relationships, indexes, and constraints
- Seeds sample merchants (Amazon, Target, Walmart)

---

### Step 6: Verify Your Database

**Option A: Using Prisma Studio**
```bash
npm run db:studio
```
Opens a GUI at http://localhost:5555 to browse your tables.

**Option B: Using Supabase Dashboard**
1. Go to **Table Editor** in Supabase Dashboard
2. You should see all your tables:
   - users
   - children
   - bags
   - bag_items
   - claims
   - products
   - product_offers
   - merchants
   - ... and 10 more!

---

## ⚠️ Troubleshooting

### Error: "Can't reach database server"

**Check:**
1. ✅ Password is correct (no extra spaces)
2. ✅ Project reference is correct
3. ✅ Region matches your Supabase project
4. ✅ `?pgbouncer=true` is appended to `DATABASE_URL`

### Error: "P3009: migrate could not create shadow database"

**Solution:** You're missing `DIRECT_URL`. Make sure it's set in `.env.local`.

### Error: "Connection timeout"

**Check:**
1. Your Supabase project is not paused
2. You're using the pooler URLs (not direct connection for `DATABASE_URL`)
3. Your network allows outbound connections to port 6543

### Database seems empty after `db:push`

**Solution:** Run the seed script:
```bash
npm run db:seed
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to git (already in `.gitignore`)
2. **Use different passwords** for development and production
3. **Enable RLS (Row Level Security)** in Supabase for production
4. **Rotate passwords** periodically
5. **Use environment variables** in Vercel for production deployment

---

## 🚀 Next Steps

After your database is connected:

1. ✅ Complete Clerk authentication setup
2. ✅ Install shadcn/ui components
3. ✅ Continue with Phase 2 infrastructure tasks
4. ✅ Begin implementing User Story 1

---

## 📚 Additional Resources

- [Supabase + Prisma Integration Guide](https://supabase.com/partners/integrations/prisma)
- [Prisma Supabase Documentation](https://www.prisma.io/docs/orm/overview/databases/supabase)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [Troubleshooting Prisma with Supabase](https://supabase.com/partners/integrations/prisma#troubleshooting)

---

## 🆘 Need Help?

If you're still having issues:

1. Check the [Prisma Discussions](https://github.com/prisma/prisma/discussions)
2. Check the [Supabase Discord](https://discord.supabase.com/)
3. Review the `IMPLEMENTATION_STATUS.md` for current project status
