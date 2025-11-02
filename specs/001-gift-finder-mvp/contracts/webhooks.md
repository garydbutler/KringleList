# Webhook Contracts: KringleList Gift Finder MVP

**Date**: 2025-11-01
**Version**: 1.0.0

## Overview

KringleList consumes webhooks from external services (Clerk, Stripe) and exposes webhook endpoints for internal automation and affiliate network integrations. This document defines all webhook contracts, verification methods, retry policies, and error handling.

**Key Principles**:
- **Security First**: All webhooks verified with signatures (HMAC-SHA256)
- **Idempotency**: Webhooks handled idempotently (safe to retry)
- **Fast Response**: Acknowledge webhooks within 5 seconds (async processing)
- **Observability**: All webhook events logged for debugging and monitoring

---

## Incoming Webhooks

### 1. Clerk Webhooks

**Purpose**: Sync user lifecycle events (sign-up, deletion, session management)
**Endpoint**: `POST /api/webhooks/clerk`
**Verification**: Svix signature (Clerk's webhook provider)
**Rate Limit**: None (trusted source)

#### Webhook Events

##### `user.created`

**Trigger**: User completes sign-up and email verification
**Action**: Create `User` record in database

**Payload Example**:
```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123def456",
    "email_addresses": [
      {
        "email_address": "parent@example.com",
        "id": "idn_xyz789",
        "verification": {
          "status": "verified",
          "strategy": "email_code"
        }
      }
    ],
    "first_name": "Jane",
    "last_name": "Doe",
    "created_at": 1698768000000,
    "updated_at": 1698768000000,
    "public_metadata": {
      "role": "PARENT"
    }
  }
}
```

**Handler Logic**:
```typescript
async function handleUserCreated(data: ClerkUserCreatedEvent) {
  const primaryEmail = data.email_addresses.find(e => e.id === data.primary_email_address_id)

  await prisma.user.create({
    data: {
      id: data.id,  // Use Clerk user ID as primary key
      email: primaryEmail.email_address,
      firstName: data.first_name || null,
      lastName: data.last_name || null,
      role: (data.public_metadata.role as Role) || 'PARENT',
      clerkMetadata: data,  // Store full payload for reference
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  })

  // Track activation event
  await trackEvent({
    event: 'activation_user_signed_up',
    userId: data.id,
    properties: {
      signUpMethod: 'email',  // Detect from data.external_accounts
      referralSource: data.public_metadata.utm_source,
      timeToSignUp: 0  // First event, no baseline
    }
  })
}
```

**Idempotency**: Check if `User` with ID exists before insert (upsert pattern)

---

##### `user.updated`

**Trigger**: User updates profile (name, email, metadata)
**Action**: Sync changes to `User` record

**Payload Example**:
```json
{
  "type": "user.updated",
  "data": {
    "id": "user_2abc123def456",
    "email_addresses": [...],
    "first_name": "Jane",
    "last_name": "Smith",  // Changed from Doe
    "updated_at": 1698771600000,
    "public_metadata": {
      "role": "SPONSOR"  // Role upgraded
    }
  }
}
```

**Handler Logic**:
```typescript
async function handleUserUpdated(data: ClerkUserUpdatedEvent) {
  const primaryEmail = data.email_addresses.find(e => e.id === data.primary_email_address_id)

  await prisma.user.update({
    where: { id: data.id },
    data: {
      email: primaryEmail.email_address,
      firstName: data.first_name || null,
      lastName: data.last_name || null,
      role: (data.public_metadata.role as Role) || 'PARENT',
      clerkMetadata: data,
      updatedAt: new Date(data.updated_at)
    }
  })
}
```

**Idempotency**: Update is idempotent (same payload produces same result)

---

##### `user.deleted`

**Trigger**: User deletes account via Clerk dashboard or API
**Action**: Cascade delete all user data (GDPR/CCPA compliance)

**Payload Example**:
```json
{
  "type": "user.deleted",
  "data": {
    "id": "user_2abc123def456",
    "deleted": true
  }
}
```

**Handler Logic**:
```typescript
async function handleUserDeleted(data: ClerkUserDeletedEvent) {
  // Cascade delete via Prisma schema (onDelete: Cascade)
  await prisma.user.delete({
    where: { id: data.id }
  })

  // Explicitly log deletion for audit trail
  await prisma.auditLog.create({
    data: {
      action: 'USER_DELETED',
      userId: data.id,
      timestamp: new Date(),
      metadata: { clerkEvent: data }
    }
  })
}
```

**Cascade Deletes** (via Prisma schema):
- `Children` → `Bag` → `BagItem` → `Claim`
- `ClickEvent` (user's clicks)
- `Newsletter` subscriptions
- Sponsor data (if role = SPONSOR): `Sponsor` → `Campaign` → `Creative` → `SponsoredSlot`

**Idempotency**: Check if user exists before delete (no-op if already deleted)

---

##### `session.created`

**Trigger**: User signs in (new session started)
**Action**: Log sign-in event for analytics and security

**Payload Example**:
```json
{
  "type": "session.created",
  "data": {
    "id": "sess_xyz789abc123",
    "user_id": "user_2abc123def456",
    "client_id": "client_abc123",
    "created_at": 1698768000000,
    "expire_at": 1698771600000,
    "status": "active",
    "last_active_at": 1698768000000
  }
}
```

**Handler Logic**:
```typescript
async function handleSessionCreated(data: ClerkSessionCreatedEvent) {
  // Track sign-in event
  await trackEvent({
    event: 'retention_user_returned',  // If returning user
    userId: data.user_id,
    sessionId: data.id,
    properties: {
      daysSinceLastVisit: calculateDaysSinceLastVisit(data.user_id),
      daysSinceSignUp: calculateDaysSinceSignUp(data.user_id),
      totalVisits: await getUserVisitCount(data.user_id),
      destination: '/'  // Default, actual destination from client-side event
    }
  })

  // Log for security audit
  await prisma.sessionLog.create({
    data: {
      sessionId: data.id,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expire_at)
    }
  })
}
```

**Idempotency**: Session logs allow duplicates (no unique constraint on sessionId)

---

##### `session.ended`

**Trigger**: User signs out or session expires
**Action**: Log sign-out event

**Payload Example**:
```json
{
  "type": "session.ended",
  "data": {
    "id": "sess_xyz789abc123",
    "user_id": "user_2abc123def456",
    "ended_at": 1698771600000,
    "status": "ended"
  }
}
```

**Handler Logic**:
```typescript
async function handleSessionEnded(data: ClerkSessionEndedEvent) {
  await prisma.sessionLog.update({
    where: { sessionId: data.id },
    data: {
      endedAt: new Date(data.ended_at),
      status: 'ended'
    }
  })
}
```

---

#### Webhook Verification

**Method**: Svix signature verification (HMAC-SHA256)

```typescript
import { Webhook } from 'svix'

export async function POST(req: Request) {
  const payload = await req.text()
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let evt
  try {
    evt = wh.verify(payload, headers) as ClerkWebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Route to handler based on event type
  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data)
      break
    case 'user.updated':
      await handleUserUpdated(evt.data)
      break
    case 'user.deleted':
      await handleUserDeleted(evt.data)
      break
    case 'session.created':
      await handleSessionCreated(evt.data)
      break
    case 'session.ended':
      await handleSessionEnded(evt.data)
      break
    default:
      console.log(`Unhandled event type: ${evt.type}`)
  }

  return new Response('Webhook received', { status: 200 })
}
```

---

### 2. Stripe Webhooks

**Purpose**: Handle payment events for sponsored campaigns (post-MVP)
**Endpoint**: `POST /api/webhooks/stripe`
**Verification**: Stripe signature (HMAC-SHA256 with timestamp)
**Rate Limit**: None (trusted source)

**Note**: Stripe integration is **not included in MVP** but contract defined for future implementation.

#### Webhook Events

##### `checkout.session.completed`

**Trigger**: Sponsor completes campaign payment
**Action**: Activate campaign, update budget

**Payload Example**:
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_abc123",
      "amount_total": 50000,  // $500.00 in cents
      "currency": "usd",
      "customer": "cus_xyz789",
      "payment_status": "paid",
      "metadata": {
        "campaignId": "campaign_abc123"
      }
    }
  }
}
```

**Handler Logic**:
```typescript
async function handleCheckoutSessionCompleted(data: StripeCheckoutSession) {
  const campaignId = data.object.metadata.campaignId

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'ACTIVE',
      budgetCents: data.object.amount_total,
      paidAt: new Date()
    }
  })

  // Send confirmation email to sponsor
  await sendEmail({
    to: sponsor.email,
    template: 'campaign_activated',
    data: { campaignId, budgetCents: data.object.amount_total }
  })
}
```

---

##### `invoice.payment_failed`

**Trigger**: Sponsor payment fails (e.g., card declined)
**Action**: Pause campaign, notify sponsor

**Payload Example**:
```json
{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_abc123",
      "customer": "cus_xyz789",
      "amount_due": 50000,
      "attempt_count": 2,
      "metadata": {
        "campaignId": "campaign_abc123"
      }
    }
  }
}
```

**Handler Logic**:
```typescript
async function handleInvoicePaymentFailed(data: StripeInvoice) {
  const campaignId = data.object.metadata.campaignId

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'PAUSED',
      pauseReason: 'PAYMENT_FAILED'
    }
  })

  // Notify sponsor
  await sendEmail({
    to: sponsor.email,
    template: 'payment_failed',
    data: { campaignId, amountDue: data.object.amount_due }
  })
}
```

---

#### Webhook Verification

**Method**: Stripe signature verification

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data)
      break
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return new Response('Webhook received', { status: 200 })
}
```

