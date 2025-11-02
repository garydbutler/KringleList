# Data Model: KringleList Gift Finder MVP

**Feature**: 001-gift-finder-mvp
**Date**: 2025-11-01
**Database**: PostgreSQL (Supabase)
**ORM**: Prisma

## Overview

This document defines the complete data model for the KringleList MVP. The schema is designed to support all six user stories while maintaining COPPA compliance (no child PII beyond nickname and age band), enabling real-time bag updates, and optimizing for the gift discovery and sharing workflows.

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique @map("clerk_id")
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relationships
  children  Child[]

  @@map("users")
}

// ============================================================================
// CHILD PROFILES & GIFT BAGS
// ============================================================================

enum AgeBand {
  ZERO_TO_TWO    @map("0-2")
  THREE_TO_FOUR  @map("3-4")
  FIVE_TO_SEVEN  @map("5-7")
  EIGHT_TO_TEN   @map("8-10")
  ELEVEN_TO_THIRTEEN @map("11-13")
  FOURTEEN_PLUS  @map("14+")

  @@map("age_band")
}

model Child {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  nickname    String   @db.VarChar(20)
  ageBand     AgeBand  @map("age_band")
  interests   String[] // Array of interest strings (max 8)
  values      String[] @default([]) // Optional values (STEM, eco, etc.)
  budgetCents Int?     @map("budget_cents") // Nullable, in cents
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relationships
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  bag  Bag?

  @@index([userId])
  @@map("children")
}

model Bag {
  id               String   @id @default(uuid())
  childId          String   @unique @map("child_id")
  shareToken       String   @unique @default(uuid()) @map("share_token")
  totalBudgetCents Int?     @map("total_budget_cents") // Inherited from child or overridden
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  // Relationships
  child Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
  items BagItem[]

  @@index([shareToken])
  @@map("bags")
}

model BagItem {
  id             String   @id @default(uuid())
  bagId          String   @map("bag_id")
  productOfferId String   @map("product_offer_id")
  quantity       Int      @default(1)
  isSurprise     Boolean  @default(false) @map("is_surprise")
  backupOfferIds String[] @default([]) @map("backup_offer_ids") // Array of UUID strings
  alertEnabled   Boolean  @default(false) @map("alert_enabled")
  lastAlertSentAt DateTime? @map("last_alert_sent_at")
  createdAt      DateTime @default(now()) @map("created_at")

  // Relationships
  bag          Bag          @relation(fields: [bagId], references: [id], onDelete: Cascade)
  productOffer ProductOffer @relation(fields: [productOfferId], references: [id])
  claim        Claim?

  @@index([bagId])
  @@index([productOfferId])
  @@index([alertEnabled])
  @@map("bag_items")
}

enum ClaimStatus {
  CLAIMED
  PURCHASED

  @@map("claim_status")
}

model Claim {
  id            String      @id @default(uuid())
  bagItemId     String      @unique @map("bag_item_id")
  claimerName   String      @db.VarChar(100) @map("claimer_name")
  claimerEmail  String?     @db.VarChar(255) @map("claimer_email")
  status        ClaimStatus @default(CLAIMED)
  claimedAt     DateTime    @default(now()) @map("claimed_at")
  purchasedAt   DateTime?   @map("purchased_at")

  // Relationships
  bagItem BagItem @relation(fields: [bagItemId], references: [id], onDelete: Cascade)

  @@index([bagItemId])
  @@map("claims")
}

// ============================================================================
// PRODUCT CATALOG
// ============================================================================

model Merchant {
  id                String   @id @default(uuid())
  name              String   @db.VarChar(100)
  slug              String   @unique @db.VarChar(100)
  affiliateProgram  String   @map("affiliate_program") @db.VarChar(50) // 'amazon', 'walmart', 'impact', etc.
  baseCommissionPct Decimal? @map("base_commission_pct") @db.Decimal(5, 2)
  logoUrl           String?  @map("logo_url") @db.VarChar(500)
  status            MerchantStatus @default(ACTIVE)
  lastIngestedAt    DateTime? @map("last_ingested_at")
  createdAt         DateTime @default(now()) @map("created_at")

  // Relationships
  productOffers ProductOffer[]

  @@index([status])
  @@map("merchants")
}

