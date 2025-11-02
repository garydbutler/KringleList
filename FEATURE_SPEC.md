# KringleList — SpecKit Feature Specification

**Version**: 1.0.0  
**Last Updated**: 2025-11-01  
**Product**: KringleList - Christmas & Birthday Gift Finder for Parents  
**Status**: MVP Development

---

## Executive Summary

KringleList is a focused MVP SaaS application that helps parents find and organize Christmas and birthday gifts for their children. The platform combines personalized gift recommendations with price/stock intelligence, shareable gift lists, and affiliate revenue generation through strategic partnerships with retailers.

**Key Differentiators:**
- Values-aware gift matching (STEM, screen-free, sensory-friendly, eco)
- Per-child "Christmas Bag" with relative collaboration
- Real-time price drop and restock alerts
- Transparent affiliate model with sponsored placements
- COPPA-compliant design (no child PII beyond nickname + age band)

---

## 1. Product Vision & Goals

### 1.1 Problem Statement
Parents are overwhelmed by endless product options and generic gift guides that lack personalization, price intelligence, and real-time stock information. Existing solutions don't support collaborative gift-giving with relatives or provide transparent affiliate recommendations.

### 1.2 Solution Overview
A fast, intelligent gift finder that creates personalized recommendations based on child age, interests, and family values. Parents can organize gifts in per-child "Christmas Bags," share with relatives for claiming, and receive price/stock alerts—all while generating affiliate revenue through tracked product recommendations.

### 1.3 Target Users

**Primary Users (Parents/Guardians)**
- Demographics: Parents with children ages 0-14+
- Pain points: Gift overwhelm, budget tracking, coordinating with relatives
- Goals: Find appropriate gifts quickly, stay within budget, avoid duplicates

**Secondary Users (Relatives)**
- Demographics: Extended family members (grandparents, aunts/uncles, friends)
- Pain points: Not knowing what to buy, duplicate gifts, missing out on items
- Goals: Claim gifts from shared lists, know exactly what to purchase

**Tertiary Users (Brand Partners/Sponsors)**
- Demographics: Toy brands, retailers, family-focused businesses
- Pain points: Reaching decision-making parents at the right moment
- Goals: Targeted visibility, measurable ROI, quality placements

### 1.4 Success Metrics (MVP - First 60 Days)

**Activation Metrics:**
- A1: ≥35% of new users add ≥1 child profile
- A2: ≥50% of users who view Gift Finder add ≥1 item to a bag

**Revenue Metrics:**
- R1: ≥18% of outbound product clicks are affiliate-tracked
- $: ≥$1.5k affiliate revenue in first 60 days
- First sponsor campaign booked by day 45

**Engagement Metrics:**
- Average bag items per child: ≥3
- Share-to-claim conversion: ≥25%
- Alert opt-in rate: ≥20%

### 1.5 MVP Non-Goals
- ❌ In-app checkout or payment processing
- ❌ Web scraping of restricted retailer sites
- ❌ Multi-country pricing and currency conversion
- ❌ iOS/Android native applications (PWA only)
- ❌ Social features (comments, likes, public profiles)
- ❌ Gift wrapping or delivery coordination

---

## 2. Feature Specifications

### 2.1 Child Profiles

**Description:** Parents create profiles for each child to enable personalized recommendations.

**User Stories:**
- As a parent, I want to add my child's basic info so I can get age-appropriate gift recommendations
- As a parent, I want to set a per-child budget so I can track spending
- As a parent, I want to select interests and values so recommendations match my child's personality and our family principles

**Fields & Validation:**

| Field | Type | Validation | Required |
|-------|------|------------|----------|
| nickname | string | 2-20 chars, alphanumeric + spaces | Yes |
| age_band | enum | 0-2, 3-4, 5-7, 8-10, 11-13, 14+ | Yes |
| interests | array | Max 8 selections from predefined list | Yes (≥1) |
| values | array | STEM, screen-free, sensory-friendly, eco, educational, creative, active, quiet | No |
| budget_cents | integer | 0-100000 (0-$1000), step: $5 | No |

**Interests List:**
- Art & Crafts, Building & Construction, Books & Reading, Music & Dance
- Sports & Outdoor, Science & Nature, Dolls & Pretend Play, Vehicles & Remote Control
- Puzzles & Games, Electronics & Coding, Fashion & Accessories, Animals & Pets

**UI Components:**
```typescript
// ChildProfileForm.tsx
interface ChildProfileFormData {
  nickname: string;
  ageBand: '0-2' | '3-4' | '5-7' | '8-10' | '11-13' | '14+';
  interests: string[];
  values: string[];
  budgetCents?: number;
}
```

**Security Requirements:**
- Stored under authenticated parent account only
- No PII beyond nickname and age band (COPPA-compliant)
- Cannot share child profiles publicly
- Soft delete only (retain for audit)

**API Endpoints:**
```typescript
POST   /api/children
GET    /api/children
GET    /api/children/:id
PATCH  /api/children/:id
DELETE /api/children/:id
```

**Acceptance Criteria:**
- [ ] Parent can create unlimited child profiles
- [ ] Form validates all required fields before submission
- [ ] Interest chips visually indicate selected/unselected states
- [ ] Budget input shows currency formatting in real-time
- [ ] Profile saves successfully with success toast
- [ ] Child list displays in order of creation
- [ ] Edit mode pre-populates all existing values
- [ ] Delete requires confirmation modal

---

### 2.2 Gift Finder

**Description:** Intelligent search and discovery engine that matches products to child profiles using multiple ranking factors.

**User Stories:**
- As a parent, I want to search for gifts by age and interests so I find appropriate items quickly
- As a parent, I want to filter by values and budget so I stay aligned with family principles
- As a parent, I want to see why each product is recommended so I can make informed decisions
- As a parent, I want to sort by price or popularity so I can find the best value

**Input Parameters:**

| Parameter | Type | Source | Required |
|-----------|------|--------|----------|
| age_band | enum | From child profile or manual select | Yes |
| interests | array | From child profile or manual select | Yes (≥1) |
| values | array | From child profile or manual select | No |
| budget_min | integer | User input or null | No |
| budget_max | integer | User input or null | No |
| merchant | array | Filter by specific retailers | No |
| availability | enum | all, in-stock, low-stock | No (default: in-stock) |

**Output (Product Card):**

```typescript
interface ProductCard {
  id: string;
  title: string;
  brand: string;
  imageUrl: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  availability: {
    inStock: boolean;
    merchantCount: number;
    lowestPriceMerchant: string;
  };
  whyItFits: [string, string, string]; // Exactly 3 bullets
  merchantBadges: Array<{
    name: string;
    logoUrl: string;
  }>;
  badges?: ('Rising' | 'Best Value' | 'Back in Stock' | 'High Margin')[];
  rating?: number;
  reviewCount?: number;
}
```

**Ranking Algorithm:**
```
Score = w1*AgeFit + w2*Availability + w3*Popularity + w4*Margin + w5*Freshness

Weights (tunable):
- AgeFit: 0.35 (rules-based age range + embedding similarity)
- Availability: 0.25 (in-stock preference, stable inventory)
- Popularity: 0.20 (clicks, add-to-bag, claims with time decay)
- Margin: 0.15 (commission rate × EPC)
- Freshness: 0.05 (recent velocity, trend signals)
```

**Explainability Strings (Why It Fits):**
- Age fit: "Perfect for 5-7 year olds" or "Grows with them through age 8"
- Values: "No batteries needed" or "Promotes STEM learning"
- Skills: "Develops fine motor skills" or "Encourages creative play"
- Engagement: "20-30 minute build time" or "Hours of open-ended play"

**Filters & Sorting:**

Filters:
- Price bands: <$15, $15-$30, $30-$50, $50-$100, >$100
- Values: STEM, Screen-free, Eco-friendly, Sensory-friendly, etc.
- Merchant: Checkbox list of available retailers
- Availability: In stock, Low stock, All
- Rating: ≥4 stars, ≥4.5 stars (if available)

Sort options:
- Relevance (default)
- Price: Low to High
- Price: High to Low
- Popularity
- Newest

**UI Components:**
```typescript
// GiftFinderResults.tsx
interface GiftFinderProps {
  initialFilters: FinderFilters;
  childId?: string; // If launched from child profile
}

// ProductCard.tsx
interface ProductCardProps {
  product: ProductCard;
  onAddToBag: (productOfferId: string) => void;
  onQuickView: (productId: string) => void;
  showComparison?: boolean;
}
```

