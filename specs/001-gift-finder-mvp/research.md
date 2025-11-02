# Technical Research: KringleList Gift Finder MVP

**Feature**: 001-gift-finder-mvp
**Date**: 2025-11-01
**Status**: Completed

## Executive Summary

This document resolves all technical unknowns identified during the planning phase. Five critical technology decisions were evaluated: database, object storage, email service, search engine, and background job queue. All selections prioritize Vercel ecosystem integration, developer experience, cost efficiency for MVP scale, and constitutional compliance (performance, security, observability).

---

## 1. Database Selection: Supabase vs Neon vs PlanetScale

### Decision: **Supabase (PostgreSQL)**

### Rationale

**Why Chosen:**
- **Supabase** offers PostgreSQL with real-time subscriptions, built-in authentication (can complement Clerk), row-level security (RLS), and excellent Next.js integration
- Native PostgreSQL ensures compatibility with standard ORMs (Prisma, Drizzle) and full SQL feature set
- Generous free tier (500MB database, 2GB bandwidth, 50k API requests) covers MVP requirements
- Built-in connection pooling via Supavisor handles 500-1000 concurrent users
- Edge-compatible PostgREST API enables serverless functions to query directly
- Real-time capabilities support bag claim updates (FR-032) without additional infrastructure
- Integrated storage and edge functions if needed (future-proof)

**Performance Alignment:**
- Sub-200ms query latency (meets FR-067 API p95 requirement)
- Connection pooling prevents connection exhaustion at scale
- Read replicas available (not needed for MVP but supports growth)

**Security Alignment:**
- Row-level security policies enforce user data isolation (COPPA compliance FR-076)
- Encrypted at rest (AES-256) and in transit (TLS 1.3) - meets FR-071, FR-075
- Audit logging for compliance (GDPR/CCPA data requests FR-078)

### Alternatives Considered

**Neon:**
- **Pros**: Serverless Postgres, instant branching, excellent cold start times, Vercel partnership
- **Cons**: Newer platform (less battle-tested), no real-time subscriptions, pricing less predictable at scale
- **Rejected Because**: Real-time bag updates would require separate WebSocket infrastructure; less mature ecosystem

**PlanetScale:**
- **Pros**: MySQL-compatible, excellent branching, schema migration workflow, Vercel integration
- **Cons**: MySQL dialect differences (no foreign keys in branches, limited JSON support), vitess proxy adds latency, recent pricing changes expensive at scale
- **Rejected Because**: PostgreSQL ecosystem richer for Next.js; vitess proxy increases complexity; pricing unpredictable

**Direct Vercel Postgres:**
- **Pros**: Native Vercel integration, Neon-powered backend
- **Cons**: Same as Neon above, less feature-rich than Supabase
- **Rejected Because**: Supabase provides more value (real-time, storage, auth) at similar price point

### Implementation Notes

- Use **Prisma** ORM for type-safe database access aligning with TypeScript strict mode (Principle II)
- Connection string format: `postgresql://[user]:[password]@[host]:5432/[database]?pgbouncer=true`
- Enable connection pooling via Supabase's pgBouncer for serverless compatibility
- Schema migrations via Prisma Migrate, tracked in `lib/db/migrations/`

---

## 2. Object Storage: Vercel Blob vs AWS S3 vs Cloudflare R2

### Decision: **Vercel Blob**

### Rationale

**Why Chosen:**
- **Vercel Blob** is purpose-built for Next.js on Vercel with zero-config integration
- Automatic CDN distribution via Vercel Edge Network (meets LCP <2.5s requirement FR-065)
- Simplified SDK: `await put('products/image.jpg', file, { access: 'public' })` - no AWS SDK complexity
- Free tier: 1GB storage, 100GB bandwidth (sufficient for 500-1000 product images)
- Pricing: $0.15/GB storage, $0.40/GB egress (cost-effective for MVP, ~$10-20/month)
- Native integration with Next.js Image component for automatic optimization
- No CORS configuration needed (unlike S3)