enum MerchantStatus {
  ACTIVE
  PAUSED
  DISABLED

  @@map("merchant_status")
}

model Product {
  id           String   @id @default(uuid())
  gtin         String?  @unique @db.VarChar(14) // EAN/UPC/ISBN (nullable)
  title        String   @db.VarChar(500)
  brand        String?  @db.VarChar(200)
  categoryPath String[] @default([]) @map("category_path") // Hierarchical categories
  description  String?  @db.Text
  ageMin       Int?     @map("age_min")
  ageMax       Int?     @map("age_max")
  valuesTags   String[] @default([]) @map("values_tags") // STEM, eco, screen-free, etc.
  images       String[] @default([]) // Array of image URLs
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relationships
  productOffers    ProductOffer[]
  popularitySignals PopularitySignal[]
  rankFeatures     RankFeatures?

  @@index([gtin])
  @@index([brand])
  @@map("products")
}

model ProductOffer {
  id             String   @id @default(uuid())
  productId      String   @map("product_id")
  merchantId     String   @map("merchant_id")
  url            String   @db.VarChar(1000)
  affiliateUrl   String   @map("affiliate_url") @db.VarChar(1500)
  priceCents     Int      @map("price_cents")
  listPriceCents Int?     @map("list_price_cents")
  currency       String   @default("USD") @db.VarChar(3)
  inStock        Boolean  @default(true) @map("in_stock")
  lastSeenAt     DateTime @default(now()) @map("last_seen_at")
  createdAt      DateTime @default(now()) @map("created_at")

  // Relationships
  product      Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  merchant     Merchant       @relation(fields: [merchantId], references: [id])
  priceHistory PriceHistory[]
  bagItems     BagItem[]

  @@unique([productId, merchantId])
  @@index([productId])
  @@index([merchantId])
  @@index([inStock])
  @@map("product_offers")
}

model PriceHistory {
  id             BigInt   @id @default(autoincrement())
  productOfferId String   @map("product_offer_id")
  ts             DateTime @default(now())
  priceCents     Int      @map("price_cents")
  inStock        Boolean  @map("in_stock")

  // Relationships
  productOffer ProductOffer @relation(fields: [productOfferId], references: [id], onDelete: Cascade)

  @@index([productOfferId, ts(sort: Desc)])
  @@map("price_history")
}

// ============================================================================
// SEARCH & RANKING
// ============================================================================

enum PopularityWindow {
  DAILY
  WEEKLY
  MONTHLY

  @@map("popularity_window")
}

model PopularitySignal {
  id             String           @id @default(uuid())
  productId      String           @map("product_id")
  window         PopularityWindow
  clicks         Int              @default(0)
  addToBag       Int              @default(0) @map("add_to_bag")
  claimCount     Int              @default(0) @map("claim_count")
  purchaseClicks Int              @default(0) @map("purchase_clicks")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  // Relationships
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, window])
  @@map("popularity_signals")
}

model RankFeatures {
  productId          String   @id @map("product_id")
  ageFitScore        Decimal  @map("age_fit_score") @db.Decimal(5, 2)
  marginScore        Decimal  @map("margin_score") @db.Decimal(5, 2)
  availabilityScore  Decimal  @map("availability_score") @db.Decimal(5, 2)
  trendScore         Decimal  @map("trend_score") @db.Decimal(5, 2)
  freshnessTs        DateTime @map("freshness_ts")
  updatedAt          DateTime @updatedAt @map("updated_at")

  // Relationships
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("rank_features")
}

// ============================================================================
// ANALYTICS & TRACKING
// ============================================================================