**Performance Requirements:**
- Initial search results: <800ms
- Filter/sort updates: <200ms (client-side)
- Infinite scroll: Load next 20 items <300ms
- Product images: Lazy load, WebP format, max 50KB

**API Endpoints:**
```typescript
POST /api/finder/search
  Body: { age_band, interests[], values[], budget_min?, budget_max?, filters?, sort?, page? }
  Response: { results: ProductCard[], total: number, page: number, hasMore: boolean }

GET /api/products/:id
  Response: ProductDetail with full offers array
```

**Acceptance Criteria:**
- [ ] Search returns results in <800ms for typical query
- [ ] Product cards show all required fields
- [ ] "Why it fits" bullets are contextual and accurate
- [ ] Filters update results without page refresh
- [ ] Sorting maintains filter state
- [ ] Infinite scroll loads seamlessly
- [ ] Empty state shows helpful suggestions
- [ ] Product images have proper alt text
- [ ] Add to Bag button disabled for out-of-stock items
- [ ] Quick View modal shows full product details

---

### 2.3 Christmas Bag (per child)

**Description:** Per-child gift list where parents organize selected items, track budget, and share with relatives for collaborative gift-giving.

**User Stories:**
- As a parent, I want to add products to my child's bag so I can organize gift options
- As a parent, I want to mark items as "surprises" so they're hidden when I share the list
- As a parent, I want to see my spend vs budget so I stay on track
- As a parent, I want to share a link with relatives so they can claim items to purchase
- As a relative, I want to claim an item so others know I'm buying it
- As a parent, I want to see what's been claimed so I know what's covered

**Core Functions:**

| Function | Description | User Type |
|----------|-------------|-----------|
| Add item | Add product offer to bag | Parent |
| Remove item | Remove from bag | Parent |
| Mark surprise | Hide from shared view | Parent |
| Set backup | Add alternative if claimed item unavailable | Parent |
| Track budget | Real-time spend vs budget thermometer | Parent |
| Share bag | Generate tokenized private link | Parent |
| Claim item | Mark item as "I'll buy this" | Relative |
| Unclaim | Release claimed item | Relative |
| View claims | See claim status in real-time | Both |

**Data Model:**
```typescript
interface Bag {
  id: string;
  childId: string;
  shareToken: string; // UUID for public sharing
  totalBudgetCents: number;
  items: BagItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface BagItem {
  id: string;
  bagId: string;
  productOfferId: string;
  quantity: number;
  isSurprise: boolean;
  backupOfferIds: string[];
  alertEnabled: boolean;
  claim?: Claim;
  createdAt: Date;
}

interface Claim {
  id: string;
  bagItemId: string;
  claimerName: string;
  claimerEmail?: string;
  status: 'claimed' | 'purchased';
  claimedAt: Date;
  purchasedAt?: Date;
}
```

**Bag UI Components:**

```typescript
// ChristmasBag.tsx - Parent view
interface ChristmasBagProps {
  childId: string;
  bag: Bag;
  onItemUpdate: (itemId: string, updates: Partial<BagItem>) => void;
  onShare: () => void;
}

// Budget thermometer shows:
// - Total budget (if set)
// - Current spend (sum of unclaimed + claimed items)
// - Remaining budget
// - Visual indicator: green (<75%), yellow (75-95%), red (>95%)

// SharedBagView.tsx - Relative view (no auth required)
interface SharedBagViewProps {
  shareToken: string;
  isPublic: boolean;
}
```

**Sharing & Claims:**

Share flow:
1. Parent clicks "Share Bag" button
2. System generates unique share token (if not exists)
3. Modal displays shareable link: `https://kringlelist.com/shared/bag/{token}`
4. Parent can copy link or send via email/SMS
5. Optional: Add personal message to relatives

Claim flow (relative):
1. Relative opens shared link (no login required)
2. Sees child's nickname, age, and gift items (minus surprises)
3. Items show: image, title, price, merchant badges, claim status
4. Clicks "Claim" button on desired item
5. Modal prompts for name (required) and email (optional for updates)
6. Upon claim: Item marked "Claimed by [Name]" with unclaim option
7. Claimed item shows affiliate link(s) to purchase

**Security & Privacy:**
- Share tokens are UUIDs, unguessable
- Surprise items filtered from shared view
- No authentication required for viewing/claiming
- Rate limiting on claim actions (max 10/hour per IP)
- Tokens can be regenerated by parent (invalidates old link)

**API Endpoints:**
```typescript
// Parent endpoints (authenticated)
GET    /api/bags/:childId
POST   /api/bags/:bagId/items
PATCH  /api/bag-items/:id
DELETE /api/bag-items/:id
POST   /api/bags/:bagId/share

// Public endpoints (tokenized)
GET    /api/shared/bags/:token
POST   /api/bag-items/:id/claim
  Body: { claimerName: string, claimerEmail?: string }
DELETE /api/claims/:id/unclaim
```

**Real-time Updates:**
- Use WebSockets or polling (every 5s) for claim status
- Parent dashboard shows live claim activity
- Optional: Email notification when item is claimed

**Acceptance Criteria:**
- [ ] Parent can add/remove items from bag instantly
- [ ] Budget thermometer updates in real-time
- [ ] Surprise toggle hides items from shared view
- [ ] Share link generates and copies to clipboard
- [ ] Relative can view shared bag without account
- [ ] Claim button works and updates status immediately
- [ ] Claimed items show claimer name
- [ ] Relative can unclaim within 24 hours
- [ ] Parent sees all claims in dashboard
- [ ] Backup alternatives display when primary is claimed

---

### 2.4 Trend Radar

**Description:** Curated daily feed of trending gifts by age band and interest, helping parents discover popular and emerging products.

**User Stories:**
- As a parent, I want to see what's trending for my child's age so I can discover popular gifts
- As a parent, I want to see "rising" items so I can get ahead of stockouts
- As a parent, I want to filter trends by interests so I see relevant items

**Trend Types & Badges:**

| Badge | Criteria | Display |
|-------|----------|---------|
| Rising | ≥50% increase in clicks/adds in last 3 days | 🔥 Rising |
| Back in Stock | Was OOS for ≥3 days, now available | ✅ Back in Stock |
| High Margin | Commission rate ≥12% or EPC ≥$2 | 💰 High Margin |
| Best Value | Price < median for category + ≥4.3 rating | ⭐ Best Value |
| Top 10 | #1-10 in age band or interest cluster | 🏆 Top 10 |

**Trend Calculation:**
```
Trend Score = (w1 * Recent Velocity) + (w2 * Stock Stability) + (w3 * Margin) + (w4 * External Signals)

Recent Velocity = (Last 3 days activity) / (Prior 7 days activity)
Stock Stability = 1.0 if continuously in stock, 0.5 if intermittent, 0.0 if OOS
Margin = Commission % / 15 (normalized)
External Signals = Bestseller rank bonus (if available)
```

**UI Layout:**
```typescript
interface TrendRadar {
  sections: Array<{
    title: string; // "Top 10 for Ages 5-7" or "Rising in STEM"
    filters: { ageBand?: string, interest?: string };
    items: ProductCard[];
  }>;
}

// Daily Top N per age band (N = 10)
// Daily Top N per interest cluster (N = 8)
// Total: ~100 products refreshed daily
```

**Compute Schedule:**
- Full trend refresh: Daily at 02:00 local time
- Incremental updates: Every 6 hours for velocity changes
- Badge assignment: Real-time as conditions met

**API Endpoints:**
```typescript
GET /api/trends
  Query: { age_band?, interest?, badge_type? }
  Response: { sections: TrendSection[] }

GET /api/trends/history/:productId
  Response: { dates[], scores[], ranks[] }
```

**Performance:**
- Pre-compute and cache trend results
- Edge cache with 6-hour TTL
- Lazy load images in trend cards

**Acceptance Criteria:**
- [ ] Trends page loads in <1.5s
- [ ] Shows daily top 10 for each age band
- [ ] Displays appropriate badges on cards
- [ ] Filter by age band or interest updates view
- [ ] "Rising" items have visible velocity indicator
- [ ] Clicking card goes to product detail
- [ ] Shares are tracked separately from organic

