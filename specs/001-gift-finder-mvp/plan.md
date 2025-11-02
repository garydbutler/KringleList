# Implementation Plan: KringleList Gift Finder MVP

**Branch**: `001-gift-finder-mvp` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-gift-finder-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

KringleList is a SaaS platform that helps parents discover, organize, and share Christmas and birthday gifts for their children through intelligent recommendations and collaborative features. The MVP focuses on six core user stories: child profile creation with personalized gift discovery (P1), gift bag organization and sharing with relatives (P1), budget tracking with visual indicators (P2), trending gift discovery (P2), price/stock alerts (P3), and sponsored product placements (P3). The platform generates revenue through affiliate commissions and sponsored campaigns while maintaining FTC compliance and COPPA privacy standards.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 14+ (App Router), React 18+, Node.js 20+
**Primary Dependencies**: Next.js, React, Tailwind CSS, shadcn/ui, Clerk (auth), TanStack Query, React Hook Form, Zod
**Storage**: PostgreSQL (Supabase recommended), Redis (Upstash recommended), Meilisearch (product search)
**Testing**: Vitest (unit), Playwright (E2E), Supertest (API integration)
**Target Platform**: Web (responsive PWA), deployed on Vercel with edge functions
**Project Type**: Web application (fullstack Next.js)
**Performance Goals**: LCP < 2.5s, TTI < 3.5s, API p95 < 200ms (simple) / 800ms (search), 500-1000 concurrent users
**Constraints**: 99.9% uptime, <0.5% error rate, COPPA compliant (no child PII), FTC compliant (clear affiliate/sponsor labels)
**Scale/Scope**: MVP targets 5-10k DAU, 3-5x traffic during peak season (Nov-Dec), initial catalog 500-1000 products

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check (Phase 0 Gate)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Component-First | Atomic design, <300 lines, single responsibility | ✅ PASS | UI decomposed into atoms (buttons, inputs), molecules (product cards, form fields), organisms (gift finder, bag manager) |
| II. Type Safety First | TypeScript strict, no `any`, branded types for IDs | ✅ PASS | All entities typed, Zod schemas for validation, branded types for tokens/IDs |
| III. Security by Default | Clerk middleware, Zod validation, HTTPS, env vars | ✅ PASS | Clerk handles auth, all inputs validated client + server, no secrets in code |
| IV. Performance Standards | LCP <2.5s, bundle <200KB, code splitting | ✅ PASS | Next.js App Router enables code splitting, image optimization, edge caching |
| V. Accessibility First | WCAG 2.1 AA, ARIA labels, keyboard nav, 4.5:1 contrast | ✅ PASS | Explicit requirement FR-079 through FR-084, success criteria SC-018 |
| VI. Test-Driven Quality | 70% coverage, unit/integration/E2E tests | ✅ PASS | Testing strategy defined, co-located test files, critical flows identified |
| VII. Observability | Structured logging, error boundaries, Sentry, Vercel Analytics | ✅ PASS | Error tracking (Sentry), analytics (PostHog/GA4), rate limits, alerts |
| VIII. Mobile-First | Responsive breakpoints, 44x44px touch targets | ✅ PASS | Mobile-first design, Tailwind breakpoints, 50%+ mobile traffic expected |
| IX. Code Quality | ESLint, Prettier, Husky hooks, max 50-line functions | ✅ PASS | Tooling configured, pre-commit hooks, code review required |
| X. Simplicity & YAGNI | Justify complexity, evaluate simpler alternatives | ✅ PASS | Clear out-of-scope section, assumptions documented, no premature optimization |

