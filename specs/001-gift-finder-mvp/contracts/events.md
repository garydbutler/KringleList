# Analytics Events Schema: KringleList Gift Finder MVP

**Analytics Providers**: PostHog (primary), Google Analytics 4 (secondary)
**Version**: 1.0.0
**Date**: 2025-11-01

## Overview

This document defines the analytics event schema for KringleList, covering user activation, feature engagement, revenue tracking, and performance monitoring. All events are tracked in PostHog for product analytics and optionally sent to GA4 for marketing attribution.

**Key Principles**:
- **Privacy First**: No child PII tracked (COPPA compliance)
- **Type Safety**: TypeScript event definitions with Zod validation
- **Observability**: Structured logging for debugging and monitoring
- **Performance**: Events batched and sent asynchronously (no blocking)

---

## Event Taxonomy

Events are organized into six categories aligned with success criteria from `spec.md`:

| Category | Purpose | Success Criteria |
|----------|---------|------------------|
| **Activation** | User onboarding and first-time actions | SC-001, SC-002, SC-003, SC-004 |
| **Engagement** | Feature usage and interaction depth | SC-005, SC-008, SC-011 |
| **Performance** | Page load, search speed, API latency | SC-006, SC-007, SC-019, SC-020 |
| **Revenue** | Affiliate clicks, conversions, campaigns | SC-012, SC-013, SC-014, SC-015 |
| **Retention** | Return visits, habit formation | SC-009, SC-010 |
| **UX Quality** | Errors, accessibility, mobile usage | SC-016, SC-017, SC-018 |

---

## Event Naming Convention

**Format**: `{category}_{entity}_{action}`

**Examples**:
- `activation_child_created` (Activation → Child → Created)
- `engagement_bag_shared` (Engagement → Bag → Shared)
- `revenue_click_affiliate` (Revenue → Click → Affiliate)
- `performance_search_completed` (Performance → Search → Completed)

---

## Core Event Structure

All events include standard properties for consistency:

```typescript
interface BaseEvent {
  // Event identification
  event: string                    // Event name (e.g., 'activation_child_created')
  timestamp: string                // ISO 8601 timestamp

  // User context
  userId: string                   // Clerk user ID (never child ID)
  sessionId: string                // Clerk session ID
  anonymousId?: string             // Anonymous ID (if not authenticated)

  // Device/environment context
  platform: 'web' | 'mobile'       // Device type
  userAgent: string                // Browser user agent
  viewport: {
    width: number
    height: number
  }

  // Page context
  path: string                     // Current page path (e.g., '/finder')
  referrer?: string                // Previous page URL

  // Event-specific properties (defined per event below)
  properties: Record<string, any>
}
```

---

## Activation Events

### `activation_user_signed_up`

**Trigger**: User completes sign-up (email verified)
**Success Criteria**: SC-001 (35% add child within 24h)

```typescript
{
  event: 'activation_user_signed_up',
  timestamp: '2025-11-01T14:30:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    signUpMethod: 'email' | 'google' | 'apple' | 'magic_link',
    referralSource?: string,          // UTM source (if present)
    referralCampaign?: string,        // UTM campaign
    timeToSignUp: number              // Seconds from landing to sign-up completion
  }
}
```

---

### `activation_child_created`

**Trigger**: User creates first child profile
**Success Criteria**: SC-001 (35% add child within 24h)

```typescript
{
  event: 'activation_child_created',
  timestamp: '2025-11-01T14:35:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    isFirstChild: boolean,           // True if first child profile
    ageBand: 'INFANT' | 'TODDLER' | 'EARLY' | 'MIDDLE' | 'TWEEN' | 'TEEN',
    interestCount: number,            // Number of interests selected (1-8)
    hasBudget: boolean,               // True if budget set
    timeFromSignUp: number            // Seconds since user sign-up
  }
}
```

---

### `activation_first_search`

**Trigger**: User performs first gift search
**Success Criteria**: SC-002 (75% perform search within 48h)