---

### 2.5 Price & Stock Alerts

**Description:** Automated monitoring system that notifies users of price drops and restocks on items in their bags.

**User Stories:**
- As a parent, I want to be notified when a price drops so I can save money
- As a parent, I want to know when an out-of-stock item is restocked so I don't miss it
- As a relative, I want alerts on claimed items so I know the best time to buy

**Alert Types:**

| Alert Type | Trigger Condition | Message Template |
|------------|-------------------|------------------|
| Price Drop | Current ≤ (min_14day - threshold%) OR absolute drop ≥ $X | "[Product] dropped to $XX.XX (was $YY.YY) - save ZZ%" |
| Restock | in_stock: false → true | "[Product] is back in stock at [Merchant]!" |
| Low Stock | Inventory < threshold (if available) | "[Product] low stock alert - only a few left" |
| Sale End Soon | Sale price expires within 48h (if available) | "[Product] sale ends soon - grab it now!" |

**Alert Configuration:**

```typescript
interface AlertSettings {
  bagItemId: string;
  enabled: boolean;
  priceDropThreshold: number; // Percentage (default: 10%)
  absoluteDropThreshold: number; // Dollars (default: $5)
  restockEnabled: boolean; // Default: true
  channels: {
    email: boolean; // Default: true
    webPush: boolean; // Default: false (requires opt-in)
  };
  quietHours?: {
    start: string; // HH:mm format (e.g., "22:00")
    end: string;   // HH:mm format (e.g., "08:00")
  };
}
```

**Monitoring Pipeline:**

1. **Price/Stock Monitor Job** (runs hourly for top 5k offers, 4-6h for long tail)
   - Fetch latest price/stock from merchant feeds
   - Compare to price_history table
   - Identify trigger conditions
   - Queue alert jobs with rate limiting

2. **Alert Dispatcher** (runs every 15 minutes)
   - Process queued alerts
   - Check rate limits (max 1 alert per item per 24h)
   - Bundle multiple alerts into digest when possible
   - Send via configured channels

3. **Price History Storage**
   - Store daily snapshots in price_history table
   - Retain 90 days for trend analysis
   - Index on (product_offer_id, ts DESC)

**Rate Limiting:**
- Per item per user: Max 1 alert per 24 hours
- Per user total: Max 10 alerts per day
- Bundle multiple drops into single digest if within 4-hour window
- Respect quiet hours (configurable, default: 10pm-8am)

**Email Template:**
```
Subject: 🎁 Price Drop Alert: [Product Title]

Hi [Parent Name],

Good news! The price dropped on an item in [Child Name]'s Christmas Bag:

[Product Image]
[Product Title]
Was: $XX.XX
Now: $YY.YY (save ZZ%)

Available at: [Merchant 1], [Merchant 2]

[View in Bag] [Buy Now]

This price is tracked across [N] retailers. Act fast - deals like this don't last long!

---
You're receiving this because you enabled alerts on this item.
[Manage alert settings]
```

**Web Push Notification:**
```json
{
  "title": "🎁 Price Drop Alert",
  "body": "[Product] dropped to $XX.XX - save ZZ%!",
  "icon": "[product_image_url]",
  "badge": "/badge-icon.png",
  "data": {
    "url": "/bags/[childId]?highlight=[itemId]",
    "bagItemId": "[id]"
  }
}
```

**API Endpoints:**
```typescript
POST   /api/bag-items/:id/alerts
  Body: { enabled: boolean, priceDropThreshold?: number }
  
GET    /api/alerts/history
  Response: { alerts: Alert[], unread: number }
  
PATCH  /api/alerts/:id/read

GET    /api/alerts/settings
PATCH  /api/alerts/settings
  Body: { quietHours?, channels?, globalThreshold? }
```

**Acceptance Criteria:**
- [ ] User can toggle alerts on/off per bag item
- [ ] Price drop alerts trigger correctly based on threshold
- [ ] Restock alerts trigger when item becomes available
- [ ] Email alerts use branded template
- [ ] Web push requires explicit opt-in
- [ ] Rate limiting prevents spam
- [ ] Quiet hours are respected
- [ ] Alert history page shows past 30 days
- [ ] Unread count displays in header
- [ ] Settings page allows customization

---

### 2.6 Sponsored Placements

**Description:** Advertising inventory system allowing brands and retailers to purchase premium placement for their products with clear FTC-compliant labeling.

**User Stories:**
- As a brand partner, I want to feature my product on relevant pages so I reach my target audience
- As a parent, I want to see clearly labeled sponsored content so I know it's paid placement
- As an admin, I want to set up campaigns with targeting rules so sponsors get value
- As a sponsor, I want to see performance metrics so I can measure ROI

**Inventory Types:**

| Placement | Location | Format | Pricing Model |
|-----------|----------|--------|---------------|
| Featured Gift | Homepage, Category pages | Single product card | Flat weekly or CPC |
| Category Takeover | Category page header | 3 cards + banner | Flat weekly |
| Newsletter Blurb | Email digest | Text + image + link | Flat per send |
| Search Boost | Search results | Injected ranking boost | CPC |
| Sidebar Banner | Finder, Trend pages | 300x250 display | Flat weekly |

**Targeting Options:**

```typescript
interface CampaignTargeting {
  ageBands?: ('0-2' | '3-4' | '5-7' | '8-10' | '11-13' | '14+')[];
  interests?: string[]; // From master interest list
  values?: string[]; // STEM, eco, screen-free, etc.
  priceBands?: ('under-15' | '15-30' | '30-50' | '50-100' | 'over-100')[];
  geoTargets?: string[]; // Country/state codes (MVP: US only)
  deviceTypes?: ('mobile' | 'tablet' | 'desktop')[];
  dayParts?: Array<{ start: string, end: string }>; // Hour ranges
}
```

**Labeling Requirements (FTC Compliance):**

```typescript
// Every sponsored placement MUST include:
interface SponsoredLabel {
  badge: 'Sponsored' | 'Ad' | 'Paid Partnership'; // Visible text
  disclosure: string; // Full disclosure in hover/modal
  merchantLogo: string; // Sponsor's logo
  ctaText: string; // "Learn More", "Shop Now", etc.
}

// Example disclosure:
"This product placement is paid for by [Brand Name]. We earn a commission 
when you purchase through our links. All sponsored content is clearly labeled."
```

**Campaign Data Model:**

```typescript
interface Campaign {
  id: string;
  sponsorId: string;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  targeting: CampaignTargeting;
  pricingModel: 'flat' | 'cpc' | 'hybrid';
  flatFeeCents?: number; // For flat/hybrid
  cpcCents?: number; // For CPC/hybrid
  dailyBudgetCents?: number;
  totalBudgetCents?: number;
  creatives: Creative[];
  performance: CampaignPerformance;
}

interface Creative {
  id: string;
  campaignId: string;
  title: string;
  description?: string;
  bullets?: [string, string, string];
  imageUrl: string; // Must pass moderation
  clickUrl: string; // Sponsor's landing page
  retailerList?: string[]; // Where product is available
  couponCode?: string;
  status: 'pending_review' | 'approved' | 'rejected';
}

interface CampaignPerformance {
  impressions: number;
  viewableImpressions: number; // At least 50% visible for 1s
  clicks: number;
  ctr: number;
  epc: number; // Earnings per click (if affiliate)
  spend: number;
  conversions?: number; // If tracked
}
```

**Frequency Capping:**
- Max 1 sponsored card per search results page
- Max 1 featured placement per page view
- User-level: Max 3 sponsored impressions per session
- Item-level: Max 1 impression per user per 24h

**Ad Serving Logic:**

```typescript
function selectSponsoredPlacement(
  slot: SponsoredSlot,
  userContext: UserContext
): Creative | null {
  // 1. Filter campaigns by:
  //    - Active status
  //    - Date range
  //    - Budget remaining
  //    - Targeting match
  
  // 2. Rank by:
  //    - Bid amount (CPC or effective CPM)
  //    - Historical CTR (quality score)
  //    - Recency (favor newer campaigns)
  
  // 3. Apply frequency caps
  
  // 4. Return top creative or null
}
```

**Measurement & Reporting:**