---

### 3. Affiliate Network Webhooks (Future)

**Purpose**: Receive conversion events from affiliate networks (Amazon Associates, Target Affiliates, etc.)
**Endpoint**: `POST /api/webhooks/affiliate/:network`
**Verification**: Network-specific signature or API key
**Status**: **Not in MVP** (conversion tracking via client-side pixel initially)

**Supported Networks** (post-MVP):
- Amazon Associates (Server-to-Server conversions)
- Impact Radius (performance marketing platform)
- CJ Affiliate (Commission Junction)

---

## Outgoing Webhooks

KringleList does **not expose outgoing webhooks in MVP**. Future use cases:

1. **Bag Claim Notifications**: Webhook to notify parent when relative claims item
2. **Price Alert Notifications**: Webhook to external notification services (e.g., Twilio, SendGrid)
3. **Analytics Export**: Webhook to send events to external data warehouse

---

## Webhook Infrastructure

### Endpoint Configuration

| Webhook Source | Endpoint | Authentication | Timeout |
|----------------|----------|----------------|---------|
| Clerk | `/api/webhooks/clerk` | Svix signature | 5s |
| Stripe | `/api/webhooks/stripe` | Stripe signature | 5s |
| Affiliate Networks | `/api/webhooks/affiliate/:network` | API key or signature | 5s |