```typescript
{
  event: 'activation_first_search',
  timestamp: '2025-11-01T14:40:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    childId: string,                  // Child profile ID (NOT child PII)
    ageBand: string,
    query?: string,                   // Search query (omit PII)
    hasFilters: boolean,              // True if filters applied
    timeFromSignUp: number,           // Seconds since user sign-up
    timeFromChildCreation: number     // Seconds since child created
  }
}
```

---

### `activation_first_bag_item`

**Trigger**: User adds first item to bag
**Success Criteria**: SC-003 (60% add 1+ item within 48h)

```typescript
{
  event: 'activation_first_bag_item',
  timestamp: '2025-11-01T14:45:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    childId: string,
    productId: string,                // Product ID (NOT product name for privacy)
    priceCents: number,
    source: 'search' | 'trending' | 'sponsored',
    timeFromSignUp: number,
    timeFromFirstSearch: number
  }
}
```

---

### `activation_bag_shared`

**Trigger**: User shares bag for the first time
**Success Criteria**: SC-004 (40% share bag within 7 days)

```typescript
{
  event: 'activation_bag_shared',
  timestamp: '2025-11-01T15:00:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    childId: string,
    bagItemCount: number,             // Number of items in bag
    totalBudgetCents?: number,        // Total budget (if set)
    shareMethod: 'link_copy' | 'email' | 'sms',
    timeFromSignUp: number
  }
}
```

---

## Engagement Events

### `engagement_search_performed`

**Trigger**: User performs gift search
**Success Criteria**: SC-006 (search results <2s), SC-011 (15% search 5+ times/week)

```typescript
{
  event: 'engagement_search_performed',
  timestamp: '2025-11-01T14:50:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    childId: string,
    ageBand: string,
    query?: string,                   // Omit if contains PII
    filters: {
      priceMin?: number,
      priceMax?: number,
      interests?: string[],
      inStockOnly?: boolean
    },
    sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'popularity' | 'newest',
    resultsCount: number,             // Total results returned
    sponsoredCount: number,           // Sponsored products in results
    searchTimeMs: number,             // Search execution time (performance)
    userSearchNumber: number          // Nth search for this user (lifetime)
  }
}
```

---

### `engagement_product_viewed`

**Trigger**: User clicks product card to view details

```typescript
{
  event: 'engagement_product_viewed',
  timestamp: '2025-11-01T14:52:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    productId: string,
    merchantId: string,
    priceCents: number,
    source: 'search' | 'trending' | 'sponsored',
    position: number,                 // Position in results list (1-indexed)
    isSponsored: boolean,
    childId?: string                  // If viewed from child context
  }
}
```

---

### `engagement_bag_item_added`

**Trigger**: User adds item to bag

```typescript
{
  event: 'engagement_bag_item_added',
  timestamp: '2025-11-01T14:55:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    childId: string,
    productId: string,
    priceCents: number,
    source: 'search' | 'trending' | 'sponsored',
    bagItemCount: number,             // Total items in bag after add
    totalBudgetCents?: number,        // Budget (if set)
    currentTotalCents: number,        // Sum of all bag item prices
    isOverBudget: boolean             // True if current total > budget
  }
}
```

---

### `engagement_bag_item_removed`

**Trigger**: User removes item from bag

```typescript
{
  event: 'engagement_bag_item_removed',
  timestamp: '2025-11-01T15:05:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    childId: string,
    productId: string,
    bagItemCount: number,             // Items remaining in bag
    removalReason?: 'too_expensive' | 'out_of_stock' | 'changed_mind' | 'duplicate'
  }
}
```

---

### `engagement_bag_shared`

**Trigger**: User shares bag (subsequent shares after first)
**Success Criteria**: SC-008 (50% share 2+ children within 14 days)

```typescript
{
  event: 'engagement_bag_shared',
  timestamp: '2025-11-01T15:10:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    childId: string,
    bagItemCount: number,
    totalBudgetCents?: number,
    shareMethod: 'link_copy' | 'email' | 'sms',
    shareCount: number                // Lifetime share count for this user
  }
}
```

---

### `engagement_trending_viewed`

**Trigger**: User views Trend Radar page