**Technology Stack Alignment:**
- ✅ Frontend: React 18+, TypeScript strict mode
- ✅ Build Tool: Next.js 14+ (App Router)
- ✅ Styling: Tailwind CSS + shadcn/ui
- ✅ State: TanStack Query (server state), React Context/Zustand (client state)
- ✅ Forms: React Hook Form + Zod
- ✅ Auth: Clerk
- ✅ Deployment: Vercel
- ⚠️ Database: **NEEDS RESEARCH** - Supabase vs Neon vs PlanetScale
- ⚠️ Storage: **NEEDS RESEARCH** - Vercel Blob vs S3 vs Cloudflare R2
- ⚠️ Email: **NEEDS RESEARCH** - Resend vs SendGrid vs Postmark
- ⚠️ Search: **NEEDS RESEARCH** - Meilisearch vs Elasticsearch vs Algolia
- ⚠️ Queue: **NEEDS RESEARCH** - BullMQ + Redis vs Vercel Cron vs Inngest

**File Structure Compliance:**
Project follows mandated Next.js App Router structure from constitution:
```
src/
├── app/                    # Next.js app directory (routes, layouts, server actions)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── features/          # Feature-specific components (gift-finder, bag, trends, etc.)
│   ├── layouts/           # Layout components
│   └── forms/             # Form components
├── lib/
│   ├── api/               # API client and utilities
│   ├── auth/              # Clerk authentication utilities
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── stores/                # State management stores (if using Zustand)
├── styles/                # Global styles and Tailwind config
├── middleware/            # Clerk middleware and route protection
└── public/                # Static assets
```

### Post-Design Check (Phase 1 Gate)

**Status**: ✅ PASS - All design artifacts generated and reviewed

| Principle | Design Verification | Status | Evidence |
|-----------|---------------------|--------|----------|
| I. Component-First | Data model supports component decomposition | ✅ PASS | Entity relationships allow independent component data fetching (Child, Bag, BagItem, Product) |
| II. Type Safety First | Prisma schema + Zod validation enforces types | ✅ PASS | All entities typed with Prisma, Zod schemas defined in data-model.md for runtime validation |
| III. Security by Default | Row-level security, auth middleware, webhook verification | ✅ PASS | Supabase RLS policies referenced, Clerk middleware configured, webhook signatures verified (auth.md, webhooks.md) |
| IV. Performance Standards | Indexes, caching strategy, edge compatibility | ✅ PASS | Comprehensive indexing strategy in data-model.md, Redis caching layer, Vercel edge functions for click router |
| V. Accessibility First | API contracts support screen readers, keyboard nav | ✅ PASS | OpenAPI schema includes semantic field names, error messages accessible, ARIA labels in UI components (to be implemented) |
| VI. Test-Driven Quality | Testable API contracts, clear success criteria | ✅ PASS | OpenAPI contract defines request/response schemas, analytics events.md enables success criteria tracking |
| VII. Observability | Analytics events, error tracking, webhook logging | ✅ PASS | Comprehensive events.md schema (30+ event types), Sentry integration, webhook logging in webhooks.md |
| VIII. Mobile-First | API designed for mobile (minimal payloads, pagination) | ✅ PASS | OpenAPI includes pagination, limit/offset params, mobile-optimized image URLs (Vercel Blob CDN) |
| IX. Code Quality | OpenAPI schema enforces contracts, types auto-generated | ✅ PASS | OpenAPI 3.1 schema enables codegen for type-safe API clients, Zod schemas enforce validation |
| X. Simplicity & YAGNI | Start simple (Vercel Cron), migrate when needed (BullMQ) | ✅ PASS | Research.md documents hybrid approach: Vercel Cron for MVP, BullMQ post-MVP when complexity requires |

**Technology Stack Re-Validation** (all NEEDS RESEARCH items resolved):
- ✅ Database: **Supabase (PostgreSQL)** - real-time, RLS, Next.js integration (research.md)
- ✅ Storage: **Vercel Blob** - zero-config, CDN-included, Next.js Image optimization (research.md)
- ✅ Email: **Resend** - React Email integration, component-first templates (research.md)
- ✅ Search: **Meilisearch** - instant search, typo tolerance, custom ranking (research.md)
- ✅ Queue: **Vercel Cron → BullMQ** - start simple, scale when needed (research.md)
- ✅ ORM: **Prisma** - type-safe, migrations, edge-compatible (data-model.md)
- ✅ Cache: **Upstash Redis** - serverless, edge-compatible, real-time pub/sub (research.md)

