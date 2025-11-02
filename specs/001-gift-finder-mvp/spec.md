# Feature Specification: KringleList Gift Finder MVP

**Feature Branch**: `001-gift-finder-mvp`
**Created**: 2025-11-01
**Status**: Draft
**Input**: User description: "KringleList MVP - Core gift finding and organization platform for parents to discover, organize, and share Christmas and birthday gifts with intelligent recommendations and collaborative features"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Child Profile and Find First Gift (Priority: P1)

As a parent, I want to create a profile for my child with basic information (nickname, age, interests) so that I can receive age-appropriate and interest-matched gift recommendations.

**Why this priority**: This is the foundation of the entire platform. Without child profiles and basic gift discovery, no other features can deliver value. It represents the minimum viable experience.

**Independent Test**: Can be fully tested by creating a child profile with nickname "Emma", age band "5-7", interests "Art & Crafts, Books", and immediately seeing a curated list of relevant gift recommendations. Success is measured by receiving at least 10 relevant products within 3 seconds.

**Acceptance Scenarios**:

1. **Given** I am a new parent user who just signed up, **When** I navigate to add a child and enter nickname "Sam", age band "8-10", and select 3 interests, **Then** the profile is saved successfully and I see a confirmation message
2. **Given** I have created a child profile, **When** I view the Gift Finder for that child, **Then** I see personalized recommendations matching their age and interests
3. **Given** I am searching for gifts, **When** I view a product card, **Then** I see the product image, title, price range, availability status, and exactly 3 "why it fits" bullets explaining the match
4. **Given** I am viewing recommendations, **When** I find a gift I like, **Then** I can add it to my child's gift bag with one click

---

### User Story 2 - Organize and Share Gift Bag (Priority: P1)

As a parent, I want to save selected gifts to my child's "Christmas Bag" and share it with relatives so they can claim items they'll purchase, avoiding duplicate gifts.

**Why this priority**: This solves the core pain point of coordinating gifts with extended family. It's independently valuable even without advanced features like alerts or trends.

**Independent Test**: Can be fully tested by adding 5 items to a child's bag, clicking "Share Bag", copying the generated link, opening it in an incognito browser, and successfully claiming an item. Success is measured when the claim appears in both the relative's view and the parent's dashboard within 5 seconds.

**Acceptance Scenarios**:

1. **Given** I have found gifts for my child, **When** I click "Add to Bag" on a product, **Then** the item appears in that child's Christmas Bag immediately
2. **Given** I have items in a child's bag, **When** I click "Share Bag", **Then** I receive a unique shareable link that doesn't require login
3. **Given** I am a relative who received a shared bag link, **When** I open the link, **Then** I see the child's nickname, age, and all gift items (except those marked as "surprises")
4. **Given** I am a relative viewing a shared bag, **When** I click "Claim" on an item and enter my name, **Then** the item shows "Claimed by [Name]" for all viewers
5. **Given** I am a parent viewing my child's bag, **When** a relative claims an item, **Then** I see the claim status updated in real-time and the item shows who claimed it
6. **Given** I have added items to a bag, **When** I mark an item as "surprise", **Then** it is hidden from the shared view but visible to me

---

### User Story 3 - Track Budget and Spending (Priority: P2)

As a parent, I want to set a budget for my child's gifts and see how much I've allocated versus what's been claimed so I can stay within my spending limit.

**Why this priority**: Budget management is important but secondary to basic discovery and sharing. Parents can manually track spending if needed, but automated tracking adds significant value.