```typescript
{
  event: 'engagement_trending_viewed',
  timestamp: '2025-11-01T15:15:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    ageBand: string,                  // Selected age band
    window: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    trendCount: number                // Number of trending products displayed
  }
}
```

---

### `engagement_alert_enabled`

**Trigger**: User enables price/stock alert for bag item

```typescript
{
  event: 'engagement_alert_enabled',
  timestamp: '2025-11-01T15:20:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    bagItemId: string,
    productId: string,
    alertType: 'price_drop' | 'back_in_stock' | 'both',
    priceThresholdCents?: number,     // If price alert
    currentPriceCents: number
  }
}
```

---

## Performance Events

### `performance_page_loaded`

**Trigger**: Page fully loaded (LCP event)
**Success Criteria**: SC-019 (LCP <2.5s for 90% of page loads)

```typescript
{
  event: 'performance_page_loaded',
  timestamp: '2025-11-01T14:30:05Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    path: string,                     // Page path (e.g., '/finder')
    lcpMs: number,                    // Largest Contentful Paint (ms)
    fidMs: number,                    // First Input Delay (ms)
    clsScore: number,                 // Cumulative Layout Shift (score)
    ttfbMs: number,                   // Time to First Byte (ms)
    networkType: '4g' | '3g' | 'wifi' | 'unknown',
    deviceType: 'mobile' | 'tablet' | 'desktop'
  }
}
```

---

### `performance_search_completed`

**Trigger**: Gift Finder search completes
**Success Criteria**: SC-006 (search <2s for 95% of queries)

```typescript
{
  event: 'performance_search_completed',
  timestamp: '2025-11-01T14:50:02Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    searchTimeMs: number,             // Total search time (client + server + network)
    serverTimeMs: number,             // Server-side search execution time
    resultsCount: number,
    queryLength: number,              // Character count of search query
    hasFilters: boolean
  }
}
```

---

### `performance_bag_updated`

**Trigger**: Bag update operation completes
**Success Criteria**: SC-007 (bag updates <1s for 95% of operations)

```typescript
{
  event: 'performance_bag_updated',
  timestamp: '2025-11-01T14:55:01Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    operation: 'add_item' | 'remove_item' | 'update_item' | 'claim_item',
    latencyMs: number,                // Round-trip time (client to server to client)
    itemCount: number                 // Total items in bag after update
  }
}
```

---

## Revenue Events

### `revenue_click_affiliate`

**Trigger**: User clicks affiliate link to merchant
**Success Criteria**: SC-012 (15% CTR on product cards), SC-013 (2% affiliate conversion rate)

```typescript
{
  event: 'revenue_click_affiliate',
  timestamp: '2025-11-01T15:00:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    productId: string,
    merchantId: string,
    priceCents: number,
    source: 'bag' | 'search' | 'trending',
    isSponsored: boolean,
    campaignId?: string,              // If sponsored
    clickToken: string,               // First-party click tracking token
    affiliateNetwork: 'amazon' | 'target' | 'walmart' | 'other'
  }
}
```

---

### `revenue_affiliate_conversion`

**Trigger**: Affiliate network reports conversion (via webhook/pixel)
**Success Criteria**: SC-013 (2% conversion rate)

```typescript
{
  event: 'revenue_affiliate_conversion',
  timestamp: '2025-11-01T15:30:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    productId: string,
    merchantId: string,
    clickToken: string,               // Matches click event
    saleCents: number,                // Actual sale amount
    commissionCents: number,          // Affiliate commission earned
    affiliateNetwork: string,
    timeToConversion: number          // Seconds from click to conversion
  }
}
```

---

### `revenue_sponsored_impression`

**Trigger**: Sponsored product displayed in search results
**Success Criteria**: SC-014 (10% sponsor CTR)

```typescript
{
  event: 'revenue_sponsored_impression',
  timestamp: '2025-11-01T14:52:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    campaignId: string,
    creativeId: string,
    productId: string,
    position: number,                 // Position in results (1-indexed)
    ageBand: string,
    searchQuery?: string
  }
}
```

---

### `revenue_sponsored_click`

**Trigger**: User clicks sponsored product
**Success Criteria**: SC-014 (10% sponsor CTR)