```typescript
interface CampaignReport {
  campaignId: string;
  dateRange: { start: Date, end: Date };
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    epc?: number;
  };
  breakdown: {
    byAgeBand: Map<string, Metrics>;
    byInterest: Map<string, Metrics>;
    byDevice: Map<string, Metrics>;
    byDayOfWeek: Map<string, Metrics>;
  };
  topPerformingCreatives: Array<{
    creativeId: string;
    impressions: number;
    ctr: number;
  }>;
}
```

**Self-Serve Sponsor Flow:**

1. **Landing Page** (`/advertise`)
   - Overview of inventory types
   - Pricing calculator
   - Case studies / testimonials
   - "Get Started" CTA

2. **Campaign Setup** (authenticated)
   - Select inventory type(s)
   - Choose date range (calendar picker)
   - Set targeting options
   - Enter budget and bid

3. **Creative Upload**
   - Upload image (1200x630, <500KB)
   - Enter headline (max 60 chars)
   - Enter bullets (3x max 80 chars each)
   - Enter destination URL
   - Preview across placements

4. **Review & Checkout**
   - Campaign summary
   - Estimated reach and impressions
   - Stripe payment (flat fee) or setup CPC billing
   - Terms acceptance (FTC compliance)

5. **Moderation**
   - Automated checks (image quality, inappropriate content)
   - Manual review within 24 hours
   - Approval or rejection with feedback

6. **Go Live**
   - Email confirmation when approved
   - Campaign dashboard access
   - Real-time performance tracking

**Admin Controls:**

```typescript
// Admin panel features:
- Campaign approval/rejection queue
- Manual creative moderation
- Placement slot management
- Pricing model overrides
- Make-good credits for underdelivery
- Fraud detection (click quality)
- Budget pacing controls
```

**API Endpoints:**

```typescript
// Public (for ad serving)
GET /api/sponsored/placement
  Query: { slotType, userContext, page }
  Response: { creative: Creative | null, trackingId: string }

// Sponsor-facing
POST   /api/campaigns
GET    /api/campaigns
GET    /api/campaigns/:id
PATCH  /api/campaigns/:id
POST   /api/campaigns/:id/creatives
GET    /api/campaigns/:id/report
POST   /api/checkout/campaign

// Admin
GET    /api/admin/campaigns/pending
PATCH  /api/admin/campaigns/:id/moderate
GET    /api/admin/slots
PATCH  /api/admin/slots/:id
```

**Acceptance Criteria:**
- [ ] Sponsored cards display "Sponsored" badge prominently
- [ ] All placements meet FTC disclosure requirements
- [ ] Sponsor can create campaign without admin help
- [ ] Creative moderation queue processes within 24h
- [ ] Frequency caps prevent user fatigue
- [ ] Campaign dashboard shows real-time metrics
- [ ] Stripe checkout works for flat fee campaigns
- [ ] CPC campaigns track clicks accurately
- [ ] Admin can pause/resume campaigns
- [ ] Performance reports export to CSV

---

### 2.7 Admin & Operations Dashboard

**Description:** Internal tools for managing feed ingestion, campaign moderation, user support, and system health monitoring.

**User Stories:**
- As an admin, I want to monitor feed ingestion so I can catch errors quickly
- As an admin, I want to moderate sponsored content so we maintain quality
- As an admin, I want to view user activity so I can identify issues
- As an ops team member, I want to see system health metrics so I can prevent downtime

**Admin Sections:**

#### 2.7.1 Feed Ingestion Dashboard

```typescript
interface FeedMonitor {
  merchants: Array<{
    id: string;
    name: string;
    status: 'healthy' | 'warning' | 'error' | 'stale';
    lastSuccessfulIngest: Date;
    lastAttempt: Date;
    stats: {
      totalProducts: number;
      activeOffers: number;
      inStockCount: number;
      avgPrice: number;
    };
    errors?: Array<{
      timestamp: Date;
      errorType: string;
      message: string;
    }>;
    sla: {
      expectedFrequency: string; // "daily", "hourly"
      maxStaleness: number; // Hours
      currentStaleness: number;
    };
  }>;
}
```

**Features:**
- Real-time ingestion status per merchant
- Alert on staleness (>24h since last update)
- Error log viewer with filtering
- Manual re-trigger for failed imports
- Sample validation (random 10 products per feed)
- Dedupe statistics (GTIN matches, fuzzy matches)
- Performance metrics (rows/second, total duration)

**UI Components:**
```typescript
// FeedHealthTable.tsx
// - Status indicator (green/yellow/red)
// - Last update timestamp
// - Product count trend (sparkline)
// - Error count badge
// - Actions: View logs, Retry, Disable
```

#### 2.7.2 Campaign Moderation Queue

```typescript
interface ModerationQueue {
  pending: Campaign[];
  filters: {
    status: 'pending_review' | 'flagged' | 'all';
    priority: 'high' | 'normal' | 'low';
    startDateRange?: [Date, Date];
  };
  actions: {
    approve: (campaignId: string) => void;
    reject: (campaignId: string, reason: string) => void;
    requestChanges: (campaignId: string, feedback: string) => void;
    escalate: (campaignId: string) => void;
  };
}
```

**Moderation Checklist:**
- [ ] Image quality: Clear, high-res, no pixelation
- [ ] Content policy: No weapons, alcohol, gambling, adult content
- [ ] FTC compliance: Accurate claims, no misleading info
- [ ] Brand guidelines: Logo usage correct, proper trademarks
- [ ] Landing page: Valid URL, loads quickly, matches creative
- [ ] Targeting: Appropriate for selected age bands
- [ ] Pricing: Matches merchant pricing (if flat fee)

**Auto-rejection Triggers:**
- Image dimensions incorrect (<1200x630)
- Broken landing page URL (404, timeout)
- Prohibited content detected (ML model)
- COPPA violations (child images without consent)

#### 2.7.3 User Support Tools

```typescript
interface UserSupportPanel {
  search: {
    byEmail: (email: string) => User;
    byBagToken: (token: string) => Bag;
    byOrderId: (orderId: string) => Order;
  };
  actions: {
    viewUserActivity: (userId: string) => Activity[];
    resetPassword: (userId: string) => void;
    mergeAccounts: (sourceId: string, targetId: string) => void;
    deleteAccount: (userId: string, reason: string) => void;
    issueRefund: (orderId: string, amount: number) => void;
  };
  userProfile: {
    metadata: UserMetadata;
    children: Child[];
    bags: Bag[];
    clickHistory: ClickEvent[];
    alerts: AlertSettings[];
    supportTickets: Ticket[];
  };
}
```

**Common Support Scenarios:**
- User can't share bag → Check token generation, provide direct link
- Price alert not received → Check alert settings, email deliverability
- Claimed item not showing → Verify claim in DB, check cache
- Affiliate link not working → Test redirect, verify merchant status
- Delete account request → Queue for processing, confirm deletion

#### 2.7.4 System Health Dashboard

**Key Metrics:**

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (p95) | <200ms | >500ms |
| Error Rate | <0.1% | >0.5% |
| Database Connections | <70% max | >85% |
| Redis Hit Rate | >90% | <80% |
| Job Queue Depth | <100 | >500 |
| Feed Staleness | <24h | >36h |
| CDN Cache Hit Rate | >95% | <90% |
| Uptime | 99.9% | <99.5% |

**Monitoring Integration:**
- Datadog for infrastructure metrics
- PostHog for user analytics
- Sentry for error tracking
- CloudWatch for AWS services
- Custom dashboard aggregating all sources

**Alert Channels:**
- Slack: #alerts-production
- PagerDuty: Critical issues (24/7)
- Email: Non-urgent summaries (daily digest)

**API Endpoints:**

```typescript
// Admin routes (requires admin role)
GET    /api/admin/feeds
POST   /api/admin/feeds/:merchantId/retry
GET    /api/admin/feeds/:merchantId/logs

GET    /api/admin/campaigns/moderate
PATCH  /api/admin/campaigns/:id/status
GET    /api/admin/campaigns/:id/audit-log

GET    /api/admin/users/search
GET    /api/admin/users/:id
POST   /api/admin/users/:id/actions

GET    /api/admin/health
GET    /api/admin/metrics
```

**Access Control:**
- Admin role required for all endpoints
- Audit log for all admin actions
- IP whitelist for production access
- MFA required for sensitive operations

