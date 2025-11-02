# Tasks: KringleList Gift Finder MVP

**Feature Branch**: `001-gift-finder-mvp`
**Input**: Design documents from `/specs/001-gift-finder-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are EXCLUDED from this task list. Focus is on implementation and validation through independent test scenarios defined in spec.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 14 project with TypeScript and App Router in repository root
- [x] T002 [P] Install core dependencies: React 18, TailwindCSS, shadcn/ui, Clerk, TanStack Query, React Hook Form, Zod
- [x] T003 [P] Configure ESLint, Prettier, and Husky pre-commit hooks in project root
- [x] T004 [P] Setup Tailwind CSS configuration in src/styles/globals.css and tailwind.config.ts
- [x] T005 [P] Initialize shadcn/ui with components.json configuration
- [x] T006 Create project directory structure per plan.md (src/app/, src/components/, src/lib/, tests/)
- [x] T007 [P] Setup environment variables template in .env.example with all required service keys
- [x] T008 [P] Configure TypeScript strict mode in tsconfig.json
- [x] T009 [P] Setup Vercel deployment configuration in vercel.json

**Checkpoint**: Project structure initialized and ready for database and auth setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & ORM Setup

- [x] T010 Install Prisma ORM and PostgreSQL client dependencies
- [x] T011 Create Prisma schema from data-model.md in prisma/schema.prisma (all 18 entities, enums, relationships, indexes)
- [ ] T012 Setup Supabase project and configure DATABASE_URL environment variable
- [ ] T013 Run initial Prisma migration to create all database tables
- [x] T014 Create Prisma client singleton in src/lib/db/client.ts
- [x] T015 [P] Create seed script for interests, values, and age bands in prisma/seed.ts

### Authentication & Session Management

- [ ] T016 Setup Clerk project and configure CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [x] T017 Create Clerk middleware for route protection in src/middleware.ts
- [x] T018 [P] Create authentication utilities in src/lib/auth/session.ts (getUserId, requireAuth helpers)
- [x] T019 [P] Setup Clerk provider in root layout src/app/layout.tsx
- [x] T020 [P] Create sign-in page at src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
- [x] T021 [P] Create sign-up page at src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
- [x] T022 Create webhook handler for Clerk user events at src/app/api/webhooks/clerk/route.ts

### Search Engine Setup

- [ ] T023 Setup Meilisearch instance and configure MEILISEARCH_HOST and MEILISEARCH_API_KEY
- [ ] T024 Create Meilisearch client in src/lib/search/client.ts
- [ ] T025 Create product indexer service in src/lib/search/indexer.ts (indexes Product and ProductOffer entities)
- [ ] T026 [P] Create search ranking logic per spec FR-018 in src/lib/search/ranking.ts (age fit 35%, availability 25%, popularity 20%, margin 15%, freshness 5%)

### Caching & Background Jobs

- [ ] T027 Setup Upstash Redis and configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
- [ ] T028 Create Redis client in src/lib/cache/client.ts
- [ ] T029 [P] Create rate limiting utilities in src/lib/cache/rate-limit.ts

### Email Service

- [ ] T030 Setup Resend account and configure RESEND_API_KEY
- [ ] T031 Create email client in src/lib/email/client.ts
- [ ] T032 [P] Create base email templates using React Email in src/lib/email/templates/

### Affiliate Click Router

- [ ] T033 Create affiliate network configurations in src/lib/affiliates/networks.ts (Amazon, Walmart, Target, Impact, CJ)
- [ ] T034 Create click router logic with first-party tracking in src/lib/affiliates/router.ts
- [ ] T035 Create click tracking analytics in src/lib/affiliates/tracking.ts

### Base UI Components (shadcn/ui)

- [ ] T036 [P] Install shadcn/ui Button component in src/components/ui/button.tsx
- [ ] T037 [P] Install shadcn/ui Input component in src/components/ui/input.tsx
- [ ] T038 [P] Install shadcn/ui Card component in src/components/ui/card.tsx
- [ ] T039 [P] Install shadcn/ui Dialog component in src/components/ui/dialog.tsx
- [ ] T040 [P] Install shadcn/ui Select component in src/components/ui/select.tsx
- [ ] T041 [P] Install shadcn/ui Checkbox component in src/components/ui/checkbox.tsx
- [ ] T042 [P] Install shadcn/ui Form components in src/components/ui/form.tsx
- [ ] T043 [P] Install shadcn/ui Badge component in src/components/ui/badge.tsx
- [ ] T044 [P] Install shadcn/ui Toast component in src/components/ui/toast.tsx

### Analytics & Monitoring

- [ ] T045 Setup PostHog project and configure NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
- [ ] T046 Setup Sentry project and configure SENTRY_DSN
- [ ] T047 Create PostHog provider in src/lib/analytics/posthog.tsx
- [ ] T048 Create Sentry initialization in src/lib/monitoring/sentry.ts
- [ ] T049 Create analytics event tracking utilities from events.md in src/lib/analytics/events.ts

### Global Layout & Navigation

- [ ] T050 Create root layout with Clerk provider, PostHog, and global styles in src/app/layout.tsx
- [ ] T051 [P] Create dashboard layout with navigation in src/app/(dashboard)/layout.tsx
- [ ] T052 [P] Create public layout in src/app/(public)/layout.tsx
- [ ] T053 [P] Create header component with navigation in src/components/layouts/Header.tsx

### Validation Schemas

- [x] T054 Create Zod validation schemas from data-model.md in src/lib/utils/validation.ts (Child, BagItem, Claim, Campaign schemas)

### Utilities

- [x] T055 [P] Create utility functions in src/lib/utils/formatters.ts (price formatting, date formatting)
- [x] T056 [P] Create constants file in src/lib/utils/constants.ts (age bands, interests, values)
- [x] T057 [P] Create cn utility for Tailwind class merging in src/lib/utils/cn.ts

**Checkpoint**: Foundation complete - all user stories can now proceed in parallel

---

## Phase 3: User Story 1 - Create Child Profile and Find First Gift (Priority: P1) 🎯 MVP

**Goal**: Enable parents to create child profiles with nickname, age, and interests, and receive personalized gift recommendations

**Independent Test**: Create a child profile with nickname "Emma", age band "5-7", interests "Art & Crafts, Books", and immediately see at least 10 relevant gift recommendations within 3 seconds

### Data Layer for User Story 1

- [ ] T058 [P] [US1] Create User model operations in src/lib/db/users.ts (getUserByClerkId, createUser, updateUser)
- [ ] T059 [P] [US1] Create Child model operations in src/lib/db/children.ts (createChild, getChildren, getChildById, updateChild, deleteChild)
- [ ] T060 [P] [US1] Create Product model operations in src/lib/db/products.ts (getProducts, getProductById, searchProducts)
- [ ] T061 [P] [US1] Create ProductOffer model operations in src/lib/db/product-offers.ts (getOffersByProductId, getBestOfferForProduct)

### API Routes for User Story 1

- [ ] T062 [US1] Implement GET /api/children endpoint in src/app/api/children/route.ts (list all children for authenticated user)
- [ ] T063 [US1] Implement POST /api/children endpoint in src/app/api/children/route.ts (create child profile with validation)
- [ ] T064 [US1] Implement GET /api/children/[id] endpoint in src/app/api/children/[id]/route.ts (get child by ID)
- [ ] T065 [US1] Implement PATCH /api/children/[id] endpoint in src/app/api/children/[id]/route.ts (update child profile)
- [ ] T066 [US1] Implement DELETE /api/children/[id] endpoint in src/app/api/children/[id]/route.ts (soft delete child)
- [ ] T067 [US1] Implement POST /api/finder/search endpoint in src/app/api/finder/search/route.ts (gift search with ranking per FR-018)

### React Hooks for User Story 1

- [ ] T068 [P] [US1] Create useChildren hook in src/lib/hooks/useChildren.ts (TanStack Query hook for fetching children)
- [ ] T069 [P] [US1] Create useFinder hook in src/lib/hooks/useFinder.ts (TanStack Query hook for gift search)

### UI Components for User Story 1

- [ ] T070 [P] [US1] Create ChildProfileForm component in src/components/features/child-profile/ChildProfileForm.tsx (React Hook Form + Zod validation)
- [ ] T071 [P] [US1] Create ChildProfileCard component in src/components/features/child-profile/ChildProfileCard.tsx (displays child info with edit/delete actions)
- [ ] T072 [P] [US1] Create ChildProfileList component in src/components/features/child-profile/ChildProfileList.tsx (grid of child cards)
- [ ] T073 [P] [US1] Create ProductCard component in src/components/features/gift-finder/ProductCard.tsx (image, title, price, 3 "why it fits" bullets, add to bag button)
- [ ] T074 [P] [US1] Create ProductFilters component in src/components/features/gift-finder/ProductFilters.tsx (price bands, values, merchants, availability)
- [ ] T075 [P] [US1] Create ProductSort component in src/components/features/gift-finder/ProductSort.tsx (relevance, price, popularity, newest)
- [ ] T076 [US1] Create InfiniteProductGrid component in src/components/features/gift-finder/InfiniteProductGrid.tsx (infinite scroll with TanStack Query)
- [ ] T077 [US1] Create GiftFinderSearch component in src/components/features/gift-finder/GiftFinderSearch.tsx (search interface with filters and results)

### Pages for User Story 1

- [ ] T078 [US1] Create children list page at src/app/(dashboard)/children/page.tsx (displays ChildProfileList with "Add Child" button)
- [ ] T079 [US1] Create new child page at src/app/(dashboard)/children/new/page.tsx (ChildProfileForm for creation)
- [ ] T080 [US1] Create child detail page at src/app/(dashboard)/children/[id]/page.tsx (displays child info and quick link to bag/finder)
- [ ] T081 [US1] Create edit child page at src/app/(dashboard)/children/[id]/edit/page.tsx (ChildProfileForm for editing)
- [ ] T082 [US1] Create Gift Finder page at src/app/(dashboard)/finder/page.tsx (GiftFinderSearch component)
- [ ] T083 [US1] Create parent dashboard homepage at src/app/(dashboard)/dashboard/page.tsx (overview of all children and quick actions)

**Checkpoint**: User Story 1 complete - Parents can create child profiles and discover personalized gifts

---

## Phase 4: User Story 2 - Organize and Share Gift Bag (Priority: P1) 🎯 MVP

**Goal**: Enable parents to save gifts to child-specific bags and share them with relatives for claiming

**Independent Test**: Add 5 items to a child's bag, click "Share Bag", copy the link, open it in incognito browser, and successfully claim an item. Verify claim appears in both views within 5 seconds

### Data Layer for User Story 2

- [ ] T084 [P] [US2] Create Bag model operations in src/lib/db/bags.ts (getBagByChildId, getBagByShareToken, createBag, regenerateShareToken)
- [ ] T085 [P] [US2] Create BagItem model operations in src/lib/db/bag-items.ts (addBagItem, getBagItems, updateBagItem, deleteBagItem)
- [ ] T086 [P] [US2] Create Claim model operations in src/lib/db/claims.ts (createClaim, getClaimByBagItemId, deleteClaim)

### API Routes for User Story 2

- [ ] T087 [US2] Implement GET /api/bags/[childId] endpoint in src/app/api/bags/[childId]/route.ts (get bag with all items for authenticated parent)
- [ ] T088 [US2] Implement POST /api/bags/[bagId]/items endpoint in src/app/api/bags/[bagId]/items/route.ts (add item to bag)
- [ ] T089 [US2] Implement POST /api/bags/[bagId]/share endpoint in src/app/api/bags/[bagId]/share/route.ts (generate/regenerate share link)
- [ ] T090 [US2] Implement DELETE /api/bag-items/[itemId] endpoint in src/app/api/bag-items/[itemId]/route.ts (remove item from bag)
- [ ] T091 [US2] Implement PATCH /api/bag-items/[itemId] endpoint in src/app/api/bag-items/[itemId]/route.ts (update quantity, isSurprise flag)
- [ ] T092 [US2] Implement POST /api/bag-items/[itemId]/claim endpoint in src/app/api/bag-items/[itemId]/claim/route.ts (create claim with rate limiting per FR-035)
- [ ] T093 [US2] Implement DELETE /api/bag-items/[itemId]/claim endpoint in src/app/api/bag-items/[itemId]/claim/route.ts (unclaim within 24h)
- [ ] T094 [US2] Implement GET /api/shared/bags/[token] endpoint in src/app/api/shared/bags/[token]/route.ts (public bag view excluding surprises)

### React Hooks for User Story 2

- [ ] T095 [P] [US2] Create useBag hook in src/lib/hooks/useBag.ts (TanStack Query hook for bag operations with optimistic updates)
- [ ] T096 [P] [US2] Create useBagItems hook in src/lib/hooks/useBagItems.ts (TanStack Query hook for bag item operations)

### UI Components for User Story 2

- [ ] T097 [P] [US2] Create BagItemCard component in src/components/features/bag/BagItemCard.tsx (displays item with quantity, surprise toggle, remove button, claim status)
- [ ] T098 [P] [US2] Create BagItemList component in src/components/features/bag/BagItemList.tsx (list of bag items with total)
- [ ] T099 [P] [US2] Create ShareBagButton component in src/components/features/bag/ShareBagButton.tsx (generates share link and copies to clipboard)
- [ ] T100 [P] [US2] Create ClaimButton component in src/components/features/bag/ClaimButton.tsx (claim form with name/email, shows claimed status)

### Pages for User Story 2

- [ ] T101 [US2] Create child's bag page at src/app/(dashboard)/bags/[childId]/page.tsx (BagItemList, ShareBagButton, total spend display)
- [ ] T102 [US2] Create public shared bag page at src/app/(public)/shared/bag/[token]/page.tsx (public view with child info, non-surprise items, claim buttons)
- [ ] T103 [US2] Update ProductCard component to include "Add to Bag" action with child selector dropdown

### Real-Time Updates

- [ ] T104 [US2] Implement polling mechanism in useBag hook for real-time claim updates (5-second interval per FR-032)
- [ ] T105 [US2] Add optimistic UI updates for add/remove/claim operations

**Checkpoint**: User Story 2 complete - Parents can organize bags and relatives can claim items via shared links

---

## Phase 5: User Story 3 - Track Budget and Spending (Priority: P2)

**Goal**: Enable parents to set budgets per child and see visual spending progress

**Independent Test**: Set a $200 budget for a child, add items totaling $180, verify thermometer shows 90% used. Have a relative claim a $50 item and verify parent's view updates to show $130 remaining

### Data Layer for User Story 3

- [ ] T106 [US3] Add budget calculation utilities in src/lib/db/bags.ts (calculateTotalSpend, calculateRemainingBudget, getBudgetStatus)

### UI Components for User Story 3

- [ ] T107 [P] [US3] Create BudgetThermometer component in src/components/features/bag/BudgetThermometer.tsx (visual thermometer with green/yellow/red status per FR-026)
- [ ] T108 [US3] Update BagItemList component to display BudgetThermometer when budget is set

### Budget Display Integration

- [ ] T109 [US3] Update child bag page to show budget thermometer at top of bag
- [ ] T110 [US3] Update ChildProfileForm to include optional budget field (0-$1000 in $5 increments per FR-007)
- [ ] T111 [US3] Add budget status indicator to ChildProfileCard component

**Checkpoint**: User Story 3 complete - Parents can track spending against budget with visual indicators

---

## Phase 6: User Story 4 - Discover Trending Gifts (Priority: P2)

**Goal**: Enable parents to discover trending gifts by age band

**Independent Test**: Navigate to Trends page, filter by age band "5-7", and see top 10 trending items with badges (Rising, Back in Stock) loading in under 2 seconds

### Data Layer for User Story 4

- [ ] T112 [P] [US4] Create PopularitySignal model operations in src/lib/db/popularity-signals.ts (updateSignal, getSignalsByProduct, aggregateSignals)
- [ ] T113 [P] [US4] Create trend computation logic in src/lib/jobs/compute-trends.ts (calculates daily top 10 per age band per FR-038)
- [ ] T114 [US4] Create trend badge assignment logic per FR-039 (Rising ≥50% increase, Back in Stock, High Margin ≥12%, Best Value)

### API Routes for User Story 4

- [ ] T115 [US4] Implement GET /api/trends endpoint in src/app/api/trends/route.ts (returns top 10 by age band with badges, cached daily)

### Background Jobs for User Story 4

- [ ] T116 [US4] Create Vercel Cron job for daily trend computation at src/app/api/cron/compute-trends/route.ts (runs at 2:00 AM per FR-038)

### React Hooks for User Story 4

- [ ] T117 [US4] Create useTrends hook in src/lib/hooks/useTrends.ts (TanStack Query hook for trending products)

### UI Components for User Story 4

- [ ] T118 [P] [US4] Create TrendBadge component in src/components/features/trends/TrendBadge.tsx (displays Rising, Back in Stock, High Margin, Best Value badges)
- [ ] T119 [P] [US4] Create TrendCard component in src/components/features/trends/TrendCard.tsx (ProductCard variant with trend badges)
- [ ] T120 [US4] Create TrendSection component in src/components/features/trends/TrendSection.tsx (displays top 10 for an age band)

### Pages for User Story 4

- [ ] T121 [US4] Create Trend Radar page at src/app/(dashboard)/trends/page.tsx (TrendSection components with age band filter)

**Checkpoint**: User Story 4 complete - Parents can discover trending gifts filtered by age band

---

## Phase 7: User Story 5 - Receive Price Drop and Restock Alerts (Priority: P3)

**Goal**: Enable parents to receive email notifications when bag items drop in price or come back in stock

**Independent Test**: Enable alerts on a bag item, simulate a price drop in the system, verify email is sent within 15 minutes with correct price info and bag link

### Data Layer for User Story 5

- [ ] T122 [P] [US5] Create PriceHistory model operations in src/lib/db/price-history.ts (createSnapshot, getPriceHistory, getMinPriceForWindow)
- [ ] T123 [P] [US5] Create alert configuration in src/lib/db/bag-items.ts (enableAlerts, disableAlerts, getItemsWithAlertsEnabled)

### Background Jobs for User Story 5

- [ ] T124 [US5] Create hourly price monitoring job in src/lib/jobs/price-monitor.ts (checks all items with alerts enabled per FR-043)
- [ ] T125 [US5] Create Vercel Cron job for price monitoring at src/app/api/cron/monitor-prices/route.ts (runs hourly)
- [ ] T126 [US5] Create alert dispatcher logic in src/lib/jobs/alert-dispatcher.ts (triggers emails, enforces rate limits per FR-047, bundles alerts per FR-048)

### Email Templates for User Story 5

- [ ] T127 [P] [US5] Create price drop alert email template in src/lib/email/templates/PriceDropAlert.tsx (using React Email)
- [ ] T128 [P] [US5] Create restock alert email template in src/lib/email/templates/RestockAlert.tsx (using React Email)

### API Routes for User Story 5

- [ ] T129 [US5] Implement POST /api/bag-items/[itemId]/alerts endpoint in src/app/api/bag-items/[itemId]/alerts/route.ts (enable/disable alerts with threshold)
- [ ] T130 [US5] Implement GET /api/alerts/history endpoint in src/app/api/alerts/history/route.ts (get alert history for past 30 days per FR-051)
- [ ] T131 [US5] Implement GET /api/alerts/settings endpoint in src/app/api/alerts/settings/route.ts (get user's alert preferences including quiet hours)
- [ ] T132 [US5] Implement PATCH /api/alerts/settings endpoint in src/app/api/alerts/settings/route.ts (update alert preferences and quiet hours)

### React Hooks for User Story 5

- [ ] T133 [US5] Create useAlerts hook in src/lib/hooks/useAlerts.ts (TanStack Query hook for alert operations)

### UI Components for User Story 5

- [ ] T134 [P] [US5] Create AlertSettings component in src/components/features/alerts/AlertSettings.tsx (toggle alerts, set threshold, configure quiet hours)
- [ ] T135 [P] [US5] Create AlertCard component in src/components/features/alerts/AlertCard.tsx (displays alert history item)
- [ ] T136 [P] [US5] Create AlertHistoryList component in src/components/features/alerts/AlertHistoryList.tsx (list of past alerts)

### Pages for User Story 5

- [ ] T137 [US5] Create alerts history page at src/app/(dashboard)/alerts/page.tsx (AlertHistoryList and global AlertSettings)
- [ ] T138 [US5] Update BagItemCard to include AlertSettings toggle

**Checkpoint**: User Story 5 complete - Parents receive timely price and stock alerts via email

---

## Phase 8: User Story 6 - View Sponsored Gift Recommendations (Priority: P3)

**Goal**: Enable display of clearly labeled sponsored products in search results and sponsor campaign management

**Independent Test**: Perform a gift search, see exactly one sponsored product card with "Sponsored" badge, click it to verify disclosure message, confirm click is tracked for reporting

### Data Layer for User Story 6

- [ ] T139 [P] [US6] Create Sponsor model operations in src/lib/db/sponsors.ts (createSponsor, getSponsorById, updateSponsor)
- [ ] T140 [P] [US6] Create Campaign model operations in src/lib/db/campaigns.ts (createCampaign, getCampaigns, updateCampaign, getCampaignById, getActiveCampaigns)
- [ ] T141 [P] [US6] Create Creative model operations in src/lib/db/creatives.ts (createCreative, getCreativesByCampaign, updateCreativeStatus)
- [ ] T142 [P] [US6] Create SponsoredSlot model operations in src/lib/db/sponsored-slots.ts (assignCreativeToSlot, getSlotForContext)

### Sponsored Placement Logic

- [ ] T143 [US6] Create sponsored placement selector in src/lib/sponsored/selector.ts (selects creative based on targeting, enforces max 1 per page per FR-052, max 3 per session per FR-054)
- [ ] T144 [US6] Create impression and click tracking in src/lib/sponsored/tracking.ts (tracks impressions, viewable impressions ≥50% visible ≥1s, clicks per FR-055)

### API Routes for User Story 6

- [ ] T145 [US6] Implement GET /api/campaigns endpoint in src/app/api/campaigns/route.ts (list campaigns for authenticated sponsor, admin only)
- [ ] T146 [US6] Implement POST /api/campaigns endpoint in src/app/api/campaigns/route.ts (create campaign, admin only)
- [ ] T147 [US6] Implement GET /api/campaigns/[id] endpoint in src/app/api/campaigns/[id]/route.ts (get campaign details)
- [ ] T148 [US6] Implement PATCH /api/campaigns/[id] endpoint in src/app/api/campaigns/[id]/route.ts (update campaign, admin only)
- [ ] T149 [US6] Implement POST /api/campaigns/[id]/creatives endpoint in src/app/api/campaigns/[id]/creatives/route.ts (add creative to campaign)
- [ ] T150 [US6] Implement GET /api/campaigns/[id]/report endpoint in src/app/api/campaigns/[id]/report/route.ts (get campaign performance metrics per FR-060)

### React Hooks for User Story 6

- [ ] T151 [US6] Create useCampaigns hook in src/lib/hooks/useCampaigns.ts (TanStack Query hook for campaign operations)

### UI Components for User Story 6

- [ ] T152 [P] [US6] Create SponsoredCard component in src/components/features/sponsored/SponsoredCard.tsx (product card with "Sponsored" badge and FTC disclosure per FR-053)
- [ ] T153 [P] [US6] Create CampaignForm component in src/components/features/sponsored/CampaignForm.tsx (admin form for campaign creation with targeting, pricing, dates)
- [ ] T154 [P] [US6] Create SponsorDashboard component in src/components/features/sponsored/SponsorDashboard.tsx (displays impressions, clicks, CTR, spend per FR-060)

### Pages for User Story 6

- [ ] T155 [US6] Create sponsor advertise landing page at src/app/(public)/advertise/page.tsx (information for potential sponsors)
- [ ] T156 [US6] Create sponsor dashboard page at src/app/(dashboard)/sponsor/dashboard/page.tsx (admin only, SponsorDashboard component)
- [ ] T157 [US6] Update GiftFinderSearch component to inject sponsored cards per placement rules

### Auto-Moderation

- [ ] T158 [US6] Create creative moderation logic in src/lib/sponsored/moderation.ts (auto-reject broken URLs, incorrect image dimensions, prohibited content per FR-059)

**Checkpoint**: User Story 6 complete - Sponsored products are displayed with clear disclosure and sponsors can view performance

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Product Feed Ingestion (Post-MVP Background Job)

- [ ] T159 [P] Create merchant feed ingestion job in src/lib/jobs/feed-ingestion.ts (parses CSV/JSON/XML feeds, creates/updates Product and ProductOffer records)
- [ ] T160 [P] Create Vercel Cron job for daily feed ingestion at src/app/api/cron/ingest-feeds/route.ts

### Click Tracking & Analytics

- [ ] T161 [P] Create ClickEvent tracking on all product links (finder, trends, bag, sponsored) using affiliate router
- [ ] T162 [P] Implement PostHog event tracking for all events defined in events.md (Activation, Engagement, Performance, Revenue, Retention, UX Quality)

### Error Handling & Boundaries

- [ ] T163 [P] Create error boundary component in src/components/ErrorBoundary.tsx
- [ ] T164 [P] Add error boundaries to all major page components
- [ ] T165 [P] Standardize API error responses (400, 401, 403, 404, 429) across all endpoints

### Performance Optimizations

- [ ] T166 [P] Add Next.js Image component optimization for all product images
- [ ] T167 [P] Implement code splitting for heavy components (InfiniteProductGrid, BagItemList)
- [ ] T168 [P] Add React.lazy and Suspense for non-critical features (TrendRadar, SponsorDashboard)
- [ ] T169 [P] Configure Redis caching for hot queries (bags, trends, active campaigns)
- [ ] T170 [P] Add database indexes verification per data-model.md

### Accessibility (WCAG 2.1 Level AA)

- [ ] T171 [P] Add ARIA labels to all interactive components
- [ ] T172 [P] Ensure all form fields have associated labels and error messages per FR-083
- [ ] T173 [P] Verify keyboard navigation works for all features per FR-080
- [ ] T174 [P] Test color contrast ratios meet 4.5:1 minimum per FR-082
- [ ] T175 [P] Verify touch targets are minimum 44x44 pixels per FR-084

### Security Hardening

- [ ] T176 [P] Add CSRF protection to all state-changing API routes per FR-074
- [ ] T177 [P] Implement XSS sanitization for all user-generated content per FR-073
- [ ] T178 [P] Add rate limiting to all API endpoints (100 req/min authenticated, 20 req/min public per openapi.yaml)
- [ ] T179 [P] Verify HTTPS enforcement and TLS 1.3 in production per FR-071

### Documentation

- [ ] T180 [P] Create README.md with quickstart instructions in repository root
- [ ] T181 [P] Create COPPA compliance documentation in docs/compliance/coppa.md
- [ ] T182 [P] Create FTC affiliate disclosure documentation in docs/compliance/ftc.md

### Validation & Testing

- [ ] T183 Run through quickstart.md setup instructions to verify completeness
- [ ] T184 Validate all 6 user story independent test scenarios from spec.md
- [ ] T185 Run performance audit to verify LCP < 2.5s and TTI < 3.5s per FR-065, FR-066

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: No dependencies - can start immediately
- **Phase 2: Foundational**: Depends on Setup completion - BLOCKS all user stories (T001-T009 must complete before T010+)
- **Phase 3: User Story 1 (P1)**: Depends on Foundational phase completion (T010-T057 must complete before T058+)
- **Phase 4: User Story 2 (P1)**: Depends on Foundational phase completion + User Story 1 for ProductCard component
- **Phase 5: User Story 3 (P2)**: Depends on Foundational + User Story 2 (needs Bag and BagItem models)
- **Phase 6: User Story 4 (P2)**: Depends on Foundational + User Story 1 (needs Product models)
- **Phase 7: User Story 5 (P3)**: Depends on Foundational + User Story 2 (needs Bag and BagItem with alerts)
- **Phase 8: User Story 6 (P3)**: Depends on Foundational + User Story 1 (injects into GiftFinderSearch)
- **Phase 9: Polish**: Depends on all desired user stories being complete

### User Story Dependencies Graph

```
Setup (Phase 1)
    ↓