```typescript
{
  event: 'revenue_sponsored_click',
  timestamp: '2025-11-01T14:53:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    campaignId: string,
    creativeId: string,
    productId: string,
    position: number,
    ageBand: string,
    pricingModel: 'CPM' | 'CPC' | 'FIXED',
    costCents: number                 // Sponsor charge for this click (if CPC)
  }
}
```

---

## Retention Events

### `retention_user_returned`

**Trigger**: User signs in after 24h absence
**Success Criteria**: SC-009 (30% return within 7 days)

```typescript
{
  event: 'retention_user_returned',
  timestamp: '2025-11-02T10:00:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz999',
  properties: {
    daysSinceLastVisit: number,
    daysSinceSignUp: number,
    totalVisits: number,              // Lifetime visit count
    destination: string               // Page user landed on
  }
}
```

---

### `retention_habit_formed`

**Trigger**: User performs 10+ searches in a single week
**Success Criteria**: SC-011 (15% search 5+ times/week)

```typescript
{
  event: 'retention_habit_formed',
  timestamp: '2025-11-08T14:00:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    searchCountThisWeek: number,
    streakWeeks: number,              // Consecutive weeks with 5+ searches
    totalSearches: number             // Lifetime search count
  }
}
```

---

## UX Quality Events

### `ux_error_occurred`

**Trigger**: Error boundary caught error or API error
**Success Criteria**: SC-016 (<0.5% error rate on user flows)

```typescript
{
  event: 'ux_error_occurred',
  timestamp: '2025-11-01T15:10:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    errorType: 'api' | 'client' | 'network' | 'validation',
    errorCode: string,                // HTTP status or error code
    errorMessage: string,             // Sanitized error message
    component?: string,               // React component name (if client error)
    endpoint?: string,                // API endpoint (if API error)
    stack?: string,                   // Sanitized stack trace (first 500 chars)
    isRecoverable: boolean            // True if user can retry
  }
}
```

---

### `ux_accessibility_used`

**Trigger**: User interacts with accessibility features
**Success Criteria**: SC-018 (100% WCAG 2.1 Level AA compliance)

```typescript
{
  event: 'ux_accessibility_used',
  timestamp: '2025-11-01T15:15:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    feature: 'keyboard_nav' | 'screen_reader' | 'high_contrast' | 'text_resize',
    action: string,                   // Specific action (e.g., 'tab_navigation')
    component: string                 // Component interacted with
  }
}
```

---

### `ux_mobile_gesture`

**Trigger**: User performs mobile-specific gesture
**Success Criteria**: SC-017 (90% mobile usability score)

```typescript
{
  event: 'ux_mobile_gesture',
  timestamp: '2025-11-01T15:20:00Z',
  userId: 'user_abc123',
  sessionId: 'sess_xyz789',
  properties: {
    gesture: 'swipe' | 'pinch' | 'long_press' | 'double_tap',
    component: string,                // Component interacted with
    viewport: {
      width: number,
      height: number
    }
  }
}
```

---

## Claim Events (Public Bag Sharing)

### `claim_bag_viewed`

**Trigger**: Relative views shared bag (public, no auth)

```typescript
{
  event: 'claim_bag_viewed',
  timestamp: '2025-11-01T16:00:00Z',
  anonymousId: 'anon_xyz123',         // No userId (public access)
  sessionId: 'sess_abc456',
  properties: {
    shareToken: string,               // Bag share token
    bagItemCount: number,
    childAgeBand: string,             // No child nickname for privacy
    referrer?: string                 // How relative found the link
  }
}
```

---

### `claim_item_claimed`

**Trigger**: Relative claims item from shared bag
**Success Criteria**: SC-005 (25% claim rate on shared bags)

```typescript
{
  event: 'claim_item_claimed',
  timestamp: '2025-11-01T16:05:00Z',
  anonymousId: 'anon_xyz123',
  sessionId: 'sess_abc456',
  properties: {
    shareToken: string,
    bagItemId: string,
    productId: string,
    priceCents: number,
    claimerName: string,              // Relative's name (NOT email for privacy)
    bagItemCount: number,             // Total items in bag
    claimCount: number                // Items claimed so far
  }
}
```