**Independent Test**: Can be fully tested by setting a $200 budget for a child, adding items totaling $180, and verifying the budget thermometer shows 90% used. Then have a relative claim a $50 item and verify the parent's view updates to show $130 remaining.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a child profile, **When** I set a budget of $250, **Then** the budget is saved and displayed on the child's bag page
2. **Given** I have set a budget for my child, **When** I view their bag, **Then** I see a visual thermometer showing total budget, current spend, and remaining amount
3. **Given** I have items in my child's bag totaling $180 of a $200 budget, **When** the total approaches 75% of budget, **Then** the thermometer shows yellow status
4. **Given** I have items totaling $195 of a $200 budget, **When** the total exceeds 95%, **Then** the thermometer shows red status as a warning
5. **Given** I am viewing budget status, **When** I include claimed items, **Then** the spending calculation includes both my planned purchases and claimed items

---

### User Story 4 - Discover Trending Gifts (Priority: P2)

As a parent, I want to see what gifts are currently trending for my child's age group so I can discover popular and emerging products I might have missed.

**Why this priority**: Trend discovery enhances the core finding experience but isn't essential for MVP. Parents can find adequate gifts through search alone.

**Independent Test**: Can be fully tested by navigating to the Trends page, filtering by age band "5-7", and seeing a curated list of the top 10 trending items with badges like "Rising" or "Back in Stock". Success is measured by the page loading in under 2 seconds with visually distinct trending indicators.

**Acceptance Scenarios**:

1. **Given** I am browsing for gift ideas, **When** I visit the Trend Radar page, **Then** I see daily top 10 products for each age band
2. **Given** I am viewing trends, **When** I see products with a "Rising" badge, **Then** I know these items have seen significant recent increase in popularity
3. **Given** I am viewing trends, **When** I see products with a "Back in Stock" badge, **Then** I know these items were recently out of stock and are now available
4. **Given** I am viewing trends, **When** I filter by a specific age band or interest, **Then** the results update to show only relevant trending items
5. **Given** I find a trending item I like, **When** I click on it, **Then** I can view full details and add it to a child's bag

---

### User Story 5 - Receive Price Drop and Restock Alerts (Priority: P3)

As a parent, I want to be notified when items in my child's bag drop in price or come back in stock so I can purchase at the best time and not miss out on desired gifts.

**Why this priority**: Alerts optimize the buying experience but aren't required for core functionality. This is a valuable enhancement once the base platform is proven.

**Independent Test**: Can be fully tested by enabling alerts on a bag item, simulating a price drop in the system, and verifying an email is sent within 15 minutes with the correct price information and a direct link to the bag.

**Acceptance Scenarios**:

1. **Given** I have items in a child's bag, **When** I toggle "Enable Alerts" on an item, **Then** price drop and restock monitoring begins for that item
2. **Given** I have alerts enabled on an item, **When** the price drops by at least 10% or $5 (whichever threshold I set), **Then** I receive an email notification within 15 minutes
3. **Given** I have alerts enabled on an out-of-stock item, **When** the item becomes available again, **Then** I receive a restock notification
4. **Given** I am receiving alerts, **When** multiple price drops occur within 4 hours, **Then** they are bundled into a single digest email to avoid spam
5. **Given** I have configured quiet hours (e.g., 10pm-8am), **When** an alert triggers during quiet hours, **Then** it is delayed until the quiet period ends
6. **Given** I am managing alerts, **When** I view my alert history, **Then** I see all past alerts for the last 30 days with read/unread status

---

### User Story 6 - View Sponsored Gift Recommendations (Priority: P3)

As a parent, I want to see clearly labeled sponsored gift recommendations that are relevant to my search so I can discover new products while understanding they are paid placements.

**Why this priority**: Sponsorship is a revenue stream but not critical for initial user value. MVP can launch without sponsors and add this feature once there's traffic.

**Independent Test**: Can be fully tested by performing a gift search, seeing exactly one sponsored product card with a prominent "Sponsored" badge, clicking it to verify the disclosure message, and confirming the click is tracked for sponsor reporting.

**Acceptance Scenarios**:

