# KringleList - Quick Reference

## 🔗 Where to Find Connection Strings

### Supabase Database Connection
1. **Dashboard**: https://supabase.com/dashboard
2. Click **"Connect"** button (top-right)
3. Select **"URI"** tab
4. Copy **TWO** connection strings:
   - **Transaction** (port 6543) → `DATABASE_URL`
   - **Session** (port 5432) → `DIRECT_URL`

**Pattern:**
```
Transaction: postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres
Session:     postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres
```

---

### Clerk Authentication Keys
1. **Dashboard**: https://dashboard.clerk.com
2. Select your application
3. Go to **API Keys** in sidebar
4. Copy **THREE** keys:
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`
   - **Webhook Signing Secret** → `CLERK_WEBHOOK_SECRET`

---

## 📝 .env.local Template (Quick Copy)

```bash
# SUPABASE
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# CLERK
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚡ Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Test production build
npm run lint             # Run linter

# Database (after DATABASE_URL is set)
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database (creates tables)
npm run db:seed          # Seed sample data
npm run db:studio        # Open Prisma Studio GUI

# Git (when ready)
git add .
git commit -m "feat: setup database and auth"
git push origin 001-gift-finder-mvp
```

---

## 🎯 Setup Checklist

- [ ] Create Supabase project
- [ ] Copy `DATABASE_URL` and `DIRECT_URL` to `.env.local`
- [ ] Run `npm run db:push` to create tables
- [ ] Run `npm run db:seed` to add sample data
- [ ] Create Clerk application
- [ ] Copy Clerk keys to `.env.local`
- [ ] Test with `npm run dev`
- [ ] Verify database in Prisma Studio: `npm run db:studio`

---

## 📊 Project Status

**Completed**: 30/185 tasks (16%)
- ✅ Phase 1: Setup (9/9)
- ⏳ Phase 2: Foundation (17/48)
  - ✅ Database schema created
  - ✅ Auth pages created
  - ⏸️ Waiting for service credentials

**See `IMPLEMENTATION_STATUS.md` for full details**

---

## 🆘 Quick Troubleshooting

**Can't find connection string in Supabase?**
→ Click "Connect" button at top of dashboard

**Database connection error?**
→ Check password has no extra spaces
→ Verify `?pgbouncer=true` is appended to `DATABASE_URL`

**Migration errors?**
→ Ensure `DIRECT_URL` is set in `.env.local`

**Build failing?**
→ Run `npm run db:generate` first
→ Check all env vars are set

---

## 📚 Full Guides

- 📖 `docs/SUPABASE_SETUP.md` - Detailed Supabase setup guide
- 📖 `IMPLEMENTATION_STATUS.md` - Complete project status
- 📖 `.env.example` - All environment variables with comments