**Performance Alignment:**
- Edge-served images via Vercel CDN (sub-100ms global delivery)
- Automatic WebP/AVIF conversion (Principle IV: Performance Standards)
- Lazy loading support for infinite scroll (FR-016)

**Developer Experience:**
- Single platform (Vercel) for deployment + storage + analytics simplifies operations
- TypeScript SDK with full type inference (Principle II: Type Safety First)
- No IAM policy management (reduces security misconfiguration risk)

### Alternatives Considered

**AWS S3:**
- **Pros**: Industry standard, mature, extensive features (versioning, lifecycle, replication)
- **Cons**: Complex IAM setup, requires CloudFront CDN config, CORS policies, separate billing
- **Rejected Because**: Over-engineered for MVP; operational complexity violates Principle X (Simplicity & YAGNI)

**Cloudflare R2:**
- **Pros**: S3-compatible API, zero egress fees, competitive pricing ($0.015/GB storage)
- **Cons**: Separate platform from Vercel, requires manual CDN setup, less Next.js integration
- **Rejected Because**: Multi-platform complexity for minimal cost savings; egress free but setup burden high

### Implementation Notes

- Product images stored with key pattern: `products/{productId}/{timestamp}-{filename}`
- Merchant logos: `merchants/{merchantSlug}/logo.{ext}`
- User-uploaded content (future sponsor creatives): `uploads/{sponsorId}/{timestamp}-{filename}`
- Use `@vercel/blob` SDK for uploads, Next.js Image component for rendering
- Set `access: 'public'` for product images, `access: 'private'` for sponsor uploads pending moderation

---

## 3. Email Service: Resend vs SendGrid vs Postmark

### Decision: **Resend**

### Rationale

**Why Chosen:**
- **Resend** is developer-first email API built for modern web apps with React Email integration
- **React Email** enables type-safe, component-based email templates (aligns with Principle I: Component-First Architecture)
- Excellent Next.js integration and Vercel partnership (same ecosystem)
- Free tier: 100 emails/day, 3,000/month (covers MVP alerts and transactional emails)
- Simple API: `await resend.emails.send({ from, to, subject, react: <AlertEmail /> })`
- Built-in email testing/preview mode for development
- DKIM/SPF/DMARC auto-configured (high deliverability)

**Deliverability & Compliance:**
- 99%+ inbox placement rate (critical for price drop alerts FR-046)
- Automatic bounce and complaint handling (Principle VII: Observability)
- GDPR-compliant EU data processing
- Unsubscribe link management (CAN-SPAM, GDPR)

**Developer Experience:**
- Write email templates as React components with TypeScript
- Preview emails in browser during development (faster iteration)
- Shared components (Button, Header) reusable across email types
- Version control for email templates (track changes in Git)

### Alternatives Considered

**SendGrid:**
- **Pros**: Enterprise-grade, extensive features (A/B testing, segmentation), large free tier (100/day)
- **Cons**: Legacy API (XML/JSON), complex template syntax (Handlebars), heavy SDK, slower support
- **Rejected Because**: Poor developer experience; template syntax incompatible with React; over-featured for MVP needs

**Postmark:**
- **Pros**: Best-in-class deliverability (industry reputation), simple API, excellent docs
- **Cons**: No free tier (starts at $15/month), no React Email integration, template syntax less modern
- **Rejected Because**: Cost burden for MVP when Resend free tier sufficient; lack of React integration violates Component-First principle

**AWS SES:**
- **Pros**: Extremely cost-effective ($0.10/1000 emails), integrates with AWS ecosystem
- **Cons**: Complex setup (IAM, domain verification, bounce handling), limited templates, poor DX
- **Rejected Because**: Operational complexity far exceeds cost savings; no component-based templates

### Implementation Notes