1. **Given** I am viewing search results or browsing categories, **When** there is an active sponsored campaign matching my criteria, **Then** I see at most one sponsored product card per page
2. **Given** I am viewing a sponsored product, **When** I look at the card, **Then** I see a clear "Sponsored" badge and can access full FTC disclosure information
3. **Given** I am viewing sponsored content, **When** I click on the product, **Then** the system tracks the click for sponsor reporting
4. **Given** I am browsing the site, **When** sponsored placements are shown, **Then** I see no more than 3 sponsored impressions per session to avoid fatigue
5. **Given** I am a brand sponsor, **When** my campaign is active, **Then** I can view real-time performance metrics including impressions, clicks, and click-through rate

---

### Edge Cases

- What happens when a relative tries to claim an item that was just claimed by someone else? → System shows error message "This item was just claimed by [Name]. Please refresh to see updated status."
- What happens when a parent deletes a child profile that has a shared bag with active claims? → System shows confirmation dialog warning about active claims; if confirmed, bag remains accessible via share link for 30 days before deletion
- What happens when a product becomes out of stock in all retailers after being added to a bag? → Item shows "Currently Unavailable" status with a "Find Alternative" button that suggests similar items
- What happens when a relative unclaims an item? → Relative can unclaim within 24 hours; after 24 hours, must contact parent to remove claim
- What happens when a parent marks an item as "surprise" after a relative has already viewed the shared bag? → Item immediately disappears from relative's view; if refreshed, it won't show
- What happens when a child profile has no budget set? → Budget thermometer is hidden; bag shows only item count and total value without warnings
- What happens when alert email fails to deliver? → System retries 3 times with exponential backoff; if still failing, logs error and displays alert in user's notification center on next login
- What happens when a sponsored campaign runs out of budget mid-day? → Campaign automatically pauses; system stops showing sponsored placements immediately; sponsor sees budget status in dashboard

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & User Management:**

- **FR-001**: System MUST allow parents to create accounts using email/password or social login (Google, Facebook)
- **FR-002**: System MUST authenticate users securely with session management and automatic token refresh
- **FR-003**: System MUST allow only authenticated users to create child profiles and manage bags
- **FR-004**: System MUST provide password reset functionality via email magic links

**Child Profile Management:**

- **FR-005**: Users MUST be able to create unlimited child profiles with nickname (2-20 characters), age band (0-2, 3-4, 5-7, 8-10, 11-13, 14+), and interests (minimum 1, maximum 8)
- **FR-006**: Users MUST be able to select optional values (STEM, screen-free, sensory-friendly, eco, educational, creative, active, quiet) for each child
- **FR-007**: Users MUST be able to set an optional budget per child (0-$1000 in $5 increments)
- **FR-008**: Users MUST be able to edit child profiles at any time
- **FR-009**: Users MUST be able to delete child profiles with confirmation; system performs soft delete for audit purposes
- **FR-010**: System MUST store only child nickname and age band to comply with COPPA (no full names, birthdates, or other PII)

**Gift Discovery & Search:**

- **FR-011**: System MUST provide a Gift Finder that searches and ranks products based on age band, interests, and optional values
- **FR-012**: System MUST return search results within 800ms for typical queries
- **FR-013**: System MUST display product cards showing image, title, brand, price range, availability status, and exactly 3 "why it fits" explanation bullets
- **FR-014**: System MUST support filtering by price bands (<$15, $15-$30, $30-$50, $50-$100, >$100), values, merchants, and availability
- **FR-015**: System MUST support sorting by relevance (default), price (low-high, high-low), popularity, and newest
- **FR-016**: System MUST implement infinite scroll loading next 20 items within 300ms
- **FR-017**: System MUST show availability status (in stock, low stock, out of stock) from multiple merchants
- **FR-018**: System MUST rank products using age fit (35%), availability (25%), popularity (20%), affiliate margin (15%), and freshness (5%)

**Gift Bag Management:**