**Acceptance Criteria:**
- [ ] Feed dashboard updates in real-time
- [ ] Admins receive alerts for stale feeds within 15 min
- [ ] Moderation queue loads <1s with 100+ items
- [ ] Approve/reject actions complete instantly
- [ ] User search returns results <500ms
- [ ] User activity loads with pagination
- [ ] Health metrics dashboard refreshes every 30s
- [ ] Critical alerts trigger PagerDuty immediately
- [ ] All admin actions are audit-logged

---

## 3. Technical Architecture

### 3.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App (React)                                             │
│  - Server Components (data fetching)                             │
│  - Client Components (interactivity)                             │
│  - Server Actions (mutations)                                    │
│  - PWA (offline support)                                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Backend API (Node.js + TypeScript)                              │
│  - REST or tRPC endpoints                                        │
│  - Clerk authentication middleware                               │
│  - Rate limiting & validation                                    │
│  - Click router (affiliate tracking)                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA & SERVICES LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  Postgres   │  │  Redis       │  │  Meilisearch/ES     │   │
│  │  (Primary)  │  │  (Cache)     │  │  (Product Search)   │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Background Workers (BullMQ)                 │   │
│  │  - Feed ingestion (daily/hourly)                         │   │
│  │  - Price/stock monitoring (hourly)                       │   │
│  │  - Alert dispatcher (every 15 min)                       │   │
│  │  - Trend computation (every 6h)                          │   │
│  │  - Analytics aggregation (hourly)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
├─────────────────────────────────────────────────────────────────┤
│  - Affiliate Networks (Amazon, Walmart, Target, Impact, CJ)      │
│  - Email Provider (Postmark/SendGrid)                            │
│  - Push Notifications (OneSignal/Web Push)                       │
│  - Payment Processing (Stripe)                                   │
│  - Analytics (PostHog, GA4)                                      │
│  - Error Tracking (Sentry)                                       │
│  - Monitoring (Datadog/CloudWatch)                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack (Aligned with Constitution)

