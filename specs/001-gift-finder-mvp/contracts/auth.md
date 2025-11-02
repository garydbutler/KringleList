# Authentication Flows: KringleList Gift Finder MVP

**Provider**: Clerk
**Version**: @clerk/nextjs ^5.0
**Date**: 2025-11-01

## Overview

KringleList uses Clerk for authentication and user management, chosen for COPPA compliance, MFA support, social login, and Next.js App Router integration. This document defines the authentication flows, middleware configuration, session management, and role-based access control.

## Key Requirements

- **COPPA Compliance**: No child PII collected; only parent accounts with email verification
- **Security**: MFA support, session tokens, secure middleware, HTTPS-only cookies
- **User Experience**: Social login (Google, Apple), passwordless magic links, persistent sessions
- **Performance**: Edge-compatible middleware, <100ms auth check latency
- **Constitutional Alignment**: Security by Default (Principle III), Type Safety First (Principle II)

---

## Authentication Flows

### 1. Sign-Up Flow (New User Registration)

**Entry Point**: `/sign-up`
**Success Redirect**: `/dashboard` (onboarding welcome)
**Failure Redirect**: `/sign-up` (with error message)

#### Flow Steps

1. **User initiates sign-up** (email/password or social provider)
2. **Clerk validates input**:
   - Email format and uniqueness
   - Password strength (min 8 chars, mix of upper/lower/numbers)
   - Social OAuth flow (if applicable)
3. **Email verification**:
   - Clerk sends verification email with magic link
   - User clicks link to verify account
   - Account remains inactive until verification
4. **User record created**:
   - Clerk `user.created` webhook triggers
   - Backend creates `User` record in database:
     ```typescript
     {
       id: clerkUserId,
       email: user.emailAddresses[0].emailAddress,
       firstName: user.firstName,
       lastName: user.lastName,
       role: 'PARENT', // Default role
       createdAt: new Date()
     }
     ```
5. **Session established**:
   - Clerk issues session token (JWT)
   - Token stored in secure HTTP-only cookie
   - User redirected to `/dashboard`

#### Social Login Providers

- **Google OAuth**: Enabled by default
- **Apple Sign-In**: Enabled for iOS/macOS users
- **Configuration**: Set in Clerk Dashboard under "Social Connections"

#### Error Handling

| Error Code | Message | User Action |
|------------|---------|-------------|
| `EMAIL_EXISTS` | This email is already registered | Try signing in instead |
| `WEAK_PASSWORD` | Password must be at least 8 characters | Strengthen password |
| `OAUTH_FAILED` | Social login failed. Please try again | Retry or use email/password |
| `EMAIL_VERIFICATION_REQUIRED` | Please verify your email to continue | Check inbox for verification link |

---

### 2. Sign-In Flow (Existing User)

**Entry Point**: `/sign-in`
**Success Redirect**: `/dashboard` (or original destination if redirected)
**Failure Redirect**: `/sign-in` (with error message)

#### Flow Steps

1. **User initiates sign-in** (email/password, social, or magic link)
2. **Clerk validates credentials**:
   - Email/password: Check against stored hash
   - Social: OAuth flow with provider
   - Magic link: Send one-time link to email
3. **MFA challenge (if enabled)**:
   - User prompted for TOTP code or SMS code
   - Clerk validates second factor
4. **Session established**:
   - Clerk issues session token
   - Token stored in HTTP-only cookie
   - User redirected to destination
5. **Session activity logged**:
   - `session.created` webhook triggers
   - Backend logs login event (IP, user agent, timestamp)

#### Magic Link Flow

1. User enters email on `/sign-in`
2. Clerk sends magic link email
3. User clicks link (valid for 10 minutes)
4. Clerk validates token and establishes session
5. User redirected to `/dashboard`

#### Error Handling

| Error Code | Message | User Action |
|------------|---------|-------------|
| `INVALID_CREDENTIALS` | Incorrect email or password | Check credentials or reset password |
| `ACCOUNT_LOCKED` | Account locked due to too many failed attempts | Wait 15 minutes or contact support |
| `MFA_REQUIRED` | Enter your authentication code | Provide TOTP/SMS code |
| `SESSION_EXPIRED` | Your session has expired. Please sign in again | Re-authenticate |