model ClickEvent {
  id             BigInt   @id @default(autoincrement())
  userId         String?  @map("user_id") // Nullable (unauthenticated clicks)
  productOfferId String?  @map("product_offer_id")
  pageCtx        String?  @db.VarChar(100) @map("page_ctx") // 'finder', 'trends', 'bag', 'sponsored'
  ts             DateTime @default(now())
  utm            Json?    // UTM parameters as JSON
  experiment     String?  @db.VarChar(100) // A/B test variant

  @@index([ts(sort: Desc)])
  @@index([productOfferId])
  @@map("click_events")
}

// ============================================================================
// SPONSORED CAMPAIGNS
// ============================================================================

enum SponsorStatus {
  ACTIVE
  PAUSED
  SUSPENDED

  @@map("sponsor_status")
}

model Sponsor {
  id               String        @id @default(uuid())
  orgName          String        @map("org_name") @db.VarChar(200)
  contactEmail     String        @map("contact_email") @db.VarChar(255)
  stripeCustomerId String?       @unique @map("stripe_customer_id") @db.VarChar(100)
  status           SponsorStatus @default(ACTIVE)
  createdAt        DateTime      @default(now()) @map("created_at")

  // Relationships
  campaigns Campaign[]

  @@map("sponsors")
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED

  @@map("campaign_status")
}

enum PricingModel {
  FLAT
  CPC
  HYBRID

  @@map("pricing_model")
}

model Campaign {
  id                String         @id @default(uuid())
  sponsorId         String         @map("sponsor_id")
  name              String         @db.VarChar(200)
  startDate         DateTime       @map("start_date") @db.Date
  endDate           DateTime       @map("end_date") @db.Date
  targeting         Json           @default("{}") // Targeting criteria as JSON
  pricingModel      PricingModel   @map("pricing_model")
  flatFeeCents      Int?           @map("flat_fee_cents")
  cpcCents          Int?           @map("cpc_cents")
  dailyBudgetCents  Int?           @map("daily_budget_cents")
  totalBudgetCents  Int?           @map("total_budget_cents")
  status            CampaignStatus @default(DRAFT)
  createdAt         DateTime       @default(now()) @map("created_at")

  // Relationships
  sponsor  Sponsor    @relation(fields: [sponsorId], references: [id])
  creatives Creative[]
  sponsoredSlots SponsoredSlot[]

  @@index([sponsorId])
  @@index([startDate, endDate])
  @@index([status])
  @@map("campaigns")
}

enum CreativeStatus {
  PENDING_REVIEW
  APPROVED
  REJECTED

  @@map("creative_status")
}

model Creative {
  id           String         @id @default(uuid())
  campaignId   String         @map("campaign_id")
  title        String         @db.VarChar(100)
  description  String?        @db.Text
  bullets      String[]       @default([]) // Array of up to 3 bullet strings
  imageUrl     String         @map("image_url") @db.VarChar(500)
  clickUrl     String         @map("click_url") @db.VarChar(1000)
  retailerList String[]       @default([]) @map("retailer_list") // Merchant names
  couponCode   String?        @map("coupon_code") @db.VarChar(50)
  status       CreativeStatus @default(PENDING_REVIEW)
  moderatedAt  DateTime?      @map("moderated_at")
  moderatedBy  String?        @map("moderated_by") // User ID
  createdAt    DateTime       @default(now()) @map("created_at")

  // Relationships
  campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  sponsoredSlots SponsoredSlot[]

  @@index([campaignId])
  @@index([status])
  @@map("creatives")
}

model SponsoredSlot {
  id         String   @id @default(uuid())
  pageCtx    String   @db.VarChar(50) @map("page_ctx") // 'homepage', 'finder', 'trends', 'email'
  position   String   @db.VarChar(50) // 'featured-1', 'sidebar', etc.
  campaignId String?  @map("campaign_id")
  creativeId String?  @map("creative_id")
  schedule   Json?    // Day/hour targeting as JSON
  priority   Int      @default(0)
  createdAt  DateTime @default(now()) @map("created_at")

  // Relationships
  campaign Campaign? @relation(fields: [campaignId], references: [id])
  creative Creative? @relation(fields: [creativeId], references: [id])

  @@index([pageCtx])
  @@map("sponsored_slots")
}