- **FR-019**: System MUST automatically create one bag per child profile
- **FR-020**: Users MUST be able to add products to a child's bag with one click
- **FR-021**: Users MUST be able to remove items from a bag at any time
- **FR-022**: Users MUST be able to mark items as "surprise" to hide them from shared view
- **FR-023**: System MUST track quantity for each bag item
- **FR-024**: System MUST calculate and display real-time total spend for each bag
- **FR-025**: System MUST display budget thermometer showing total budget, current spend, and remaining amount when budget is set
- **FR-026**: System MUST show green status (<75% budget), yellow (75-95%), or red (>95%) budget indicators
- **FR-027**: System MUST allow users to specify backup/alternative products for each bag item

**Bag Sharing & Claims:**

- **FR-028**: Users MUST be able to generate a unique, unguessable share token (UUID) for each child's bag
- **FR-029**: System MUST provide a public share link that works without authentication (format: `https://kringlelist.com/shared/bag/{token}`)
- **FR-030**: System MUST display shared bag showing child nickname, age band, and all non-surprise items
- **FR-031**: Relatives MUST be able to claim items by providing their name (required) and optionally email
- **FR-032**: System MUST update claim status in real-time for all viewers (polling every 5 seconds or WebSocket)
- **FR-033**: System MUST show "Claimed by [Name]" status on claimed items for both parents and relatives
- **FR-034**: Relatives MUST be able to unclaim items within 24 hours of claiming
- **FR-035**: System MUST rate limit claims to maximum 10 per hour per IP address
- **FR-036**: Parents MUST be able to regenerate share tokens to invalidate old links

**Trend Discovery:**

- **FR-037**: System MUST compute and cache daily trend rankings by age band and interest category
- **FR-038**: System MUST display top 10 trending products per age band refreshed daily at 2:00 AM
- **FR-039**: System MUST assign badges: "Rising" (≥50% activity increase in 3 days), "Back in Stock" (was OOS ≥3 days, now available), "High Margin" (commission ≥12%), "Best Value" (price < category median + rating ≥4.3)
- **FR-040**: System MUST support filtering trends by age band or interest
- **FR-041**: Trend page MUST load in under 1.5 seconds

**Price & Stock Alerts:**

- **FR-042**: Users MUST be able to enable price and stock alerts per bag item
- **FR-043**: System MUST monitor prices hourly for items with alerts enabled
- **FR-044**: System MUST trigger price drop alerts when current price ≤ (14-day minimum - threshold%) OR absolute drop ≥ configured amount (default 10% or $5)
- **FR-045**: System MUST trigger restock alerts when item changes from out-of-stock to in-stock
- **FR-046**: System MUST send alert emails within 15 minutes of trigger
- **FR-047**: System MUST rate limit alerts to maximum 1 per item per 24 hours and 10 total per user per day
- **FR-048**: System MUST bundle multiple alerts within 4-hour window into single digest email
- **FR-049**: System MUST respect user-configured quiet hours (default 10pm-8am) by delaying alerts
- **FR-050**: System MUST retain price history for 90 days for trend analysis
- **FR-051**: Users MUST be able to view alert history for the past 30 days

**Sponsored Placements:**

- **FR-052**: System MUST display at most 1 sponsored product card per search results page
- **FR-053**: All sponsored content MUST show prominent "Sponsored" badge and FTC-compliant disclosure
- **FR-054**: System MUST limit sponsored impressions to maximum 3 per user session
- **FR-055**: System MUST track impressions, viewable impressions (≥50% visible for ≥1 second), and clicks for each campaign
- **FR-056**: Sponsors MUST be able to create campaigns with targeting by age band, interests, values, and date range
- **FR-057**: System MUST support flat fee, CPC, and hybrid pricing models for campaigns
- **FR-058**: System MUST moderate all sponsored content within 24 hours of submission
- **FR-059**: System MUST auto-reject campaigns with broken URLs, incorrect image dimensions, or prohibited content
- **FR-060**: System MUST provide sponsors with real-time performance dashboard showing impressions, clicks, CTR, and spend

**Affiliate Revenue:**