---

### 3. Sign-Out Flow

**Entry Point**: Click "Sign Out" button in header
**Success Redirect**: `/` (homepage)

#### Flow Steps

1. **User clicks "Sign Out"** in UI
2. **Frontend calls Clerk signOut()**:
   ```typescript
   await clerk.signOut()
   ```
3. **Clerk revokes session**:
   - Session token invalidated on Clerk backend
   - HTTP-only cookie cleared
4. **User redirected to homepage**
5. **Optional**: `session.ended` webhook triggers for logging

---

### 4. Session Refresh Flow

**Trigger**: Token expiration (default 1 hour)
**Mechanism**: Automatic refresh via Clerk SDK

#### Flow Steps

1. **Session token nearing expiration** (5 minutes before expiry)
2. **Clerk SDK auto-refreshes token**:
   - Silent refresh request to Clerk API
   - New token issued with extended expiration
   - Cookie updated with new token
3. **User continues without interruption**
4. **Failure scenario**:
   - If refresh fails (e.g., session revoked), user redirected to `/sign-in`
   - Error message: "Your session has expired. Please sign in again."

---

### 5. Password Reset Flow

**Entry Point**: "Forgot Password?" link on `/sign-in`
**Success Redirect**: `/sign-in` (with success message)

#### Flow Steps

1. **User clicks "Forgot Password?"**
2. **User enters email address**
3. **Clerk sends password reset email** with secure link (valid 1 hour)
4. **User clicks link** → redirected to Clerk-hosted reset page
5. **User enters new password** (must meet strength requirements)
6. **Clerk updates password hash**
7. **User redirected to `/sign-in`** with success message
8. **All existing sessions invalidated** (security measure)

---

## Middleware Configuration

### Clerk Middleware (src/middleware.ts)

Protects routes and enforces authentication at the edge.

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes (no auth required)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/shared/bag/(.*)',
  '/advertise',
  '/api/webhooks/(.*)',
  '/api/health',
])

