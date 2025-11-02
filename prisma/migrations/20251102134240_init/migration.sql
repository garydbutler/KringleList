-- CreateEnum
CREATE TYPE "age_band" AS ENUM ('0-2', '3-4', '5-7', '8-10', '11-13', '14+');

-- CreateEnum
CREATE TYPE "claim_status" AS ENUM ('CLAIMED', 'PURCHASED');

-- CreateEnum
CREATE TYPE "merchant_status" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED');

-- CreateEnum
CREATE TYPE "popularity_window" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "sponsor_status" AS ENUM ('ACTIVE', 'PAUSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "campaign_status" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "pricing_model" AS ENUM ('FLAT', 'CPC', 'HYBRID');

-- CreateEnum
CREATE TYPE "creative_status" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nickname" VARCHAR(20) NOT NULL,
    "age_band" "age_band" NOT NULL,
    "interests" TEXT[],
    "values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budget_cents" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bags" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "total_budget_cents" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bag_items" (
    "id" TEXT NOT NULL,
    "bag_id" TEXT NOT NULL,
    "product_offer_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "is_surprise" BOOLEAN NOT NULL DEFAULT false,
    "backup_offer_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "alert_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_alert_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bag_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "bag_item_id" TEXT NOT NULL,
    "claimer_name" VARCHAR(100) NOT NULL,
    "claimer_email" VARCHAR(255),
    "status" "claim_status" NOT NULL DEFAULT 'CLAIMED',
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchased_at" TIMESTAMP(3),

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "affiliate_program" VARCHAR(50) NOT NULL,
    "base_commission_pct" DECIMAL(5,2),
    "logo_url" VARCHAR(500),
    "status" "merchant_status" NOT NULL DEFAULT 'ACTIVE',
    "last_ingested_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "gtin" VARCHAR(14),
    "title" VARCHAR(500) NOT NULL,
    "brand" VARCHAR(200),
    "category_path" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "age_min" INTEGER,
    "age_max" INTEGER,
    "values_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_offers" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "affiliate_url" VARCHAR(1500) NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "list_price_cents" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" BIGSERIAL NOT NULL,
    "product_offer_id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price_cents" INTEGER NOT NULL,
    "in_stock" BOOLEAN NOT NULL,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popularity_signals" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "window" "popularity_window" NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "add_to_bag" INTEGER NOT NULL DEFAULT 0,
    "claim_count" INTEGER NOT NULL DEFAULT 0,
    "purchase_clicks" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "popularity_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_features" (
    "product_id" TEXT NOT NULL,
    "age_fit_score" DECIMAL(5,2) NOT NULL,
    "margin_score" DECIMAL(5,2) NOT NULL,
    "availability_score" DECIMAL(5,2) NOT NULL,
    "trend_score" DECIMAL(5,2) NOT NULL,
    "freshness_ts" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rank_features_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "click_events" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT,
    "product_offer_id" TEXT,
    "page_ctx" VARCHAR(100),
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utm" JSONB,
    "experiment" VARCHAR(100),

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "org_name" VARCHAR(200) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "stripe_customer_id" VARCHAR(100),
    "status" "sponsor_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "sponsor_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "targeting" JSONB NOT NULL DEFAULT '{}',
    "pricing_model" "pricing_model" NOT NULL,
    "flat_fee_cents" INTEGER,
    "cpc_cents" INTEGER,
    "daily_budget_cents" INTEGER,
    "total_budget_cents" INTEGER,
    "status" "campaign_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creatives" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "bullets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" VARCHAR(500) NOT NULL,
    "click_url" VARCHAR(1000) NOT NULL,
    "retailer_list" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coupon_code" VARCHAR(50),
    "status" "creative_status" NOT NULL DEFAULT 'PENDING_REVIEW',
    "moderated_at" TIMESTAMP(3),
    "moderated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_slots" (
    "id" TEXT NOT NULL,
    "page_ctx" VARCHAR(50) NOT NULL,
    "position" VARCHAR(50) NOT NULL,
    "campaign_id" TEXT,
    "creative_id" TEXT,
    "schedule" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sponsored_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "newsletters" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "send_ts" TIMESTAMP(3),
    "audience" JSONB,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "open_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "children_user_id_idx" ON "children"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bags_child_id_key" ON "bags"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "bags_share_token_key" ON "bags"("share_token");

-- CreateIndex
CREATE INDEX "bags_share_token_idx" ON "bags"("share_token");

-- CreateIndex
CREATE INDEX "bag_items_bag_id_idx" ON "bag_items"("bag_id");

-- CreateIndex
CREATE INDEX "bag_items_product_offer_id_idx" ON "bag_items"("product_offer_id");

-- CreateIndex
CREATE INDEX "bag_items_alert_enabled_idx" ON "bag_items"("alert_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "claims_bag_item_id_key" ON "claims"("bag_item_id");

-- CreateIndex
CREATE INDEX "claims_bag_item_id_idx" ON "claims"("bag_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_slug_key" ON "merchants"("slug");

-- CreateIndex
CREATE INDEX "merchants_status_idx" ON "merchants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "products_gtin_key" ON "products"("gtin");

-- CreateIndex
CREATE INDEX "products_gtin_idx" ON "products"("gtin");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "product_offers_product_id_idx" ON "product_offers"("product_id");

-- CreateIndex
CREATE INDEX "product_offers_merchant_id_idx" ON "product_offers"("merchant_id");

-- CreateIndex
CREATE INDEX "product_offers_in_stock_idx" ON "product_offers"("in_stock");

-- CreateIndex
CREATE UNIQUE INDEX "product_offers_product_id_merchant_id_key" ON "product_offers"("product_id", "merchant_id");

-- CreateIndex
CREATE INDEX "price_history_product_offer_id_ts_idx" ON "price_history"("product_offer_id", "ts" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "popularity_signals_product_id_window_key" ON "popularity_signals"("product_id", "window");

-- CreateIndex
CREATE INDEX "click_events_ts_idx" ON "click_events"("ts" DESC);

-- CreateIndex
CREATE INDEX "click_events_product_offer_id_idx" ON "click_events"("product_offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "sponsors_stripe_customer_id_key" ON "sponsors"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "campaigns_sponsor_id_idx" ON "campaigns"("sponsor_id");

-- CreateIndex
CREATE INDEX "campaigns_start_date_end_date_idx" ON "campaigns"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "creatives_campaign_id_idx" ON "creatives"("campaign_id");

-- CreateIndex
CREATE INDEX "creatives_status_idx" ON "creatives"("status");

-- CreateIndex
CREATE INDEX "sponsored_slots_page_ctx_idx" ON "sponsored_slots"("page_ctx");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bags" ADD CONSTRAINT "bags_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bag_items" ADD CONSTRAINT "bag_items_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "bags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bag_items" ADD CONSTRAINT "bag_items_product_offer_id_fkey" FOREIGN KEY ("product_offer_id") REFERENCES "product_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_bag_item_id_fkey" FOREIGN KEY ("bag_item_id") REFERENCES "bag_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_offer_id_fkey" FOREIGN KEY ("product_offer_id") REFERENCES "product_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "popularity_signals" ADD CONSTRAINT "popularity_signals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_features" ADD CONSTRAINT "rank_features_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creatives" ADD CONSTRAINT "creatives_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_slots" ADD CONSTRAINT "sponsored_slots_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_slots" ADD CONSTRAINT "sponsored_slots_creative_id_fkey" FOREIGN KEY ("creative_id") REFERENCES "creatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