**Frontend:**
- Framework: Next.js 14+ (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- State: React Context + TanStack Query
- Forms: React Hook Form + Zod validation
- PWA: next-pwa for offline support

**Backend:**
- Runtime: Node.js 20+
- Framework: NestJS (or Express + tRPC)
- Language: TypeScript
- API: REST or tRPC for type safety

**Database & Storage:**
- Primary: PostgreSQL (Supabase or AWS RDS)
- Cache: Redis (Upstash or ElastiCache)
- Search: Meilisearch (or Elasticsearch)
- Object Storage: Vercel Blob (or AWS S3)
- Queue: BullMQ with Redis

**Authentication:**
- Provider: Clerk
- Features: Email/password, magic links, social (Google, Facebook)
- Session management: Clerk SDK
- Organization support: Multi-tenant architecture

**Deployment:**
- Platform: Vercel
- Environments: Development, Staging, Production
- CI/CD: GitHub Actions + Vercel Git integration
- Edge: Vercel Edge Functions for click routing

**Third-Party Services:**
- Email: Postmark (transactional) or SendGrid
- Push: OneSignal or native Web Push API
- Payments: Stripe (sponsors)
- Analytics: PostHog (events) + GA4 (pages)
- Monitoring: Sentry (errors) + Datadog (infra)

### 3.3 Data Flow Examples

**Example 1: Add Item to Bag**
```
1. User clicks "Add to Bag" on product card
2. Client: onClick → calls server action or API endpoint
3. Server: Validate auth (Clerk middleware)
4. Server: Check bag exists for child, create if not
5. Server: Insert bag_item row (product_offer_id, bag_id)
6. Server: Invalidate cache for bag
7. Server: Track event (add_to_bag) in analytics
8. Server: Return updated bag
9. Client: TanStack Query updates cache
10. UI: Toast confirmation + bag count increments
```

**Example 2: Price Drop Alert**
```
1. Cron job triggers price monitor (hourly)
2. Worker: Fetch latest prices for active offers
3. Worker: Compare to price_history (last 14 days)
4. Worker: Identify drops meeting threshold
5. Worker: Query bag_items with alert_enabled=true
6. Worker: Check rate limits (last_alert_sent_at)
7. Worker: Queue alert job in BullMQ
8. Alert dispatcher: Process queue every 15 min
9. Dispatcher: Generate email from template
10. Dispatcher: Send via Postmark
11. Dispatcher: Update last_alert_sent_at
12. Dispatcher: Track event (price_alert_sent)
```

**Example 3: Sponsored Placement**
```
1. User views Gift Finder page
2. Server component: Fetch products from search API
3. Server: Call selectSponsoredPlacement(slot, userContext)
4. Ad server: Filter campaigns by targeting + budget
5. Ad server: Rank by bid × CTR
6. Ad server: Apply frequency cap (check recent impressions)
7. Ad server: Return winning creative or null
8. Server: Inject creative into results (position 4)
9. Server: Track impression (sponsored_impression event)
10. Client: Render with "Sponsored" badge
11. User clicks: Track click → redirect via click router
12. Click router: Add affiliate params + log event
13. Redirect to sponsor's landing page
```

---

## 4. Database Schema (MVP)

```sql
-- Users (managed by Clerk, minimal local data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Children
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  age_band VARCHAR(10) NOT NULL CHECK (age_band IN ('0-2','3-4','5-7','8-10','11-13','14+')),
  interests JSONB NOT NULL DEFAULT '[]', -- Array of interest strings
  values JSONB NOT NULL DEFAULT '[]', -- Array of value strings
  budget_cents INT CHECK (budget_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_children_user_id ON children(user_id);

-- Bags
CREATE TABLE bags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  share_token VARCHAR(36) UNIQUE NOT NULL, -- UUID
  total_budget_cents INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_bags_child_id ON bags(child_id);
CREATE INDEX idx_bags_share_token ON bags(share_token);

-- Bag Items
CREATE TABLE bag_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id UUID NOT NULL REFERENCES bags(id) ON DELETE CASCADE,
  product_offer_id UUID NOT NULL REFERENCES product_offers(id),
  quantity INT DEFAULT 1 CHECK (quantity > 0),
  is_surprise BOOLEAN DEFAULT FALSE,
  backup_offer_ids JSONB DEFAULT '[]', -- Array of product_offer_id UUIDs
  alert_enabled BOOLEAN DEFAULT FALSE,
  last_alert_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bag_items_bag_id ON bag_items(bag_id);
CREATE INDEX idx_bag_items_offer_id ON bag_items(product_offer_id);
CREATE INDEX idx_bag_items_alert_enabled ON bag_items(alert_enabled) WHERE alert_enabled = TRUE;

-- Claims
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_item_id UUID NOT NULL REFERENCES bag_items(id) ON DELETE CASCADE,
  claimer_name VARCHAR(100) NOT NULL,
  claimer_email VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('claimed','purchased')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  purchased_at TIMESTAMPTZ
);
CREATE INDEX idx_claims_bag_item_id ON claims(bag_item_id);

-- Merchants
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  affiliate_program VARCHAR(50) NOT NULL, -- 'amazon', 'walmart', 'impact', etc.
  base_commission_pct DECIMAL(5,2),
  logo_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','paused','disabled')),
  last_ingested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_merchants_status ON merchants(status);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gtin VARCHAR(14), -- EAN/UPC/ISBN
  title VARCHAR(500) NOT NULL,
  brand VARCHAR(200),
  category_path JSONB DEFAULT '[]', -- Array of category strings
  description TEXT,
  age_min INT,
  age_max INT,
  values_tags JSONB DEFAULT '[]', -- Array of value tags
  images JSONB DEFAULT '[]', -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL;
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_title_trgm ON products USING gin(title gin_trgm_ops);

-- Product Offers (merchant-specific)
CREATE TABLE product_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  url VARCHAR(1000) NOT NULL,
  affiliate_url VARCHAR(1500) NOT NULL,
  price_cents INT NOT NULL,
  list_price_cents INT,
  currency VARCHAR(3) DEFAULT 'USD',
  in_stock BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_offers_product_id ON product_offers(product_id);
CREATE INDEX idx_offers_merchant_id ON product_offers(merchant_id);
CREATE INDEX idx_offers_in_stock ON product_offers(in_stock);
CREATE UNIQUE INDEX idx_offers_product_merchant ON product_offers(product_id, merchant_id);

-- Price History
CREATE TABLE price_history (
  id BIGSERIAL PRIMARY KEY,
  product_offer_id UUID NOT NULL REFERENCES product_offers(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ DEFAULT NOW(),
  price_cents INT NOT NULL,
  in_stock BOOLEAN NOT NULL
);
CREATE INDEX idx_price_history_offer_ts ON price_history(product_offer_id, ts DESC);

-- Popularity Signals (aggregated metrics)
CREATE TABLE popularity_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  window VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  clicks INT DEFAULT 0,
  add_to_bag INT DEFAULT 0,
  claim_count INT DEFAULT 0,
  purchase_clicks INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_popularity_product_window ON popularity_signals(product_id, window);

-- Rank Features (pre-computed for faster sorting)
CREATE TABLE rank_features (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  age_fit_score DECIMAL(5,2),
  margin_score DECIMAL(5,2),
  availability_score DECIMAL(5,2),
  trend_score DECIMAL(5,2),
  freshness_ts TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Click Events (raw event log)
CREATE TABLE click_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_offer_id UUID REFERENCES product_offers(id),
  page_ctx VARCHAR(100), -- 'finder', 'trends', 'bag', 'sponsored'
  ts TIMESTAMPTZ DEFAULT NOW(),
  utm JSONB, -- UTM parameters
  experiment VARCHAR(100) -- A/B test variant
);
CREATE INDEX idx_click_events_ts ON click_events(ts DESC);
CREATE INDEX idx_click_events_offer_id ON click_events(product_offer_id);

-- Sponsors
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name VARCHAR(200) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','paused','suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id),
  name VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  targeting JSONB NOT NULL DEFAULT '{}',
  pricing_model VARCHAR(20) NOT NULL CHECK (pricing_model IN ('flat','cpc','hybrid')),
  flat_fee_cents INT,
  cpc_cents INT,
  daily_budget_cents INT,
  total_budget_cents INT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','scheduled','active','paused','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_campaigns_sponsor_id ON campaigns(sponsor_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Sponsored Slots (inventory management)
CREATE TABLE sponsored_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_ctx VARCHAR(50) NOT NULL, -- 'homepage', 'finder', 'trends', 'email'
  position VARCHAR(50) NOT NULL, -- 'featured-1', 'sidebar', etc.
  campaign_id UUID REFERENCES campaigns(id),
  creative_id UUID REFERENCES creatives(id),
  schedule JSONB, -- Day/hour targeting
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sponsored_slots_page_ctx ON sponsored_slots(page_ctx);

-- Creatives
CREATE TABLE creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  bullets JSONB, -- Array of up to 3 bullet strings
  image_url VARCHAR(500) NOT NULL,
  click_url VARCHAR(1000) NOT NULL,
  retailer_list JSONB, -- Array of merchant names
  coupon_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending_review' CHECK (status IN ('pending_review','approved','rejected')),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_creatives_campaign_id ON creatives(campaign_id);
CREATE INDEX idx_creatives_status ON creatives(status);

-- Feature Flags
CREATE TABLE feature_flags (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletters (for email digest tracking)
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  send_ts TIMESTAMPTZ,
  audience JSONB, -- Targeting criteria
  sent_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API Endpoints Reference

### Authentication
```
POST   /api/auth/magic-link
POST   /api/auth/callback
GET    /api/auth/me
POST   /api/auth/logout
```

### Children & Profiles
```
POST   /api/children
GET    /api/children
GET    /api/children/:id
PATCH  /api/children/:id
DELETE /api/children/:id
```

### Bags & Items
```
GET    /api/bags/:childId
POST   /api/bags/:bagId/items
PATCH  /api/bag-items/:id
DELETE /api/bag-items/:id
POST   /api/bags/:bagId/share
GET    /api/shared/bags/:token (public)
```

### Claims (public, tokenized)
```
POST   /api/bag-items/:id/claim
DELETE /api/claims/:id
PATCH  /api/claims/:id/status
```

### Finder & Products
```
POST   /api/finder/search
GET    /api/products/:id
GET    /api/products/:id/offers
GET    /api/trends
```

### Alerts
```
POST   /api/bag-items/:id/alerts
GET    /api/alerts/history
PATCH  /api/alerts/:id/read
GET    /api/alerts/settings
PATCH  /api/alerts/settings
```

### Sponsors (authenticated)
```
POST   /api/campaigns
GET    /api/campaigns
GET    /api/campaigns/:id
PATCH  /api/campaigns/:id
POST   /api/campaigns/:id/creatives
GET    /api/campaigns/:id/report
POST   /api/checkout/campaign
```

### Admin (requires admin role)
```
GET    /api/admin/feeds
POST   /api/admin/feeds/:merchantId/retry
GET    /api/admin/campaigns/moderate
PATCH  /api/admin/campaigns/:id/moderate
GET    /api/admin/users/search
GET    /api/admin/health
```

### Webhooks
```
POST   /webhooks/stripe
POST   /webhooks/clerk
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

**Page Load Targets:**
- Homepage: LCP < 2.0s (75th percentile)
- Gift Finder: LCP < 2.5s
- Shared Bag: LCP < 2.0s (critical for relatives)
- TTI < 3.5s across all pages

**API Response Times:**
- Simple queries (GET): p95 < 200ms
- Complex queries (search): p95 < 800ms
- Mutations: p95 < 300ms

**Database:**
- Query optimization: All queries <100ms
- Connection pooling: Max 20 connections
- Read replicas for heavy read workloads

**Caching Strategy:**
- Redis for hot data (products, offers, bags)
- CDN for static assets (images, CSS, JS)
- Edge caching for product pages (5 min TTL)
- Application-level caching for search results (15 min TTL)

### 6.2 Scalability

**Traffic Estimates (MVP + 3 months):**
- DAU: 5,000-10,000 parents
- Peak season (Nov-Dec): 3-5x normal traffic
- Concurrent users: 500-1,000 peak
- API requests: 50-100 req/sec peak

**Horizontal Scaling:**
- Stateless API servers (auto-scale on Vercel)
- Database: Vertical scaling first, then read replicas
- Redis: Cluster mode if needed
- Worker nodes: Independent scaling based on queue depth

**Vertical Scaling Thresholds:**
- Database: Upgrade when CPU >70% sustained
- Redis: Upgrade when memory >80%
- Workers: Add nodes when queue depth >100

### 6.3 Reliability

**Uptime Target:** 99.9% (43 minutes downtime per month)

**Failure Modes & Mitigations:**

| Failure | Mitigation | Fallback |
|---------|-----------|----------|
| Database down | Read replicas, circuit breaker | Cached data, graceful degradation |
| Redis down | Skip cache, hit DB | Slower responses, no hard failure |
| Search down | SQL fallback with basic filters | Reduced relevance, no outage |
| Feed ingestion fails | Retry with backoff, alert | Use stale data up to 48h |
| Email service down | Queue and retry | Web notifications only |
| Affiliate network down | Use cached links | Revenue loss, no user impact |

**Circuit Breakers:**
- Threshold: 50% error rate over 1 minute
- Open duration: 30 seconds
- Fallback: Serve cached or degraded response

**Health Checks:**
- API: /health endpoint (200 = healthy)
- Database: Connection test every 30s
- Redis: Ping every 30s
- Workers: Heartbeat every 60s

### 6.4 Security

**Authentication:**
- Clerk handles auth (OAuth, magic links)
- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- MFA optional for users, required for admins

**Authorization:**
- Role-based: parent, admin
- Resource-level: Parents can only access their children/bags
- Token-based: Share tokens for public bag access

**Data Protection:**
- All traffic over HTTPS (TLS 1.3)
- Database encryption at rest (AES-256)
- Secrets in environment variables (Vercel vault)
- PII minimization (no birthdates, full names)

**Input Validation:**
- Zod schemas for all API inputs
- SQL parameterization (no raw queries)
- XSS prevention (sanitize HTML)
- CSRF tokens for state-changing operations

**Rate Limiting:**
- Anonymous: 100 req/hour per IP
- Authenticated: 1000 req/hour per user
- Admin: 5000 req/hour
- Public bag views: 500 req/hour per token

**Compliance:**
- COPPA: No child PII beyond nickname + age band
- FTC: Clear labeling of affiliate and sponsored content
- GDPR/CCPA: Privacy policy, consent, data export/delete
- PCI: Not applicable (no payment processing)

### 6.5 Accessibility

**WCAG 2.1 Level AA Compliance:**
- [ ] Semantic HTML structure
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation (tab order, focus management)
- [ ] Color contrast ≥4.5:1 for text, ≥3:1 for large text
- [ ] Focus indicators visible on all interactive elements
- [ ] Alt text for all images
- [ ] Form labels and error messages
- [ ] Screen reader testing (NVDA, JAWS)

**Responsive Design:**
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch targets ≥44x44px
- No horizontal scrolling
- Readable font sizes (≥16px body text)

**Browser Support:**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Progressive enhancement for older browsers

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Coverage Target:** 70% for core business logic

**Focus Areas:**
- Ranking algorithm calculations
- Dedupe logic (GTIN, fuzzy matching)
- Price drop detection
- Alert rate limiting
- Targeting logic for sponsored placements
- Form validation (Zod schemas)

**Tools:** Vitest (or Jest)

**Example:**
```typescript
describe('PriceDropDetector', () => {
  it('should detect drop when price < min(last_14days) - 10%', () => {
    const history = [100, 105, 98, 103, 100];
    const current = 88;
    expect(detectPriceDrop(current, history, 10)).toBe(true);
  });
});
```

### 7.2 Integration Tests

**Focus Areas:**
- API endpoints (request/response)
- Database queries (CRUD operations)
- Clerk authentication flow
- Affiliate link generation
- Feed ingestion pipeline

**Tools:** Supertest + test database

**Example:**
```typescript
describe('POST /api/children', () => {
  it('should create child profile with valid data', async () => {
    const res = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        nickname: 'Emma',
        ageBand: '5-7',
        interests: ['Art & Crafts', 'Books'],
        budgetCents: 15000
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
```

### 7.3 End-to-End Tests

**Coverage:** Critical user flows

**Flows to Test:**
1. New user → Add child → Find gifts → Add to bag → Share → Relative claims
2. Existing user → Enable alert → Price drops → Receive email → Click affiliate link
3. Sponsor → Create campaign → Upload creative → Moderation → Go live → View report

**Tools:** Playwright or Cypress

**Example:**
```typescript
test('Parent can share bag and relative can claim', async ({ page, context }) => {
  // Login as parent
  await page.goto('/login');
  await page.fill('[name=email]', 'parent@test.com');
  await page.click('button[type=submit]');
  
  // Add child
  await page.goto('/children/new');
  await page.fill('[name=nickname]', 'TestChild');
  await page.selectOption('[name=ageBand]', '5-7');
  await page.click('button:has-text("Save")');
  
  // Search and add to bag
  await page.goto('/finder');
  await page.fill('[name=search]', 'building blocks');
  await page.click('button:has-text("Search")');
  await page.click('.product-card:first-child button:has-text("Add to Bag")');
  
  // Share bag
  await page.goto('/bags/test-child-id');
  await page.click('button:has-text("Share")');
  const shareLink = await page.locator('[data-share-link]').textContent();
  
  // Open share link in new context (relative)
  const relativePage = await context.newPage();
  await relativePage.goto(shareLink);
  
  // Claim item
  await relativePage.click('button:has-text("Claim")');
  await relativePage.fill('[name=claimerName]', 'Aunt Sally');
  await relativePage.click('button:has-text("Confirm")');
  
  // Verify claim shows in parent view
  await page.reload();
  await expect(page.locator('text=Claimed by Aunt Sally')).toBeVisible();
});
```

### 7.4 Performance Tests

**Load Testing:**
- Simulate 1000 concurrent users
- Target: API p95 < 500ms under load
- Database connections remain <80% max pool

**Tools:** k6 or Artillery

**Stress Testing:**
- Gradually increase load until failure
- Identify bottlenecks
- Validate graceful degradation

### 7.5 Accessibility Tests

**Automated:**
- Axe DevTools in CI pipeline
- Lighthouse accessibility score ≥90

**Manual:**
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS)
- Color blindness simulation