Foundational (Phase 2) ← BLOCKING for all user stories
    ↓
    ├─→ US1 (Phase 3) - Create Child Profile & Find Gifts ← MVP START
    │       ↓
    ├─→ US2 (Phase 4) - Organize & Share Gift Bag ← MVP COMPLETE (US1 + US2)
    │       ↓
    │   ├─→ US3 (Phase 5) - Track Budget (depends on US2)
    │   │
    │   └─→ US5 (Phase 7) - Price Alerts (depends on US2)
    │
    ├─→ US4 (Phase 6) - Trending Gifts (depends on US1)
    │
    └─→ US6 (Phase 8) - Sponsored Products (depends on US1)
```

### Within Each User Story

- Data layer (models) before API routes
- API routes before React hooks
- React hooks before UI components
- UI components before pages
- All [P] marked tasks within a story can run in parallel

### Parallel Opportunities

**Setup Phase (9 tasks in parallel)**:
- T002, T003, T004, T005, T007, T008, T009 can all run in parallel after T001

**Foundational Phase (parallelizable groups)**:
- Database: T010 → T011 → T012 → T013 (sequential)
- T014, T015 after T013 (parallel)
- Auth: T016 → T017 (sequential)
- T018, T019, T020, T021 after T017 (parallel)
- T022 after T019 (needs Clerk provider)
- Search: T023 → T024 (sequential)
- T025, T026 after T024 (parallel)
- Cache: T027 → T028 → T029 (sequential)
- Email: T030 → T031 → T032 (sequential)
- Affiliates: T033, T034, T035 (parallel)
- UI components: T036-T044 (all parallel)
- Analytics: T045, T046 (parallel)
- T047, T048, T049 after T045, T046 (parallel)
- Layouts: T050 → T051, T052, T053 (T050 first, then T051-T053 parallel)
- Utilities: T054, T055, T056, T057 (all parallel)

**User Story 1 (parallelizable groups)**:
- Data layer: T058, T059, T060, T061 (all parallel)
- API routes: T062-T063 (same file, sequential), T064-T066 (same file, sequential), T067 (parallel to others)
- Hooks: T068, T069 (parallel)
- Components: T070, T071, T072, T073, T074, T075 (all parallel)
- T076 depends on T073-T075
- T077 depends on T074, T075, T076
- Pages: T078-T083 (parallel after components done)

**User Story 2 (parallelizable groups)**:
- Data layer: T084, T085, T086 (all parallel)
- API routes: T087-T094 (can be parallel, different files)
- Hooks: T095, T096 (parallel)
- Components: T097, T098, T099, T100 (all parallel)
- Pages: T101, T102 (parallel)
- T103, T104, T105 (parallel)

**User Story 3 (parallelizable groups)**:
- T106 (sequential)
- T107 (parallel to T106)
- T108, T109, T110, T111 (parallel)

**User Story 4 (parallelizable groups)**:
- T112, T113, T114 (T113 and T114 can be parallel after T112)
- T115, T116 (parallel)
- T117 (after T115)
- T118, T119 (parallel)
- T120 (after T118, T119)
- T121 (after T120)

**User Story 5 (parallelizable groups)**:
- T122, T123 (parallel)
- T124, T125, T126 (sequential: T124 → T125, T126)
- T127, T128 (parallel)
- T129, T130, T131, T132 (parallel, different endpoints)
- T133 (after API routes)
- T134, T135, T136 (parallel)
- T137, T138 (parallel)

**User Story 6 (parallelizable groups)**:
- T139, T140, T141, T142 (all parallel)
- T143, T144 (parallel)
- T145-T150 (parallel, different endpoints)
- T151 (after API routes)
- T152, T153, T154 (parallel)
- T155, T156, T157 (parallel)
- T158 (parallel to pages)

**Polish Phase (mostly parallel)**:
- T159, T160 (parallel)
- T161, T162 (parallel)
- T163, T164, T165 (parallel)
- T166, T167, T168, T169, T170 (all parallel)
- T171, T172, T173, T174, T175 (all parallel)
- T176, T177, T178, T179 (all parallel)
- T180, T181, T182 (all parallel)
- T183, T184, T185 (sequential at end)

---

## Parallel Example: User Story 1 Data Layer

All model operations can be built in parallel since they operate on different files:

```bash
# Launch all data layer tasks for User Story 1 together:
Task T058: "Create User model operations in src/lib/db/users.ts"
Task T059: "Create Child model operations in src/lib/db/children.ts"
Task T060: "Create Product model operations in src/lib/db/products.ts"
Task T061: "Create ProductOffer model operations in src/lib/db/product-offers.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