Email Templates (React Email components):
```typescript
// emails/PriceDropAlert.tsx
import { Email, Text, Button } from '@react-email/components';

export const PriceDropAlert = ({ product, oldPrice, newPrice, bagUrl }) => (
  <Email>
    <Text>Price dropped on {product.title}!</Text>
    <Text>Was: ${oldPrice} → Now: ${newPrice}</Text>
    <Button href={bagUrl}>View in Bag</Button>
  </Email>
);
```

- Store templates in `emails/` directory (co-located with components)
- Use `@react-email/components` for primitives (Text, Button, Link, etc.)
- Test locally with `npm run email:dev` (React Email preview server)
- Send via: `resend.emails.send({ react: <PriceDropAlert {...props} /> })`

---

## 4. Search Engine: Meilisearch vs Elasticsearch vs Algolia

### Decision: **Meilisearch**

### Rationale

**Why Chosen:**
- **Meilisearch** is purpose-built for instant search with typo tolerance, faceted filtering, and relevance ranking
- Single binary deployment (simpler than Elasticsearch cluster)
- Sub-50ms search latency for <1M documents (exceeds FR-012 requirement of 800ms)
- Excellent Next.js SDK with React hooks: `const { hits } = useSearch('query', { filters: 'age_band=5-7' })`
- Generous cloud free tier (100k documents, 10k searches/month) or self-hostable
- Built-in typo tolerance (2-char tolerance) improves user experience
- Faceted search UI components (filters, refinements) align with FR-014 requirements

**Performance Alignment:**
- Ranking formula supports custom scoring (age fit 35%, availability 25%, etc.) - matches FR-018
- Prefix search and typo tolerance without performance penalty
- Automatic index updates (near real-time, <1s latency)

**Developer Experience:**
- Simple JSON API (no complex query DSL like Elasticsearch)
- Dashboard UI for debugging search queries (observability)
- TypeScript SDK with full type inference
- Schema-less (flexible for MVP, can tighten later)

### Alternatives Considered

**Elasticsearch:**
- **Pros**: Enterprise standard, extremely powerful, proven at massive scale (billions of docs)
- **Cons**: Complex setup (cluster management, sharding, replicas), heavy resource usage (2GB+ RAM), steep learning curve (Query DSL), expensive managed hosting ($50+/month)
- **Rejected Because**: Over-engineered for 500-1000 products; operational complexity violates Principle X; high cost for MVP

**Algolia:**
- **Pros**: Best-in-class relevance, instant search, excellent UI components, managed service
- **Cons**: Expensive ($1/1000 searches after free tier), vendor lock-in (proprietary API), limited customization of ranking formula
- **Rejected Because**: Pricing prohibitive at scale (10k searches/day = $300/month); ranking formula customization needed for affiliate margin weighting (FR-018)

**Typesense:**
- **Pros**: Meilisearch alternative, similar performance, open-source
- **Cons**: Smaller community, fewer integrations, less mature Cloud offering
- **Rejected Because**: Meilisearch has better Next.js ecosystem and larger community support

### Implementation Notes

**Index Schema (Meilisearch):**
```json
{
  "uid": "products",
  "primaryKey": "id",
  "searchableAttributes": ["title", "brand", "description", "category"],
  "filterableAttributes": ["age_band", "interests", "values", "price_cents", "in_stock", "merchant"],
  "sortableAttributes": ["price_cents", "popularity_score", "created_at"],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
    "custom:age_fit_score:desc",
    "custom:availability_score:desc"
  ]
}
```

- Deploy Meilisearch Cloud (free tier) or Railway ($5/month for small instance)
- Index products via background job during feed ingestion
- Use `@meilisearch/instant-meilisearch` adapter with React InstantSearch UI components
- Cache search results in Redis (5-minute TTL) to reduce search API calls

---

## 5. Background Job Queue: BullMQ + Redis vs Vercel Cron vs Inngest