---

## 8. Deployment & DevOps

### 8.1 Environments

| Environment | Purpose | Branch | Auto-Deploy |
|-------------|---------|--------|-------------|
| Development | Local development | N/A | No |
| Staging | QA and testing | `develop` | Yes |
| Production | Live users | `main` | Yes (with protection) |

### 8.2 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.kringlelist.com
            https://staging.kringlelist.com/finder
          uploadArtifacts: true
          
  deploy-staging:
    needs: [lint, typecheck, test]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          
  deploy-production:
    needs: [lint, typecheck, test, e2e, lighthouse]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 8.3 Deployment Process

**Staging (automatic):**
1. PR merged to `develop` branch
2. CI pipeline runs (lint, test, build)
3. Vercel auto-deploys to staging URL
4. Team reviews and tests
5. Smoke tests run automatically

**Production (protected):**
1. PR created from `develop` to `main`
2. Require 1+ approvals
3. All CI checks must pass
4. Lighthouse score must be ≥90
5. Manual approval from tech lead
6. Merge triggers production deploy
7. Health checks verify deployment
8. Rollback available via Vercel dashboard

### 8.4 Database Migrations

**Tools:** Prisma Migrate or TypeORM

**Process:**
1. Create migration file in `migrations/` directory
2. Review migration in PR
3. Test migration on staging database
4. Deploy code + migration together
5. Run migration via deployment script
6. Verify data integrity

**Rollback Strategy:**
- Keep previous migration as down script
- Database backups before major migrations
- Blue-green deployment for zero-downtime

### 8.5 Monitoring & Alerting

**Metrics to Track:**
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit rates
- Job queue depth and processing time
- User session duration
- Conversion funnel drop-offs

**Alerts:**
- PagerDuty for critical issues (24/7)
- Slack #alerts channel for warnings
- Email digest for daily summaries

**Alert Thresholds:**
- Error rate >0.5% for 5 minutes → Page
- API p95 >500ms for 10 minutes → Slack
- Database connections >85% → Slack
- Job queue depth >500 → Slack
- Uptime <99.9% monthly → Review

---

## 9. Launch Plan & Milestones

### 9.1 MVP Milestone Breakdown

**Milestone 1: Foundation (Weeks 1-3)**
- [ ] Project setup (Next.js, Clerk, database)
- [ ] User authentication flow
- [ ] Child profile CRUD
- [ ] Basic Gift Finder (static seed catalog of 500 products)
- [ ] Christmas Bag add/remove
- [ ] Affiliate link click router
- [ ] Analytics event tracking (PostHog)

**Milestone 2: Core Features (Weeks 4-6)**
- [ ] Feed ingestion pipeline (1-2 merchants)
- [ ] Product search index (Meilisearch)
- [ ] Shareable bag + claim flow (public link)
- [ ] Trend Radar (daily top 10)
- [ ] Product detail pages
- [ ] Responsive design (mobile + desktop)

**Milestone 3: Intelligence (Weeks 7-8)**
- [ ] Price & stock alert system
- [ ] Alert email templates
- [ ] UTM tracking and A/B testing framework
- [ ] SEO-optimized static pages
- [ ] Weekly email digest

**Milestone 4: Revenue (Weeks 9-10)**
- [ ] Sponsored slot rendering
- [ ] Campaign admin setup
- [ ] Creative moderation queue
- [ ] Stripe checkout for sponsors
- [ ] "Advertise" landing page
- [ ] Campaign reporting dashboard

**Milestone 5: Polish & Launch (Weeks 11-12)**
- [ ] Accessibility audit + fixes
- [ ] Performance optimization (Lighthouse >90)
- [ ] E2E test coverage for critical flows
- [ ] Admin tools for support
- [ ] Public beta launch (soft launch to 100 users)
- [ ] Monitoring and alerting fully configured

### 9.2 Launch Checklist

**Pre-Launch:**
- [ ] All critical bugs resolved (P0, P1)
- [ ] Security audit completed
- [ ] Privacy policy and terms of service published
- [ ] FTC disclosure language reviewed
- [ ] Email templates tested across providers
- [ ] Affiliate links verified with networks
- [ ] Backup and disaster recovery plan in place
- [ ] Customer support process defined
- [ ] Marketing site live
- [ ] Social media accounts created

**Launch Day:**
- [ ] Monitor error rates and performance
- [ ] Watch user funnel metrics live
- [ ] Be ready for hotfixes
- [ ] Respond to early user feedback
- [ ] Announce on social media
- [ ] Send email to waitlist