### Rate Limiting

- **Clerk/Stripe**: No rate limit (trusted sources)
- **Affiliate Networks**: 100 requests/minute per network (prevent abuse)

### Retry Policy

**Clerk/Stripe Retry Behavior**:
- **Retry Count**: 5 attempts
- **Backoff**: Exponential (1s, 2s, 4s, 8s, 16s)
- **Timeout**: 5 seconds per attempt
- **Final Failure**: Webhook marked as failed in provider dashboard

**KringleList Handler Response**:
- **Success**: Return `200 OK` within 5 seconds
- **Transient Error**: Return `5xx` (triggers retry)
- **Permanent Error**: Return `4xx` (no retry)

### Error Handling

```typescript
export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req)

    // Process webhook
    await handleWebhook(evt)

    return new Response('Webhook processed', { status: 200 })
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      // Invalid signature (no retry)
      return new Response('Invalid signature', { status: 400 })
    }

    if (err instanceof DatabaseError) {
      // Transient error (retry)
      console.error('Database error processing webhook:', err)
      return new Response('Server error', { status: 500 })
    }

    // Unknown error (retry)
    console.error('Unexpected webhook error:', err)
    return new Response('Server error', { status: 500 })
  }
}
```

---

## Idempotency

All webhook handlers MUST be idempotent to safely handle retries.

### Idempotency Strategies

| Event | Strategy |
|-------|----------|
| `user.created` | Upsert user by ID (ignore duplicate key error) |
| `user.updated` | Update is naturally idempotent |
| `user.deleted` | Check existence before delete (no-op if already deleted) |
| `session.created` | Allow duplicate session logs (no unique constraint) |
| `checkout.session.completed` | Check campaign status before activation (no-op if already ACTIVE) |

### Idempotency Key (Future Enhancement)

For critical webhooks (e.g., payments), store idempotency key to prevent duplicate processing:

```typescript
async function handleWebhook(evt: WebhookEvent) {
  const idempotencyKey = evt.id  // Use webhook event ID

  // Check if already processed
  const existing = await prisma.webhookLog.findUnique({
    where: { eventId: idempotencyKey }
  })

  if (existing) {
    console.log(`Webhook ${idempotencyKey} already processed`)
    return  // No-op
  }

  // Process webhook
  await processWebhook(evt)

  // Record as processed
  await prisma.webhookLog.create({
    data: {
      eventId: idempotencyKey,
      type: evt.type,
      processedAt: new Date()
    }
  })
}
```