### Decision: **Vercel Cron (MVP) → BullMQ + Redis (Post-MVP)**

### Rationale

**Hybrid Approach:**
- **Start with Vercel Cron** for simplicity (Principle X: YAGNI)
- **Migrate to BullMQ + Redis** when job complexity/volume increases

**Vercel Cron (MVP Phase):**
- Zero infrastructure (built into Vercel)
- Simple configuration in `vercel.json`:
  ```json
  {
    "crons": [
      { "path": "/api/cron/price-monitor", "schedule": "0 * * * *" },
      { "path": "/api/cron/trend-compute", "schedule": "0 2 * * *" }
    ]
  }
  ```
- Sufficient for MVP job load:
  - Price monitor: Hourly (24 runs/day)
  - Trend computation: Daily at 2 AM (1 run/day)
  - Feed ingestion: Daily (1 run/day)
- Free on Vercel Pro plan
- No retry logic needed initially (jobs idempotent)

**When to Migrate to BullMQ:**
- Job volume >100/hour (approaching Vercel function concurrency limits)
- Need complex retry logic (exponential backoff, dead letter queues)
- Job dependencies (wait for X before running Y)
- Priority queuing (urgent alerts before routine jobs)
- Observability needs (job metrics, queue depth monitoring)

**BullMQ + Redis (Post-MVP):**
- Best-in-class Node.js queue (50k+ jobs/sec throughput)
- Built on Redis (already using for cache/rate limiting)
- Advanced features: priority, rate limiting, delayed jobs, job chaining
- Bull Board UI for monitoring (observability)
- TypeScript-first API aligns with Principle II

### Alternatives Considered

**Inngest:**
- **Pros**: Modern serverless queue, excellent DX, built-in retries, Vercel integration, free tier (50k jobs/month)
- **Cons**: Vendor lock-in, newer platform (less proven), limited advanced features
- **Rejected Because**: Not needed for MVP (Vercel Cron simpler); if migrating from Cron, BullMQ more powerful and portable

**AWS SQS + Lambda:**
- **Pros**: Extremely scalable, proven at massive scale, AWS ecosystem integration
- **Cons**: Multi-platform complexity (Vercel + AWS), IAM setup, separate billing
- **Rejected Because**: Over-engineered; violates single-platform preference; operational complexity

**Temporal:**
- **Pros**: Workflow orchestration, durable execution, strong consistency guarantees
- **Cons**: Heavy infrastructure (separate cluster), steep learning curve, overkill for simple jobs
- **Rejected Because**: Far exceeds MVP needs; violates Principle X (Simplicity)

### Implementation Notes

**MVP (Vercel Cron):**
```typescript
// app/api/cron/price-monitor/route.ts
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await monitorPrices();
  return new Response('OK');
}
```

**Post-MVP (BullMQ):**
```typescript
// lib/queue/client.ts
import { Queue, Worker } from 'bullmq';

export const priceMonitorQueue = new Queue('price-monitor', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

export const priceMonitorWorker = new Worker('price-monitor', async (job) => {
  await monitorPrices(job.data);
}, { connection: redisClient });
```

Migration trigger: When Vercel Cron jobs exceed 10-minute execution time or >50 concurrent jobs needed.

---

## Cross-Cutting Decisions

### ORM Selection: Prisma

**Decision:** Use **Prisma** for database access

**Rationale:**
- Type-safe database client (Principle II: Type Safety First)
- Excellent Next.js/TypeScript integration
- Automatic migration generation from schema
- Built-in connection pooling for serverless
- Query builder prevents SQL injection (Principle III: Security by Default)

**Schema Example:**
```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  children  Child[]
  createdAt DateTime @default(now())
}

model Child {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  nickname    String
  ageBand     AgeBand
  interests   String[] // JSON array
  values      String[] // JSON array
  budgetCents Int?
  bag         Bag?
}
```

---