**Design Artifacts Review**:

1. **data-model.md** ✅
   - 18 entity types defined with Prisma schema
   - All relationships mapped (1:1, 1:N, N:M)
   - Indexes cover all hot queries
   - COPPA compliance enforced at schema level (no child PII)
   - Validation rules (Zod) ensure data integrity
   - Migration strategy documented

2. **contracts/openapi.yaml** ✅
   - 25 API endpoints defined with full request/response schemas
   - Authentication (Clerk JWT) on all protected routes
   - Rate limiting specified per endpoint
   - Error responses standardized (400, 401, 403, 404, 429)
   - Pagination support on list endpoints
   - FTC/COPPA compliance notes in descriptions

3. **contracts/auth.md** ✅
   - 5 authentication flows documented (sign-up, sign-in, sign-out, refresh, password reset)
   - Clerk middleware configuration with route protection rules
   - Session management (JWT structure, expiration, revocation)
   - Role-based access control (PARENT, SPONSOR, ADMIN)
   - Webhook integration (5 events: user.created, user.updated, user.deleted, session.created, session.ended)
   - MFA support detailed (TOTP, SMS, backup codes)
   - Security best practices (HTTPS, CSRF, rate limiting, audit logging)

4. **contracts/events.md** ✅
   - 30+ analytics events across 6 categories (Activation, Engagement, Performance, Revenue, Retention, UX Quality)
   - Event taxonomy aligned with success criteria from spec.md
   - TypeScript event definitions with Zod validation
   - Privacy-first (no child PII tracked)
   - COPPA/GDPR compliance notes
   - PostHog + GA4 dual tracking

5. **contracts/webhooks.md** ✅
   - Clerk webhooks (5 events): user lifecycle, session management
   - Stripe webhooks (2 events, post-MVP): payment success, payment failed
   - Webhook verification (Svix, Stripe signatures)
   - Idempotency strategies for all handlers
   - Retry policies, error handling, monitoring
   - Security best practices (signature verification, timestamp validation, HTTPS only)

6. **quickstart.md** ✅
   - Comprehensive local setup guide (13 steps)
   - Service configuration instructions (Clerk, Supabase, Meilisearch, Upstash, Resend, PostHog, Sentry)
   - Environment variable template with all required values
   - Common commands reference
   - Troubleshooting guide for common setup issues
   - Links to official documentation