- **FR-061**: System MUST generate affiliate-tracked links for all outbound product clicks
- **FR-062**: System MUST route clicks through first-party click router to maintain attribution
- **FR-063**: System MUST track affiliate clicks by source (finder, trends, bag, sponsored) for analytics
- **FR-064**: System MUST support multiple affiliate networks (Amazon Associates, Walmart, Target, Impact, CJ)

**Performance & Reliability:**

- **FR-065**: System MUST achieve LCP (Largest Contentful Paint) < 2.5 seconds for all pages
- **FR-066**: System MUST achieve TTI (Time to Interactive) < 3.5 seconds for all pages
- **FR-067**: API endpoints MUST respond with p95 < 200ms for simple queries, < 800ms for complex searches
- **FR-068**: System MUST maintain 99.9% uptime (maximum 43 minutes downtime per month)
- **FR-069**: System MUST handle 500-1000 concurrent users during peak season
- **FR-070**: System MUST implement circuit breakers for external dependencies (database, cache, search) with graceful degradation

**Security & Privacy:**

- **FR-071**: System MUST serve all traffic over HTTPS with TLS 1.3
- **FR-072**: System MUST validate all user inputs using schema validation (Zod)
- **FR-073**: System MUST prevent XSS attacks by sanitizing all user-generated content
- **FR-074**: System MUST implement CSRF protection for all state-changing operations
- **FR-075**: System MUST encrypt sensitive data at rest using AES-256
- **FR-076**: System MUST comply with COPPA by not collecting child PII beyond nickname and age band
- **FR-077**: System MUST comply with FTC guidelines by clearly labeling all affiliate and sponsored content
- **FR-078**: System MUST provide privacy policy, terms of service, and data export/deletion capabilities for GDPR/CCPA compliance

**Accessibility:**

- **FR-079**: System MUST achieve WCAG 2.1 Level AA compliance
- **FR-080**: All interactive elements MUST be keyboard navigable with visible focus indicators
- **FR-081**: All images MUST have descriptive alt text
- **FR-082**: All text MUST meet minimum contrast ratio of 4.5:1 (3:1 for large text)
- **FR-083**: All form fields MUST have associated labels and error messages
- **FR-084**: Touch targets MUST be minimum 44x44 pixels

### Key Entities

- **User**: Represents a parent/guardian account. Attributes include email, account creation date, authentication method. Manages multiple child profiles and bags. Relationships: one-to-many with Children.

- **Child Profile**: Represents a child for whom gifts are being found. Attributes include nickname, age band, interests array, values array, optional budget. No PII beyond nickname to comply with COPPA. Relationships: belongs to one User, has one Bag.

- **Bag**: Represents a collection of saved gifts for one child. Attributes include unique share token, total budget (inherited from child or overridden), created/updated timestamps. Relationships: belongs to one Child, has many Bag Items.

- **Bag Item**: Represents a single product offer saved to a bag. Attributes include quantity, is_surprise flag, backup offer IDs, alert enabled status, last alert timestamp. Relationships: belongs to one Bag, references one Product Offer, may have one Claim.

- **Claim**: Represents a relative's intention to purchase a specific bag item. Attributes include claimer name, optional email, status (claimed/purchased), claim timestamp, optional purchase timestamp. Relationships: belongs to one Bag Item.

- **Product**: Represents a universal gift item across multiple merchants. Attributes include GTIN (if available), title, brand, category, description, age range, value tags, images. Deduplicated across merchants using GTIN or fuzzy matching. Relationships: has many Product Offers.

- **Product Offer**: Represents a merchant-specific instance of a product. Attributes include merchant, URL, affiliate URL, current price, list price, currency, in-stock status, last seen timestamp. Relationships: belongs to one Product and one Merchant.

- **Merchant**: Represents a retail partner providing product feeds. Attributes include name, slug, affiliate program type, base commission rate, logo, status, last ingestion timestamp. Relationships: has many Product Offers.

