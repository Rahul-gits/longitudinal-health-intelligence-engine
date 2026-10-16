# HEAL Engine: Google Sign-In & Resend Email OTP Production Integration Guide

This guide details the step-by-step setup required to connect Google OAuth 2.0 and Resend transactional email to the HEAL Engine backend and frontend architecture.

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 18 + Vite)               │
│  - Google Sign-In button                               │
│  - Email Code (OTP) Form with 60s cooldown countdown   │
│  - Automatic Session restoration (Cookie & Header)     │
└───────────────────────────┬────────────────────────────┘
                            │ Credentials / Cookies
                            ▼
┌────────────────────────────────────────────────────────┐
│             Backend (Express + TypeScript)             │
│  - /api/auth/google & /api/auth/google/callback        │
│  - /api/auth/otp/request & /api/auth/otp/verify        │
│  - RBAC & Patient-Scope Boundary Isolation             │
│  - HttpOnly Cookie Management (__Host-heal.sid)        │
└─────────────┬────────────────────────────┬─────────────┘
              │ HMAC-SHA256                │ Web-Server Flow
              ▼                            ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Resend Email API      │ │    Google OAuth 2.0       │
│  - Single-use 6-digit OTP │ │  - OpenID Connect (IDToken)│
│  - Verified domain sender │ │  - State CSRF Tamper-Proof│
└───────────────────────────┘ └───────────────────────────┘
              │                            │
              └─────────────┬──────────────┘
                            ▼
┌─────────────────────────────────────────────────────────┐
│               PostgreSQL Persistence Layer              │
│  - auth_email_otps (Hashed OTPs, Expiry, Attempts)      │
│  - user_sessions (Persistent Server-Side Sessions)      │
│  - users (google_subject, email_verified_at)            │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Google OAuth 2.0 Credentials Setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select an existing project or click **Create Project** (e.g. `heal-engine-production`).
3. Configure the **OAuth Consent Screen**:
   - User Type: **External** (or **Internal** for enterprise hospital tenants).
   - App Name: `HEAL Engine`
   - User Support Email: your operational email.
   - Authorized Domains: your verified root domain (e.g., `healengine.org`).
   - Scopes: Request identity scopes only:
     - `openid`
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - *Clinical Security Rule*: Google authentication only proves identity; it never grants clinician or administrative roles directly.
4. Navigate to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `HEAL Engine Web Client`.
   - **Authorized JavaScript origins**:
     - Development: `http://localhost:3000`
     - Production: `https://your-hospital-domain.com`
   - **Authorized redirect URIs**:
     - Development: `http://localhost:5000/api/auth/google/callback`
     - Production: `https://api.your-hospital-domain.com/api/auth/google/callback`
5. Click **Create** and copy the generated **Client ID** and **Client Secret**.

---

## 3. Resend Transactional Email Setup

1. Sign up at [Resend](https://resend.com/).
2. Go to **Domains** → **Add Domain**:
   - Enter your domain (e.g., `mail.healengine.org` or `healengine.org`).
   - Add the generated DNS records (**SPF**, **DKIM**, and **DMARC**) at your DNS provider (Cloudflare, AWS Route 53, Namecheap, etc.).
   - Wait for domain verification checkmark (✓ Verified).
3. Go to **API Keys** → **Create API Key**:
   - Name: `HEAL-Engine-Production-Auth`.
   - Permission: **Sending access** (Restricted to your verified domain).
   - Copy key (starts with `re_...`).
4. Set sender address in environment:
   ```env
   RESEND_API_KEY=re_1234567890abcdef
   EMAIL_FROM=HEAL Engine <auth@healengine.org>
   ```

---

## 4. PostgreSQL Database Migration

Run the migration script against your target PostgreSQL database:

```bash
# Using psql
psql -d heal_engine_db -f backend/db/migrations/001_auth_tables.sql
```

The migration creates:
- `auth_email_otps`: stores HMAC-SHA256 OTP hashes, normalized emails, single-use `consumed_at` timestamp, and max attempt counters.
- `user_sessions`: stores server-side session payloads and timestamps compatible with standard session stores.
- Indexes on `(email_normalized, purpose, created_at DESC)` and `(expire)` for high-performance zero-trust lookups and periodic reap jobs.

---

## 5. Environment Variables Configuration

Generate two cryptographically secure 32-byte hex secrets locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the following to your private `.env` file (refer to [`.env.example`](file:///c:/Users/rahul/OneDrive/Desktop/Heal%20Engine/.env.example)):

```env
# Application URLs
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000

# Google OAuth (Server-Side Only)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Resend Transactional Email (Server-Side Only)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=HEAL Engine <auth@yourverifieddomain.com>

# PostgreSQL Database Connection
DATABASE_URL=postgres://heal_user:your_password@localhost:5432/heal_engine_db
DATABASE_SSL_MODE=prefer

# Server Session & OTP Cryptographic Secrets
SESSION_SECRET=your_32_byte_session_secret_hex
OTP_HMAC_SECRET=your_32_byte_otp_hmac_secret_hex

# OTP Policy
OTP_TTL_SECONDS=300
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
```

---

## 6. Verification and Testing

Run the automated authentication test suite:

```bash
npm run test:auth
```

All 12 test assertions verify:
1. Valid 6-digit OTP issuance.
2. Single-use verification via HMAC-SHA256 constant-time comparison (`timingSafeEqual`).
3. Replay attack rejection (consumed codes cannot be reused).
4. Invalid OTP rejection with attempt count enforcement.
5. 60-second cooldown enforcement against rapid resends.
6. Account lockout after 5 consecutive failed attempts.
7. Google OAuth CSRF state parameter validation (tampered states rejected).
8. Server-managed session lifecycle and revocation upon logout.
9. Production cookie security (`HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure`).
10. Session extraction from both cookies and authorization headers.
11. RBAC enforcement: patient cannot access clinician or admin routes (`HTTP 403`).
12. IDOR / BOLA prevention: patient cannot access other patient records (`HTTP 403`).