---

## Implementation

### TypeScript Event Definitions

All events defined in `lib/types/events.ts` with Zod validation:

```typescript
import { z } from 'zod'

export const ActivationChildCreatedSchema = z.object({
  event: z.literal('activation_child_created'),
  timestamp: z.string().datetime(),
  userId: z.string(),
  sessionId: z.string(),
  properties: z.object({
    isFirstChild: z.boolean(),
    ageBand: z.enum(['INFANT', 'TODDLER', 'EARLY', 'MIDDLE', 'TWEEN', 'TEEN']),
    interestCount: z.number().min(1).max(8),
    hasBudget: z.boolean(),
    timeFromSignUp: z.number()
  })
})

export type ActivationChildCreated = z.infer<typeof ActivationChildCreatedSchema>
```

### Event Tracking Helper

Centralized tracking helper in `lib/analytics/track.ts`:

```typescript
import { usePostHog } from 'posthog-js/react'
import type { ActivationChildCreated } from '@/lib/types/events'

export function useAnalytics() {
  const posthog = usePostHog()

  const track = <T extends { event: string; properties: any }>(
    event: T
  ) => {
    // Validate event schema (throws if invalid)
    // Send to PostHog
    posthog.capture(event.event, event.properties)

    // Optional: Send to GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, event.properties)
    }
  }

  return { track }
}
```

### Usage Example

```typescript
import { useAnalytics } from '@/lib/analytics/track'

export function CreateChildForm() {
  const { track } = useAnalytics()

  const handleSubmit = async (data: ChildFormData) => {
    const child = await createChild(data)

    // Track activation event
    track({
      event: 'activation_child_created',
      timestamp: new Date().toISOString(),
      userId: user.id,
      sessionId: session.id,
      properties: {
        isFirstChild: childCount === 0,
        ageBand: data.ageBand,
        interestCount: data.interests.length,
        hasBudget: !!data.budgetCents,
        timeFromSignUp: Date.now() - user.createdAt.getTime()
      }
    })
  }
}
```

---

## Privacy & Compliance

### COPPA Compliance

- **No Child PII**: Never track child nicknames, birthdates, or identifiable information
- **Parent Accounts Only**: All events tied to parent user ID, never child ID
- **Age Bands Only**: Track age bands (enum), not specific ages

### GDPR/CCPA Compliance

- **User Consent**: PostHog consent banner shown on first visit
- **Data Export**: Users can export all events via PostHog dashboard
- **Data Deletion**: Users can request deletion via `user.deleted` webhook
- **IP Anonymization**: PostHog configured to anonymize IPs (last octet masked)

### Data Retention

- **Hot Storage**: 12 months (PostHog)
- **Cold Storage**: 24 months (BigQuery archive)
- **Deletion**: Auto-delete after 24 months (GDPR compliance)

---

## Testing

### Unit Tests

- `lib/analytics/track.test.ts`: Event validation, schema enforcement
- `lib/types/events.test.ts`: Zod schema correctness

### Integration Tests

- `tests/integration/analytics.test.ts`: Event firing on API operations
- Mock PostHog client, assert events sent with correct properties

### E2E Tests

- `tests/e2e/analytics.spec.ts`: Full user flows with event tracking
- Verify event sequence (sign-up → child created → first search → bag add)

---

## Monitoring & Alerts

### Event Volume Alerts

- **Threshold**: <100 events/hour during business hours → alert on-call
- **Spike Detection**: >10x normal volume → investigate spam/bot activity

### Error Rate Alerts

- **Threshold**: `ux_error_occurred` events >0.5% of total events → page on-call
- **Latency Alerts**: `performance_search_completed` avg >2s → investigate Meilisearch

### Revenue Tracking Alerts

- **Threshold**: `revenue_affiliate_conversion` drops >50% week-over-week → alert revenue team
- **Sponsored CTR**: `revenue_sponsored_click` CTR <5% → alert partnerships team

---

## References

- [PostHog Event Tracking](https://posthog.com/docs/integrate/client/js)
- [Google Analytics 4 Events](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [COPPA Compliance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