// ============================================================================
// SYSTEM & CONFIGURATION
// ============================================================================

model FeatureFlag {
  key         String   @id @db.VarChar(100)
  value       Json
  description String?  @db.Text
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("feature_flags")
}

model Newsletter {
  id         String   @id @default(uuid())
  title      String   @db.VarChar(200)
  sendTs     DateTime? @map("send_ts")
  audience   Json?    // Targeting criteria as JSON
  sentCount  Int      @default(0) @map("sent_count")
  openCount  Int      @default(0) @map("open_count")
  clickCount Int      @default(0) @map("click_count")
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("newsletters")
}
```

---

## Entity Relationships Diagram

```
User (1) ──────< (N) Child
Child (1) ────── (1) Bag
Bag (1) ─────< (N) BagItem
BagItem (1) ──── (0..1) Claim
BagItem (N) ───< (1) ProductOffer

Product (1) ────< (N) ProductOffer
Product (1) ────< (N) PopularitySignal
Product (1) ────── (0..1) RankFeatures

Merchant (1) ───< (N) ProductOffer

ProductOffer (1) ──< (N) PriceHistory

Sponsor (1) ────< (N) Campaign
Campaign (1) ───< (N) Creative
Campaign (1) ───< (N) SponsoredSlot
Creative (1) ───< (N) SponsoredSlot
```

---

## Key Design Decisions

### 1. COPPA Compliance
- **Child table**: Only stores `nickname` (20 char max) and `ageBand` (enum) - no PII
- No birthdate, full name, email, or other identifying information
- Soft delete via `onDelete: Cascade` ensures child data removed when parent deletes account

### 2. Real-Time Bag Updates
- **Bag.shareToken**: UUID enables public access without authentication (FR-029)
- **Claim.status**: Tracks claimed vs purchased state for transparency
- **BagItem.isSurprise**: Boolean flag filters items from shared view (FR-022)
- Indexes on `shareToken` and `bagId` optimize query performance for real-time updates

### 3. Product Search & Ranking
- **RankFeatures**: Pre-computed scores (age fit, margin, availability, trend, freshness) enable fast sorting
- **PopularitySignal**: Aggregated metrics by time window (daily, weekly, monthly) for trend detection
- Separate `Product` (universal) and `ProductOffer` (merchant-specific) enables price comparison (FR-017)

### 4. Price Alert System
- **PriceHistory**: Time-series table with BigInt ID and timestamp index for efficient range queries
- **BagItem.alertEnabled + lastAlertSentAt**: Enables rate limiting (1 alert per 24h per item)
- 90-day retention via background job (FR-050)

### 5. Affiliate Revenue Tracking
- **ClickEvent**: Analytics table tracks every product click with context (finder, trends, bag, sponsored)
- `pageCtx` field enables revenue attribution by source (FR-063)
- `utm` JSON field captures campaign parameters

### 6. Sponsored Campaigns
- **Campaign.targeting**: JSON field stores flexible targeting criteria (age bands, interests, values, etc.)
- **Creative.status**: Moderation workflow (pending_review → approved/rejected)
- **SponsoredSlot**: Inventory management with priority scheduling

### 7. Performance Optimizations
- **Indexes**: All foreign keys indexed, plus frequently queried fields (status, timestamps, tokens)
- **Enums**: Type-safe status fields prevent invalid states
- **Unique constraints**: Prevent duplicate bag shares, merchant-product pairs, popularity windows
- **Cascading deletes**: Automatic cleanup of related records (bags when child deleted, offers when product deleted)

---

## Validation Rules (Zod Schemas)

```typescript
// lib/utils/validation.ts
import { z } from 'zod';