---

## Monitoring & Alerts

### Webhook Logs

All webhooks logged to database for debugging:

```prisma
model WebhookLog {
  id          String   @id @default(uuid())
  eventId     String   @unique  // Webhook event ID (idempotency key)
  source      String              // 'clerk', 'stripe', 'affiliate'
  type        String              // Event type (e.g., 'user.created')
  payload     Json                // Full webhook payload
  status      String              // 'success', 'failed'
  errorMsg    String?             // Error message (if failed)
  processedAt DateTime  @default(now())

  @@index([source, type])
  @@index([processedAt])
  @@map("webhook_logs")
}
```

### Alerts

| Condition | Alert | Severity |
|-----------|-------|----------|
| Webhook verification failed (3+ in 5 min) | Slack alert | Warning |
| Webhook processing failed (5+ in 5 min) | Page on-call | Critical |
| Webhook latency >3s (avg over 1 hour) | Slack alert | Warning |
| `user.deleted` webhook (GDPR deletion) | Log to compliance dashboard | Info |

### Monitoring Dashboard

**Metrics tracked**:
- Webhook volume (by source, type)
- Success/failure rate
- Processing latency (p50, p95, p99)
- Retry count distribution

**Tools**: Vercel Analytics, Sentry (error tracking), PostHog (custom events)

---

## Testing

### Unit Tests

- `lib/webhooks/verify.test.ts`: Signature verification
- `lib/webhooks/handlers.test.ts`: Individual event handlers

### Integration Tests

- `tests/integration/webhooks.test.ts`:
  - Valid webhook accepted and processed
  - Invalid signature rejected with 400
  - Idempotency: duplicate webhook no-ops
  - Cascade delete on `user.deleted`

### E2E Tests (Staging)

- Trigger real Clerk events (sign-up, delete user)
- Verify database changes
- Monitor webhook logs

---

## Security Best Practices

### 1. Signature Verification

**ALWAYS verify signatures** before processing webhooks:
- Clerk: Svix signature (HMAC-SHA256)
- Stripe: Stripe signature (HMAC-SHA256 + timestamp)
- Custom webhooks: HMAC-SHA256 with shared secret

### 2. Timestamp Validation

Reject webhooks with old timestamps (prevent replay attacks):

```typescript
const timestamp = parseInt(headers['svix-timestamp'])
const now = Math.floor(Date.now() / 1000)

if (Math.abs(now - timestamp) > 300) {  // 5 minute tolerance
  throw new Error('Webhook timestamp too old')
}
```

### 3. HTTPS Only

- **Production**: HTTPS required for all webhook endpoints
- **Local Dev**: Use ngrok or Clerk's local testing tools

### 4. Rate Limiting

- Prevent abuse from untrusted sources
- Trusted sources (Clerk, Stripe) exempt from rate limits

### 5. Secrets Management

- Store webhook secrets in environment variables
- Rotate secrets quarterly (Clerk Dashboard → Webhooks → Signing Secret)

---

## Environment Variables

```bash
# Clerk Webhook Secret (from Clerk Dashboard → Webhooks)
CLERK_WEBHOOK_SECRET=whsec_abc123def456...

# Stripe Webhook Secret (from Stripe Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xyz789abc123...

# Affiliate Network API Keys (future)
AMAZON_ASSOCIATES_API_KEY=...
IMPACT_RADIUS_API_KEY=...
```

---

## Troubleshooting

### Webhook Not Received

**Check**:
1. Webhook URL correct in provider dashboard (Clerk, Stripe)
2. HTTPS endpoint accessible (test with `curl`)
3. No firewall blocking requests
4. Vercel deployment successful (webhook endpoint deployed)

### Signature Verification Failed

**Check**:
1. Webhook secret correct (`CLERK_WEBHOOK_SECRET`)
2. Secret not expired or rotated
3. Payload not modified in transit (check raw body)
4. Timestamp within tolerance (5 minutes)

### Webhook Processing Failed

**Check**:
1. Database connection available
2. Prisma schema matches payload structure
3. Idempotency logic correct (no duplicate key errors)
4. Error logs in Sentry or Vercel logs

### Webhook Timeout

**Solutions**:
1. Acknowledge webhook immediately (return 200)
2. Process asynchronously in background job queue
3. Optimize database queries (add indexes)
4. Reduce external API calls during webhook processing

---

## References

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
- [HMAC Signature Verification](https://en.wikipedia.org/wiki/HMAC)