export default clerkMiddleware((auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

### Route Protection Rules

| Route Pattern | Auth Required | Role Required | Notes |
|---------------|---------------|---------------|-------|
| `/` | No | N/A | Public homepage |
| `/sign-in/*` | No | N/A | Auth pages |
| `/sign-up/*` | No | N/A | Auth pages |
| `/shared/bag/:token` | No | N/A | Public shared bag view |
| `/advertise` | No | N/A | Sponsor landing page |
| `/dashboard` | Yes | PARENT | Parent dashboard |
| `/children/*` | Yes | PARENT | Child profile management |
| `/finder` | Yes | PARENT | Gift search |
| `/bags/*` | Yes | PARENT | Bag management |
| `/trends` | Yes | PARENT | Trending gifts |
| `/alerts` | Yes | PARENT | Alert settings |
| `/api/children/*` | Yes | PARENT | Child API endpoints |
| `/api/bags/*` | Yes | PARENT | Bag API endpoints |
| `/api/campaigns/*` | Yes | SPONSOR | Campaign management |
| `/api/webhooks/*` | No | N/A | Webhook handlers (validated via signature) |

---

## Session Management

### Session Token Structure (JWT)

Clerk issues JWT tokens with the following claims:

```json
{
  "iss": "https://clerk.kringlelist.com",
  "sub": "user_2abc123def456",
  "iat": 1698768000,
  "exp": 1698771600,
  "azp": "https://kringlelist.com",
  "sid": "sess_xyz789",
  "org_role": null,
  "org_id": null,
  "org_slug": null,
  "metadata": {
    "role": "PARENT"
  }
}
```

**Key Claims**:
- `sub`: Clerk user ID (matches `User.id` in database)
- `sid`: Session ID (unique per login)
- `exp`: Expiration timestamp (1 hour default)
- `metadata.role`: User role (`PARENT`, `SPONSOR`, `ADMIN`)

### Session Storage

- **Client-side**: HTTP-only, secure, SameSite=Lax cookies
- **Server-side**: Clerk manages session state (no server-side storage required)
- **Edge runtime**: Session validated at edge for <100ms latency

### Session Expiration

- **Access Token**: 1 hour
- **Refresh Token**: 30 days
- **Idle Timeout**: None (user remains logged in until manual sign-out)
- **Absolute Timeout**: 30 days (requires re-authentication)

### Session Revocation

Sessions can be revoked in the following scenarios:

1. **Manual Sign-Out**: User clicks "Sign Out"
2. **Password Change**: All sessions invalidated for security
3. **Account Deletion**: `user.deleted` webhook revokes all sessions
4. **Admin Action**: Admin revokes user sessions via Clerk Dashboard
5. **Security Event**: Suspicious activity triggers automatic revocation

---

## Role-Based Access Control (RBAC)

### Roles

KringleList defines three user roles stored in Clerk user metadata:

| Role | Permissions | Use Case |
|------|-------------|----------|
| `PARENT` | Manage children, bags, alerts, view shared bags | Default role for all users |
| `SPONSOR` | Create/manage campaigns, view reports | Brand/merchant accounts |
| `ADMIN` | Full system access, user management, analytics | Internal team only |

### Role Assignment

- **Default**: All new users assigned `PARENT` role on sign-up
- **Sponsor**: Manually assigned by admin via Clerk Dashboard or API
- **Admin**: Manually assigned by superuser (not exposed in UI)

### Role Enforcement

#### Server-Side (API Routes)

```typescript
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  const { userId } = auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const user = await clerkClient.users.getUser(userId)
  const role = user.publicMetadata.role as string

  if (role !== 'ADMIN' && role !== 'SPONSOR') {
    return new Response('Forbidden', { status: 403 })
  }

  // Proceed with authorized logic...
}
```

#### Client-Side (React Components)

```typescript
import { useUser } from '@clerk/nextjs'

export function CampaignDashboard() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string

  if (role !== 'SPONSOR' && role !== 'ADMIN') {
    return <div>Access denied</div>
  }

  return <div>Campaign dashboard...</div>
}
```

---

## Webhook Integration

Clerk sends webhooks for user lifecycle events. KringleList consumes the following events:

### Webhook Events

| Event | Endpoint | Purpose |
|-------|----------|---------|
| `user.created` | `POST /api/webhooks/clerk` | Create `User` record in database |
| `user.updated` | `POST /api/webhooks/clerk` | Sync user metadata (name, email) |
| `user.deleted` | `POST /api/webhooks/clerk` | Cascade delete user data (children, bags) |
| `session.created` | `POST /api/webhooks/clerk` | Log login event (analytics) |
| `session.ended` | `POST /api/webhooks/clerk` | Log logout event (analytics) |

### Webhook Verification

All webhooks MUST be verified using Clerk's signing secret:

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
    evt = wh.verify(payload, headers)
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Process event based on type
  switch (evt.type) {
    case 'user.created':
      await handleUserCreated(evt.data)
      break
    case 'user.deleted':
      await handleUserDeleted(evt.data)
      break
    // ... other events
  }

  return new Response('Webhook received', { status: 200 })
}
```

### Webhook Retry Policy

- **Retries**: Clerk retries failed webhooks up to 5 times with exponential backoff
- **Timeout**: Webhooks must respond within 5 seconds
- **Monitoring**: Failed webhooks logged in Clerk Dashboard (Webhooks → Attempts)

---

## Multi-Factor Authentication (MFA)

### MFA Support

Clerk supports the following MFA methods:

1. **TOTP (Time-based One-Time Password)**: Google Authenticator, Authy, 1Password
2. **SMS**: Text message with verification code
3. **Backup Codes**: One-time use codes for account recovery

### MFA Enrollment Flow

1. User navigates to "Account Settings" → "Security"
2. Clicks "Enable Two-Factor Authentication"
3. Clerk displays QR code for TOTP app
4. User scans QR code and enters verification code
5. Clerk validates code and enables MFA
6. Backup codes generated and displayed (user must save securely)

### MFA Challenge Flow

1. User enters email/password on `/sign-in`
2. Clerk detects MFA enabled for account
3. User prompted for TOTP/SMS code
4. Clerk validates code
5. Session established on success

### MFA Requirement (Optional)

- **Default**: MFA optional for all users
- **Future Enhancement**: Require MFA for `SPONSOR` and `ADMIN` roles (not in MVP)

---

## Environment Variables

Required environment variables for Clerk integration:

```bash
# Clerk Authentication (from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123...
CLERK_SECRET_KEY=sk_test_xyz789...

# Clerk URLs (default for Next.js App Router)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Webhook Secret (from Clerk Dashboard → Webhooks)
CLERK_WEBHOOK_SECRET=whsec_abc123...

# Domain (production only)
NEXT_PUBLIC_CLERK_DOMAIN=https://clerk.kringlelist.com
```

---

## Security Best Practices

### 1. HTTPS Only

- **Production**: Enforce HTTPS for all traffic (Vercel default)
- **Cookies**: `secure` flag set on all auth cookies
- **HSTS**: HTTP Strict Transport Security enabled

### 2. CSRF Protection

- **Clerk SDK**: Built-in CSRF protection via SameSite cookies
- **Forms**: No additional CSRF tokens required

### 3. Rate Limiting

Authentication endpoints rate-limited to prevent brute-force attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/sign-in` | 10 attempts | 15 minutes per IP |
| `/sign-up` | 5 attempts | 1 hour per IP |
| Password reset | 3 attempts | 1 hour per email |

### 4. Session Security

- **Token Rotation**: Access tokens rotated every hour
- **Refresh Token**: HttpOnly cookie, not accessible via JavaScript
- **Session Binding**: Tokens bound to IP address (optional, not in MVP)

### 5. Audit Logging

All authentication events logged for security monitoring:

- Sign-in success/failure (IP, user agent, timestamp)
- Sign-out events
- Password changes
- MFA enrollment/challenges
- Role changes (admin actions)

---

## Testing Scenarios

### Unit Tests (Vitest)

- `lib/auth/permissions.test.ts`: Role check functions
- `lib/auth/session.test.ts`: Session token validation

### Integration Tests (Supertest)

- `tests/integration/auth.test.ts`:
  - Unauthenticated request returns 401
  - Valid token allows access
  - Expired token returns 401
  - Invalid role returns 403

### E2E Tests (Playwright)

- `tests/e2e/auth.spec.ts`:
  - Sign-up flow (email/password)
  - Sign-in flow (email/password)
  - Social login (Google OAuth)
  - Magic link flow
  - Sign-out flow
  - Protected route redirects to `/sign-in`
  - MFA challenge (if enabled)

---

## Error Reference

| Error Code | HTTP Status | Message | Resolution |
|------------|-------------|---------|------------|
| `UNAUTHORIZED` | 401 | Authentication required | Sign in or provide valid token |
| `FORBIDDEN` | 403 | Insufficient permissions | Contact admin for role assignment |
| `SESSION_EXPIRED` | 401 | Session expired | Sign in again |
| `INVALID_TOKEN` | 401 | Invalid authentication token | Sign in again |
| `ACCOUNT_LOCKED` | 403 | Account locked due to failed attempts | Wait 15 minutes or reset password |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required | Check inbox for verification link |
| `MFA_REQUIRED` | 401 | Two-factor authentication required | Provide TOTP/SMS code |

---

## Performance Considerations

- **Edge Middleware**: Clerk auth check runs at edge (<100ms latency)
- **Token Caching**: Session tokens cached for 1 hour (no repeated Clerk API calls)
- **Lazy Loading**: Clerk components lazy-loaded to reduce bundle size
- **Prefetching**: User data prefetched on authenticated pages

---

## Compliance Notes

### COPPA Compliance

- **Parent Accounts Only**: No child accounts created; only parent accounts with verified email
- **Minimal PII**: User records store only email, name (optional), and role
- **Child Profiles**: Stored in separate `Child` table with no linkable PII (nickname + age band only)

### GDPR/CCPA Compliance

- **Data Export**: Users can export all data via Clerk Dashboard → "Export Data"
- **Data Deletion**: Users can delete account via Clerk Dashboard → "Delete Account"
- **Webhook Cascade**: `user.deleted` webhook triggers cascade delete of all user data (children, bags, alerts)

### FTC Compliance

- **Affiliate Disclosures**: All product links labeled "Sponsored" or "Affiliate Link"
- **No Misleading Claims**: Authentication flows include clear terms of service and privacy policy links

---

## References

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [Clerk Middleware](https://clerk.com/docs/references/nextjs/clerk-middleware)
- [COPPA Compliance Guide](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