**Post-Launch (Week 1):**
- [ ] Daily standup to review metrics
- [ ] User interviews (5-10 parents)
- [ ] Address top feedback items
- [ ] Publish first batch of SEO content
- [ ] Reach out to first sponsor prospects

### 9.3 Success Criteria (60 Days Post-Launch)

**Must-Haves:**
- ≥35% activation (users adding ≥1 child)
- ≥50% engagement (users adding ≥1 bag item)
- ≥18% affiliate clickthrough rate
- ≥$1.5k affiliate revenue
- 1+ sponsor campaign booked
- <0.5% error rate
- 99.5%+ uptime

**Nice-to-Haves:**
- 100+ DAU by day 60
- 25%+ share-to-claim conversion
- 20%+ alert opt-in rate
- Featured in parenting blog or newsletter
- 500+ organic social media mentions

---

## 10. Future Enhancements (Post-MVP)

### 10.1 Phase 2 Features (Months 3-6)

1. **Birthday Mode**
   - Add birthday date to child profile
   - Automated reminders 60/30/14 days before
   - Birthday-specific gift suggestions
   - "Birthday Bag" separate from Christmas

2. **Relative Accounts**
   - Optional account creation for relatives
   - Track purchase history across families
   - Wishlist management
   - Gift suggestions based on past purchases

3. **Advanced Filters**
   - Price history charts
   - Availability forecasting
   - "Gift this before" urgency badges
   - More granular age targeting (by month for 0-2)

4. **Social Features**
   - Public wish lists (opt-in)
   - Upvote/downvote recommendations
   - Parent reviews and photos
   - Gift ideas from similar families

5. **Mobile Apps**
   - iOS and Android native apps
   - Push notifications for alerts
   - Camera scanning for product search
   - Offline mode for browsing

### 10.2 Phase 3 Features (Months 6-12)

1. **AI-Powered Recommendations**
   - Fine-tuned LLM for gift descriptions
   - Visual similarity search
   - Personalized daily digest
   - "Chat with gift advisor" bot

2. **Registry Integration**
   - Amazon, Target, Walmart registry sync
   - Universal registry (aggregate all stores)
   - Gift tracking across platforms

3. **Price Prediction**
   - ML model for price forecasting
   - "Best time to buy" recommendations
   - Black Friday/Cyber Monday alerts

4. **Group Gifting**
   - Pool money with relatives for big-ticket items
   - Crowdfunding interface
   - Contribution tracking

5. **International Expansion**
   - UK, Canada, Australia support
   - Currency conversion
   - Local merchant integrations

---

## 11. Open Questions & Decisions Needed

### 11.1 Technical Decisions

1. **Which 1-2 merchants to start with for feed ingestion?**
   - Recommendation: Amazon (largest catalog) + Target (high quality)
   - Consideration: Feed reliability, commission rates, API availability

2. **Search engine: Meilisearch or Elasticsearch?**
   - Meilisearch: Easier setup, better DX, typo tolerance
   - Elasticsearch: More features, proven scale, complex
   - Recommendation: Start with Meilisearch

3. **Do we need a dedicated queue service (BullMQ) or use Vercel Cron?**
   - Vercel Cron: Simpler for basic jobs, limited concurrency
   - BullMQ: Better for complex workflows, retries, monitoring
   - Recommendation: Start with Vercel Cron, migrate to BullMQ at scale

### 11.2 Product Decisions

4. **What age-band taxonomy to lock?**
   - Current: 0-2, 3-4, 5-7, 8-10, 11-13, 14+
   - Alternative: More granular for 0-2 (e.g., 0-6mo, 6-12mo, 12-24mo)
   - Decision: User test with 10 parents before finalizing

5. **Do we allow relatives to mark "purchased" with optional receipt upload?**
   - Pro: Better tracking, reduces duplicate purchases
   - Con: Added complexity, privacy concerns
   - Decision: MVP = simple claim toggle, add "purchased" in Phase 2

6. **Push notifications at MVP, or email-only?**
   - Push: Better engagement, requires opt-in flow
   - Email: Proven channel, easier to implement
   - Decision: Email for MVP, push in Phase 2 after mobile app

7. **Do we include product reviews/ratings?**
   - Source options: Scrape from retailers, third-party API, user-generated
   - Consideration: Data quality, freshness, legal risk
   - Decision: Use retailer ratings if available in feeds, no scraping

8. **How do we handle out-of-stock items in bags?**
   - Option A: Auto-remove after 7 days OOS
   - Option B: Move to "Unavailable" section with restore option
   - Option C: Keep in bag with "Find alternative" button
   - Decision: Option C (best UX, respects user intent)

---

## 12. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Feed reliability issues | High | High | Start with 1-2 proven merchants; build monitoring dashboard; negotiate SLAs |
| Seasonality (post-Christmas drop) | High | Medium | Add Birthday mode by Week 10; evergreen gift guides; partner with Q1-Q3 holidays |
| Affiliate attribution leakage | Medium | High | First-party click router; minimize external redirects; track conversion pixels |
| Low conversion from parent to sponsor | Medium | High | Validate demand with 5-10 sponsor interviews pre-launch; iterate on pitch |
| Compliance drift (FTC, COPPA) | Low | High | Quarterly audits; automated label checks; legal review before major features |
| Database performance at scale | Medium | Medium | Optimize queries early; read replicas; caching layer; load testing |
| Clerk service outage | Low | High | Implement circuit breaker; cache user sessions; graceful degradation |

---

## 13. Team & Responsibilities

**For MVP (assuming 2-3 person team):**

**Technical Lead / Full-Stack Engineer:**
- Overall architecture and tech decisions
- Backend API and database design
- Feed ingestion pipeline
- Deployment and DevOps
- Performance optimization

**Full-Stack Engineer:**
- Frontend development (Next.js + React)
- UI/UX implementation (Tailwind + shadcn)
- Clerk integration
- Client-side state management
- Accessibility and responsive design

**Product Manager / Designer (part-time or founder):**
- Feature prioritization
- User research and testing
- Design mockups (Figma)
- Copy and content
- Metrics and analytics

**Future Hires (Post-MVP):**
- Data Analyst (after month 3)
- Content/SEO Specialist (after month 6)
- Customer Support (after 1000 DAU)

---

## 14. Glossary

**Terms:**
- **Affiliate link**: URL with tracking parameters that generates commission on purchases
- **Age band**: Grouped age ranges (e.g., 5-7 years old)
- **Bag**: Per-child collection of saved gift items
- **Campaign**: Sponsor's advertising initiative with defined dates and budget
- **Claim**: Relative's declaration of intent to purchase a specific gift
- **CPC**: Cost-per-click pricing model
- **Creative**: Ad asset (image, copy, CTA) for sponsored placement
- **EPC**: Earnings per click (affiliate revenue ÷ clicks)
- **Feed**: Merchant-provided product catalog (CSV, JSON, XML)
- **GTIN**: Global Trade Item Number (EAN, UPC, ISBN)
- **LCP**: Largest Contentful Paint (Core Web Vital)
- **Offer**: Merchant-specific instance of a product (price, availability)
- **Product**: Universal gift item across merchants
- **Slot**: Inventory unit for sponsored placement
- **Surprise**: Gift item hidden from shared bag view
- **Targeting**: Criteria for ad delivery (age, interest, etc.)
- **Values**: Family principles (STEM, eco, screen-free, etc.)

---

## Appendix: Reference Links

**Documentation:**
- Next.js: https://nextjs.org/docs
- Clerk: https://clerk.com/docs
- Vercel: https://vercel.com/docs
- Prisma: https://www.prisma.io/docs
- TanStack Query: https://tanstack.com/query/latest
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

**Affiliate Networks:**
- Amazon Associates: https://affiliate-program.amazon.com
- Walmart Affiliates: https://affiliates.walmart.com
- Target Affiliates: https://partners.target.com
- Impact: https://impact.com
- Commission Junction: https://www.cj.com

**Tools:**
- PostHog (Analytics): https://posthog.com
- Sentry (Error Tracking): https://sentry.io
- Meilisearch: https://www.meilisearch.com
- Playwright (E2E): https://playwright.dev
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci

**Compliance:**
- FTC Endorsement Guidelines: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- COPPA Requirements: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

**End of Feature Specification v1.0.0**