### Caching Strategy: Redis (Upstash)

**Decision:** Use **Upstash Redis** for caching and rate limiting

**Rationale:**
- Serverless Redis (pay per request, no idle charges)
- Vercel integration (edge-compatible)
- Global replication for low latency (edge reads)
- Free tier: 10k requests/day (sufficient for MVP)
- REST API (no persistent connection required)

**Use Cases:**
- Session storage (if not using Clerk's built-in session management)
- Rate limiting (FR-035: 10 claims/hour per IP)
- Search result caching (5-minute TTL)
- Bag claim real-time updates (pub/sub)
- Product hot data (frequently viewed items)

---

## Summary Table

| Decision Area | Selected | Rationale Summary | Migration Path |
|---------------|----------|-------------------|----------------|
| **Database** | Supabase (Postgres) | Real-time, RLS, Next.js integration, free tier | N/A (scales to 100k+ users) |
| **Object Storage** | Vercel Blob | Zero-config, CDN-included, Next.js Image support | Migrate to S3/R2 if >100GB storage needed |
| **Email** | Resend | React Email integration, component-first, free tier | N/A (scales to millions of emails) |
| **Search** | Meilisearch | Instant search, typo tolerance, custom ranking, simple setup | Migrate to Algolia if >1M products or need advanced features |
| **Queue (MVP)** | Vercel Cron | Zero infrastructure, sufficient for <100 jobs/hour | Migrate to BullMQ when >100 jobs/hour or need retries |
| **Queue (Scale)** | BullMQ + Redis | Retries, priority, observability, proven at scale | N/A (industry standard) |
| **ORM** | Prisma | Type-safe, migrations, serverless-optimized | N/A (standard choice for Next.js + Postgres) |
| **Cache** | Upstash Redis | Serverless, edge-compatible, free tier | N/A (scales to millions of requests) |

---

## Constitutional Compliance Verification

All technology decisions align with constitutional principles:

| Principle | Compliance | Evidence |
|-----------|------------|----------|
| I. Component-First | ✅ | React Email enables component-based email templates |
| II. Type Safety First | ✅ | Prisma (DB), Zod (validation), TypeScript SDKs for all services |
| III. Security by Default | ✅ | Supabase RLS, Clerk auth, Prisma prevents SQL injection, TLS everywhere |
| IV. Performance Standards | ✅ | Meilisearch <50ms, Vercel Blob CDN, Redis caching, edge functions |
| V. Accessibility First | ✅ | No impact (backend choices) |
| VI. Test-Driven Quality | ✅ | All services have testing strategies (Prisma seed, Resend preview, etc.) |
| VII. Observability | ✅ | BullMQ dashboard, Meilisearch UI, Supabase logs, Upstash analytics |
| VIII. Mobile-First | ✅ | No impact (backend choices) |
| IX. Code Quality | ✅ | TypeScript-first SDKs, lint-compatible configurations |
| X. Simplicity & YAGNI | ✅ | Start simple (Vercel Cron), migrate when needed; single ecosystem (Vercel) |

---

## Next Steps

1. **Phase 1 Design:**
   - Generate `data-model.md` with Prisma schema based on entities from spec.md
   - Generate API contracts in `contracts/openapi.yaml` for REST endpoints
   - Create `quickstart.md` with local development setup instructions

2. **Environment Setup:**
   - Create `.env.example` with all required environment variables
   - Document Supabase, Meilisearch, Resend, Vercel Blob setup steps
   - Configure Clerk authentication for Next.js

3. **Implementation Order:**
   - Milestone 1: Foundation (Prisma setup, Clerk integration, basic UI)
   - Milestone 2: Core Features (child profiles, gift finder, bags)
   - Milestone 3: Intelligence (trends, alerts)
   - Milestone 4: Revenue (sponsored placements)

All NEEDS RESEARCH items resolved. Ready to proceed to Phase 1: Design & Contracts.