- **Price History**: Represents historical price and stock snapshots. Attributes include product offer ID, timestamp, price, in-stock status. Retained for 90 days. Relationships: references one Product Offer.

- **Campaign**: Represents a sponsor's advertising initiative. Attributes include sponsor, name, date range, targeting criteria (age bands, interests, values), pricing model, budget limits, status. Relationships: belongs to one Sponsor, has many Creatives.

- **Creative**: Represents an ad asset for a campaign. Attributes include title, description, bullets, image URL, click URL, retailer list, coupon code, moderation status. Relationships: belongs to one Campaign.

- **Sponsor**: Represents a brand or retailer paying for advertising. Attributes include organization name, contact email, Stripe customer ID, status. Relationships: has many Campaigns.

- **Alert Settings**: Represents user preferences for price/stock notifications. Attributes include bag item ID, enabled flag, price drop threshold, restock enabled, notification channels (email, web push), quiet hours. Relationships: belongs to one Bag Item.

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Activation & Engagement:**

- **SC-001**: At least 35% of new users add one or more child profiles within 24 hours of account creation
- **SC-002**: At least 50% of users who view the Gift Finder add one or more items to a bag within their first session
- **SC-003**: Users can complete the full journey from account creation to first bag item in under 5 minutes
- **SC-004**: At least 25% of users who share a bag receive at least one claim within 7 days
- **SC-005**: Average of 3 or more items per child's bag indicates adequate product discovery

**Performance & Reliability:**

- **SC-006**: Gift Finder search results appear within 2 seconds for 95% of queries
- **SC-007**: Bag updates (add, remove, claim) reflect immediately (within 1 second) in the UI
- **SC-008**: Page load times achieve LCP under 2.5 seconds for 75% of page views
- **SC-009**: System maintains 99.5% or higher uptime during first 60 days post-launch
- **SC-010**: Zero data loss incidents for user profiles, bags, or claims

**Revenue & Business Metrics:**

- **SC-011**: At least 18% of product views result in affiliate link clicks
- **SC-012**: Platform generates $1,500 or more in affiliate revenue within first 60 days
- **SC-013**: At least one sponsor campaign is booked by day 45 post-launch
- **SC-014**: Share-to-claim conversion rate reaches 25% or higher (claims ÷ shares)

**User Experience:**

- **SC-015**: At least 20% of users with bag items enable price or stock alerts
- **SC-016**: Alert emails are delivered within 15 minutes for 95% of triggers
- **SC-017**: Mobile users comprise at least 50% of traffic with equivalent task completion rates to desktop
- **SC-018**: Accessibility audit shows zero critical WCAG 2.1 Level AA violations
- **SC-019**: User surveys indicate 80% or higher satisfaction with gift recommendation relevance
- **SC-020**: Average session duration exceeds 4 minutes indicating engaged browsing

**Operational Efficiency:**

- **SC-021**: Product feed ingestion completes daily without manual intervention for 95% of merchants
- **SC-022**: Sponsored content moderation queue is cleared within 24 hours for 90% of submissions
- **SC-023**: Customer support queries are resolved within 48 hours for 90% of tickets
- **SC-024**: System error rate remains below 0.5% of all requests

## Assumptions