This is the recommended path to ship the fastest viable product:

1. **Complete Phase 1: Setup** (T001-T009) - ~1-2 days
2. **Complete Phase 2: Foundational** (T010-T057) - ~3-5 days
3. **Complete Phase 3: User Story 1** (T058-T083) - ~4-6 days
4. **Complete Phase 4: User Story 2** (T084-T105) - ~3-4 days
5. **STOP and VALIDATE**: Test both user stories independently using spec.md test scenarios
6. **Deploy MVP**: User Stories 1 + 2 = Core value (find gifts + share bags)

**MVP Scope**: ~11-17 days, delivers core gift finding and sharing workflow

### Incremental Delivery (Full Feature Set)

After MVP, add remaining user stories incrementally:

1. **MVP (US1 + US2)** → Deploy/Demo
2. **Add User Story 3 (Budget Tracking)** (T106-T111) - ~1-2 days → Deploy/Demo
3. **Add User Story 4 (Trending Gifts)** (T112-T121) - ~2-3 days → Deploy/Demo
4. **Add User Story 5 (Price Alerts)** (T122-T138) - ~3-4 days → Deploy/Demo
5. **Add User Story 6 (Sponsored Products)** (T139-T158) - ~3-4 days → Deploy/Demo
6. **Complete Phase 9 (Polish)** (T159-T185) - ~2-3 days → Final Release

**Full Scope**: ~22-33 days total

### Parallel Team Strategy (4 Developers)

After Foundational phase completes:

- **Developer A**: User Story 1 (T058-T083)
- **Developer B**: User Story 2 (T084-T105) - starts after US1 ProductCard is done (T073)
- **Developer C**: User Story 4 (T112-T121) - starts after US1 Product models done (T060-T061)
- **Developer D**: User Story 6 (T139-T158) - starts after US1 GiftFinderSearch done (T077)

Then:
- **Developer A**: User Story 3 (T106-T111) - after US2 completes
- **Developer B**: User Story 5 (T122-T138) - after US2 completes
- **All**: Phase 9 Polish (T159-T185) - collaborate on cross-cutting concerns

**Parallel Timeline**: ~12-18 days with 4 developers

---

## Notes

- **[P]** tasks = different files, no dependencies within phase
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable using the test scenarios in spec.md
- Commit after each task or logical group (e.g., all data layer for a story)
- Stop at any checkpoint to validate story independently before proceeding
- All file paths follow the structure defined in plan.md
- **Tests are NOT included** as they were not explicitly requested in the feature specification
- Follow the constitution principles throughout implementation (component-first, type safety, security by default, performance, accessibility)