export const AgeBandSchema = z.enum(['0-2', '3-4', '5-7', '8-10', '11-13', '14+']);

export const ChildProfileSchema = z.object({
  nickname: z.string().min(2).max(20),
  ageBand: AgeBandSchema,
  interests: z.array(z.string()).min(1).max(8),
  values: z.array(z.string()).max(8).optional(),
  budgetCents: z.number().int().min(0).max(100000).optional(),
});

export const BagItemSchema = z.object({
  productOfferId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
  isSurprise: z.boolean().default(false),
  backupOfferIds: z.array(z.string().uuid()).default([]),
  alertEnabled: z.boolean().default(false),
});

export const ClaimSchema = z.object({
  claimerName: z.string().min(1).max(100),
  claimerEmail: z.string().email().optional(),
});

export const CampaignSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.date(),
  endDate: z.date(),
  targeting: z.object({
    ageBands: z.array(AgeBandSchema).optional(),
    interests: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
  }),
  pricingModel: z.enum(['FLAT', 'CPC', 'HYBRID']),
  flatFeeCents: z.number().int().min(0).optional(),
  cpcCents: z.number().int().min(0).optional(),
  dailyBudgetCents: z.number().int().min(0).optional(),
  totalBudgetCents: z.number().int().min(0).optional(),
});
```

---

## Migrations Strategy

1. **Initial Migration**: Create all tables, indexes, enums
2. **Seed Data**:
   - Interest list (Art & Crafts, Building, Books, Music, etc.)
   - Value tags (STEM, screen-free, eco, sensory-friendly, etc.)
   - Sample merchants (Amazon, Target, Walmart)
3. **Future Migrations**:
   - Add columns with `@default` for backward compatibility
   - Never drop columns (mark deprecated, remove after 2 releases)
   - Use `@map` for renaming (preserves database column names)

---

## Queries & Performance

### Hot Queries (Expected High Volume)

1. **Get bag with items for child**:
   ```prisma
   await prisma.bag.findUnique({
     where: { childId },
     include: {
       items: {
         include: { productOffer: { include: { product: true } }, claim: true }
       }
     }
   });
   ```
   - Optimized by: `childId` unique index, eager loading

2. **Get shared bag (public view)**:
   ```prisma
   await prisma.bag.findUnique({
     where: { shareToken },
     include: {
       child: { select: { nickname: true, ageBand: true } },
       items: {
         where: { isSurprise: false },
         include: { productOffer: { include: { product: true, merchant: true } }, claim: true }
       }
     }
   });
   ```
   - Optimized by: `shareToken` unique index, filtered eager loading

3. **Search products** (delegated to Meilisearch):
   - Prisma query only for fetching full details after search
   - Search index updated via background job on product changes

4. **Price monitoring** (background job):
   ```prisma
   const items = await prisma.bagItem.findMany({
     where: { alertEnabled: true },
     include: { productOffer: true }
   });
   ```
   - Optimized by: `alertEnabled` partial index

---

## Data Retention & Cleanup

| Table | Retention Policy | Cleanup Method |
|-------|------------------|----------------|
| PriceHistory | 90 days | Background job (daily) deletes rows where `ts < NOW() - INTERVAL '90 days'` |
| ClickEvent | 365 days | Background job (weekly) deletes rows where `ts < NOW() - INTERVAL '365 days'` |
| Campaign | Permanent (for audit) | Soft delete via `status = CANCELLED` |
| Claim | Permanent (for audit) | Cascade delete when bag deleted |
| Child | Permanent (soft delete) | Mark deleted in separate `deleted_children` table, remove after 30 days |

---

## Next Steps

1. **Phase 1 Contracts**: Generate OpenAPI spec from this data model
2. **Phase 1 Quickstart**: Document Prisma setup, migrations, and seeding
3. **Phase 2 Tasks**: Break down implementation into migration tasks, seed tasks, and query optimization tasks