- Users primarily access the platform during November and December for Christmas shopping, with secondary peaks around children's birthdays
- Majority of users are parents with children ages 0-14 in the United States
- Users have reliable internet access and modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Product catalog will start with 500-1000 items from 1-2 major merchants (Amazon, Target) and expand over time
- Affiliate commission rates average 3-8% across retailers, with some categories offering higher margins
- Users are comfortable sharing gift lists via URL links (similar to wedding registries)
- Relatives accessing shared bags typically do so from mobile devices
- Email is the preferred channel for alerts over push notifications initially
- Sponsored content will follow standard IAB display ad guidelines and FTC regulations
- Price monitoring frequency of hourly is sufficient; real-time tracking is not required for MVP
- Users understand "affiliate" and "sponsored" labeling; no additional education required
- Parents manage bags primarily from desktop/tablet; relatives claim from mobile
- Session-based authentication with 7-day token expiration is acceptable user experience
- Database will use PostgreSQL-compatible service with standard relational model
- Search functionality will use dedicated search engine (Meilisearch or Elasticsearch) not SQL LIKE queries
- Object storage for product images will use CDN-backed service (Vercel Blob, S3, Cloudflare R2)
- Background job processing will use queue-based system (BullMQ with Redis or Vercel Cron for simple jobs)
- Analytics events will be tracked via third-party service (PostHog, GA4) not custom built
- Error tracking and monitoring will use SaaS tools (Sentry, Datadog) not self-hosted solutions

## Dependencies

**External Services:**
- Authentication provider (Clerk) for user management and session handling
- Affiliate networks (Amazon Associates, Walmart, Target, Impact, CJ) for product links and commission tracking
- Email delivery service (Postmark or SendGrid) for transactional emails and alerts
- Payment processor (Stripe) for sponsor campaign payments
- Product data feeds from retail partners (CSV, JSON, or XML formats)
- Analytics platform (PostHog, GA4) for event tracking and user behavior
- Error tracking service (Sentry) for production error monitoring
- CDN/object storage (Vercel Blob, S3, or R2) for product images and static assets

**Infrastructure:**
- PostgreSQL-compatible database (Supabase, AWS RDS, or Neon) for primary data storage
- Redis-compatible cache (Upstash or ElastiCache) for session storage and rate limiting
- Search engine (Meilisearch or Elasticsearch) for product discovery
- Job queue system (BullMQ with Redis or Vercel Cron) for background processing
- Hosting platform (Vercel) for application deployment and edge functions

**Data Sources:**
- At least 1-2 retail partner product feeds operational before launch
- Baseline product catalog of 500+ items across key age bands and interest categories
- Product images must be properly licensed or provided by merchants
- Affiliate program approval and active tracking links from each network

**Compliance & Legal:**
- Privacy policy and terms of service reviewed by legal counsel
- FTC disclosure language approved for affiliate and sponsored content
- COPPA compliance verified for child data handling
- GDPR/CCPA data handling procedures documented if serving EU/CA users

**Design Assets:**
- Figma mockups or wireframes for key user flows (optional but recommended)
- Brand guidelines including logo, colors, typography
- Product card "why it fits" copywriting templates
- Email templates for alerts, notifications, and digests

## Out of Scope (MVP)

**Explicitly excluded from MVP to maintain focus:**

- In-app checkout or payment processing (users purchase through retailer sites)
- Web scraping of restricted retailer sites (rely on authorized feeds and APIs only)
- Multi-country pricing and currency conversion (US market only for MVP)
- iOS/Android native mobile applications (responsive web/PWA only)
- Social features: comments, likes, public profiles, user-to-user messaging
- Gift wrapping coordination or delivery tracking
- Birthday reminders and automated birthday-specific suggestions (Christmas focus first)
- Relative account creation and purchase history tracking (claim-only for MVP)
- Advanced filters: price history charts, availability forecasting, urgency badges
- AI-powered recommendations beyond rule-based ranking (no LLM or ML models)
- Registry integration with Amazon, Target, or Walmart registries
- Price prediction or "best time to buy" ML models
- Group gifting or crowdfunding for expensive items
- International expansion beyond United States
- Offline mode or PWA install prompts (basic PWA caching only)
- Product reviews or ratings (use merchant ratings if available in feeds)
- Camera/image search for product discovery
- Live chat or chatbot support (email support only)
- Multi-language support (English only)
- Custom push notification preferences (email alerts only for MVP)
- Sponsor self-serve campaign creation (admin-managed campaigns only)
- A/B testing framework for UX experiments
- Referral program or affiliate recruitment
- Blog or content management system