**Conclusion**: All constitutional principles satisfied by design artifacts. No violations detected. Ready to proceed to Phase 2 (task generation via `/speckit.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/001-gift-finder-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── openapi.yaml     # REST API contract
│   ├── auth.md          # Clerk authentication flows
│   ├── events.md        # Analytics events schema
│   └── webhooks.md      # External webhooks (Clerk, Stripe)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web application structure (Next.js App Router fullstack)
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth routes group
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/               # Protected routes group
│   │   ├── children/
│   │   │   ├── page.tsx           # Child profile list
│   │   │   ├── new/page.tsx       # Create child profile
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Child detail
│   │   │       └── edit/page.tsx  # Edit child profile
│   │   ├── finder/
│   │   │   └── page.tsx           # Gift Finder search
│   │   ├── bags/
│   │   │   └── [childId]/page.tsx # Child's gift bag
│   │   ├── trends/
│   │   │   └── page.tsx           # Trend Radar
│   │   ├── alerts/
│   │   │   └── page.tsx           # Alert history & settings
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Parent dashboard
│   │   └── layout.tsx             # Dashboard layout (requires auth)
│   ├── (public)/                  # Public routes
│   │   ├── shared/
│   │   │   └── bag/[token]/page.tsx  # Public shared bag view
│   │   ├── advertise/page.tsx     # Sponsor landing page
│   │   └── layout.tsx
│   ├── api/                       # API routes
│   │   ├── children/
│   │   │   ├── route.ts           # GET, POST /api/children
│   │   │   └── [id]/route.ts      # GET, PATCH, DELETE /api/children/:id
│   │   ├── bags/
│   │   │   ├── [childId]/route.ts
│   │   │   └── [bagId]/
│   │   │       ├── items/route.ts
│   │   │       └── share/route.ts
│   │   ├── bag-items/
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── alerts/route.ts
│   │   │       └── claim/route.ts
│   │   ├── finder/
│   │   │   └── search/route.ts
│   │   ├── trends/route.ts
│   │   ├── alerts/
│   │   │   ├── history/route.ts
│   │   │   └── settings/route.ts
│   │   ├── campaigns/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── creatives/route.ts
│   │   │       └── report/route.ts
│   │   ├── shared/
│   │   │   └── bags/[token]/route.ts
│   │   ├── webhooks/
│   │   │   ├── clerk/route.ts
│   │   │   └── stripe/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx                 # Root layout (Clerk provider, analytics)
│   ├── page.tsx                   # Homepage
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   └── ... (other shadcn components)
│   ├── features/
│   │   ├── child-profile/
│   │   │   ├── ChildProfileForm.tsx
│   │   │   ├── ChildProfileCard.tsx
│   │   │   └── ChildProfileList.tsx
│   │   ├── gift-finder/
│   │   │   ├── GiftFinderSearch.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductSort.tsx
│   │   │   └── InfiniteProductGrid.tsx
│   │   ├── bag/
│   │   │   ├── BagItemList.tsx
│   │   │   ├── BagItemCard.tsx
│   │   │   ├── BudgetThermometer.tsx
│   │   │   ├── ShareBagButton.tsx
│   │   │   └── ClaimButton.tsx
│   │   ├── trends/
│   │   │   ├── TrendSection.tsx
│   │   │   ├── TrendCard.tsx
│   │   │   └── TrendBadge.tsx
│   │   ├── alerts/
│   │   │   ├── AlertSettings.tsx
│   │   │   ├── AlertHistoryList.tsx
│   │   │   └── AlertCard.tsx
│   │   └── sponsored/
│   │       ├── SponsoredCard.tsx
│   │       ├── SponsorDashboard.tsx
│   │       └── CampaignForm.tsx
│   ├── layouts/
│   │   ├── DashboardLayout.tsx
│   │   ├── PublicLayout.tsx
│   │   └── Header.tsx
│   └── forms/
│       ├── ChildProfileForm.tsx
│       ├── AlertSettingsForm.tsx
│       └── CampaignForm.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts              # API client setup (fetch wrapper)
│   │   ├── children.ts            # Child profile API calls
│   │   ├── bags.ts                # Bag API calls
│   │   ├── finder.ts              # Gift Finder API calls
│   │   ├── trends.ts              # Trends API calls
│   │   ├── alerts.ts              # Alerts API calls
│   │   └── campaigns.ts           # Campaigns API calls
│   ├── auth/
│   │   ├── middleware.ts          # Clerk middleware config
│   │   ├── permissions.ts         # Permission helpers
│   │   └── session.ts             # Session utilities
│   ├── db/
│   │   ├── client.ts              # Database client (Prisma/Drizzle)
│   │   ├── schema.ts              # Database schema
│   │   └── migrations/            # Migration files
│   ├── search/
│   │   ├── client.ts              # Meilisearch/ES client
│   │   ├── indexer.ts             # Product indexing
│   │   └── ranking.ts             # Search ranking logic
│   ├── queue/
│   │   ├── client.ts              # BullMQ/queue client
│   │   ├── jobs/
│   │   │   ├── feed-ingestion.ts
│   │   │   ├── price-monitor.ts
│   │   │   ├── alert-dispatcher.ts
│   │   │   └── trend-compute.ts
│   │   └── workers/
│   ├── affiliates/
│   │   ├── router.ts              # Click router logic
│   │   ├── networks.ts            # Affiliate network configs
│   │   └── tracking.ts            # Click tracking
│   ├── hooks/
│   │   ├── useChildren.ts
│   │   ├── useBag.ts
│   │   ├── useFinder.ts
│   │   ├── useTrends.ts
│   │   ├── useAlerts.ts
│   │   └── useCampaigns.ts
│   ├── utils/
│   │   ├── cn.ts                  # Tailwind class merger
│   │   ├── validation.ts          # Zod schemas
│   │   ├── formatters.ts          # Price, date formatters
│   │   └── constants.ts           # App constants
│   └── types/
│       ├── entities.ts            # Entity type definitions
│       ├── api.ts                 # API request/response types
│       └── enums.ts               # Enums (age bands, statuses, etc.)
├── stores/                        # Zustand stores (if needed)
│   └── ui.ts                      # UI state (modals, toasts, etc.)
├── middleware.ts                  # Clerk auth middleware (root level)
├── styles/
│   └── globals.css                # Tailwind directives
└── public/
    ├── images/
    ├── icons/
    └── fonts/

tests/
├── unit/                          # Unit tests (Vitest)
│   ├── lib/
│   │   ├── utils.test.ts
│   │   ├── ranking.test.ts
│   │   └── validation.test.ts
│   └── components/
│       ├── ProductCard.test.tsx
│       └── BudgetThermometer.test.tsx
├── integration/                   # API integration tests (Supertest)
│   ├── children.test.ts
│   ├── bags.test.ts
│   ├── finder.test.ts
│   └── alerts.test.ts
└── e2e/                           # E2E tests (Playwright)
    ├── auth.spec.ts
    ├── child-profile.spec.ts
    ├── gift-finder.spec.ts
    ├── bag-sharing.spec.ts
    └── alerts.spec.ts
```

**Structure Decision**: Selected Web Application structure using Next.js App Router pattern. This choice aligns with the constitution's mandated structure and supports the fullstack SaaS requirements. The app router enables:
- Server Components for initial page loads (performance)
- Server Actions for mutations (type-safe, no separate API layer needed for some operations)
- Automatic code splitting per route (bundle size)
- Edge runtime support for click router and public bag views
- Co-located API routes for external integrations

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations detected. All complexity is justified by feature requirements:

| Component | Complexity Introduced | Justification | Simpler Alternative Rejected |
|-----------|----------------------|---------------|------------------------------|
| Product Search Engine | Separate Meilisearch/ES service | Full-text search, faceted filtering, ranking across 500-1000+ products; SQL LIKE inadequate for relevance, performance, and typo tolerance | SQL full-text search - rejected due to poor relevance ranking, no typo tolerance, slow performance at scale |
| Background Job Queue | BullMQ + Redis or Vercel Cron | Hourly price monitoring, trend computation, feed ingestion require scheduled jobs with retry logic and failure handling | Vercel Cron alone - rejected for complex workflows requiring retries, job prioritization, and observability |
| Redis Cache Layer | Separate Redis instance | Sub-second bag updates, real-time claim status, hot product data, rate limiting require fast in-memory storage | Database-only - rejected due to inability to meet <1s bag update requirement (SC-007) and rate limiting needs |
| Clerk Authentication | Third-party auth service | COPPA compliance, MFA, social login, session management, security best practices; building custom auth violates security principle | Custom auth - rejected as high-risk security violation, significant engineering effort, COPPA compliance burden |
| Affiliate Click Router | Edge function middleware | First-party attribution, network agnostic routing, analytics tracking, sub-200ms redirect requirement | Direct affiliate links - rejected due to attribution loss, inability to track sources, no fallback logic |

All justified complexity directly supports constitutional principles (Security by Default, Performance Standards, Observability) or non-negotiable feature requirements (COPPA compliance, affiliate revenue, real-time updates).
