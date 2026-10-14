# SkillBridge — The Freelance Ecosystem with Fair Fees

SkillBridge is a full-stack freelance marketplace built for the modern workforce. It combines the best of Fiverr and Upwork while eliminating their biggest pain points — high fees, poor discovery, limited payment options, and lack of real-time collaboration.

- **0% client fee**, 5% freelancer fee (3% on Pro)
- **Escrow-protected payments** via Stripe, M-Pesa, or internal wallet
- **Transparent matching** — every match shows *why* it matched
- **Real-time chat** over WebSockets with automatic token refresh
- **Milestone-based orders** with dispute resolution

Built with **Django 6.1 + Django REST Framework + Channels** on the backend and **React 19 + Vite + Tailwind CSS + Redux Toolkit** on the frontend.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Full Stack](#running-the-full-stack)
- [Payment Gateway Setup](#payment-gateway-setup)
- [Google OAuth Setup](#google-oauth-setup)
- [Real-Time Chat (Redis + Channels)](#real-time-chat-redis--channels)
- [File Uploads (S3)](#file-uploads-s3)
- [API Documentation](#api-documentation)
- [User Roles & Subscription Plans](#user-roles--subscription-plans)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

### For Freelancers

- **Comprehensive profile** — title, overview, skills, portfolio, hourly rate, availability, profile video, languages
- **Productized gigs** — create, edit, and manage service listings with pricing, delivery times, and view/click analytics
- **Project bidding** — browse open projects and submit proposals with cover letter, price, and timeline (5/month free, unlimited on Pro)
- **Smart matching feed** — open projects scored (0–100) against *your* skills, with human-readable reasons for every match
- **Escrow-protected earnings** — money held safely until the client approves; fund, deliver, get paid
- **Milestone payments** — split large orders into funded, per-milestone deliverables
- **Real-time messaging** — WebSocket chat with auto-reconnect, file sharing, and unread badges
- **Wallet with PIN** — deposit via M-Pesa or Stripe card, withdraw to M-Pesa/bank, transfer to other wallets

### For Clients

- **Post projects** — detailed briefs with budget range, category, and deadline
- **Hire with confidence** — review proposals, freelancer trust scores, and transparent match scores
- **Escrow payments** — fund with wallet balance, M-Pesa STK push, or Stripe card; released only when you approve
- **Project milestones** — break work into funded stages with individual deliverables
- **Dispute resolution** — open a dispute on any order; admins review and release or refund
- **Edit projects and gigs** — update details, budgets, and timelines at any time

### Platform-Wide

- **Multi-dimensional ratings** — quality, communication, timeliness, professionalism (1–5 each)
- **Pro subscription** — $9.99/mo via M-Pesa or Stripe: lower fees (3%), unlimited proposals, promoted gigs
- **Admin dashboard** — platform stats, user/gig/project/order management, dispute resolution
- **Notifications** — automatic alerts for orders, deposits, withdrawals, proposals, messages, and more
- **Live USD → KES conversion** — cached hourly from open.er-api.com with a safe fallback rate
- **Dark mode** — beautiful light and dark themes with glassmorphism aesthetics
- **Responsive** — works seamlessly on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
| ------- | ----------- |
| **Backend** | Django 6.1, Django REST Framework 3.18, Django Channels 4.3 |
| **Frontend** | React 19, Vite 4, Tailwind CSS 3.4, Redux Toolkit + redux-persist |
| **Data Fetching** | TanStack Query, Axios (auto token refresh on 401) |
| **Forms / Motion** | react-hook-form, framer-motion, react-icons |
| **Database** | PostgreSQL (via dj-database-url) |
| **Cache / Real-Time** | Redis, Channels + Daphne (WebSockets) |
| **Auth** | JWT (SimpleJWT), Google Identity Services |
| **Payments** | Stripe (cards), Safaricom M-Pesa Daraja (mobile money) |
| **File Storage** | AWS S3 (django-storages) or local filesystem |
| **Deployment** | Render (backend), Vercel (frontend) |
| **Testing** | Django test runner, Postman |

---

## Project Structure

```text
skill-bridge/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                  # Settings, URLs, ASGI/WSGI
│   ├── accounts/                # Auth, profiles, roles, Google OAuth, subscriptions
│   ├── gigs/                    # Freelancer service listings
│   ├── projects/                # Client briefs, proposals, milestones
│   ├── orders/                  # Escrow orders, milestones, disputes, transactions
│   ├── wallet/                  # Balance, deposits, withdrawals, transfers, FX
│   ├── reviews/                 # Multi-dimensional ratings
│   ├── chat/                    # WebSocket consumer + message persistence
│   ├── notifications/           # Event alerts
│   ├── analytics/               # Admin / freelancer / client stats
│   ├── matching/                # Transparent skill-scoring engine
│   └── uploads/                 # File upload service (S3/local)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── vercel.json              # SPA rewrites + asset caching
│   ├── index.html
│   └── src/
│       ├── api/                 # Axios instance + interceptors
│       ├── store/               # Redux slices (auth, theme, sidebar, notifications)
│       ├── hooks/               # useWebSocket, useNotificationPoll
│       └── components/
│           ├── landing/         # Marketing landing page
│           ├── auth/            # Login, Register, ChooseRole
│           ├── dashboard/       # Client / Freelancer / Both / Admin dashboards
│           ├── gigs/            # List, Detail, Create, Edit
│           ├── projects/        # List, Detail, Post, Edit, Manage
│           ├── orders/          # Orders, Detail, Milestones, Disputes
│           ├── wallet/          # Wallet, Deposit, Withdraw, Transfer, Security
│           ├── chat/ messages/  # ChatRoom, room list
│           ├── notifications/   # Notification feed
│           ├── admin/           # Admin users/gigs/projects/orders/disputes
│           ├── profile/ settings/
│           └── pages/           # Pricing, Resources, About, Contact, etc.
├── build.sh                     # Render build script (root level)
├── LICENSE
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **PostgreSQL 14+** — [postgresql.org](https://www.postgresql.org/download/)
- **Redis** — via WSL2 Ubuntu (`sudo apt install redis-server`), Docker, or natively
- **ngrok** — [ngrok.com/download](https://ngrok.com/download) (for M-Pesa callbacks)
- **Stripe CLI** — [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### Clone the Repository

```bash
git clone https://github.com/Kyle-00/skill-bridge.git
cd skill-bridge
```

### Backend Setup

```bash
python -m venv venv

# Git Bash on Windows:
source venv/Scripts/activate
# macOS / Linux:
source venv/bin/activate

pip install -r backend/requirements.txt
```

Create a `.env` file in the project root (see [Environment Variables](#environment-variables)).

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` with the API URLs (see below).

---

## Environment Variables

### Backend `.env` (project root)

```env
# Django
SECRET_KEY=generate-a-long-random-string-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgres://skill_user:your_password@localhost:5432/skillbridge_db

# Redis (required — Channels and caching both use it)
REDIS_URL=redis://localhost:6379

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# M-Pesa (Safaricom Daraja Sandbox)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.dev/api/v1/wallet/webhook/mpesa/
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=your_security_credential

# File storage (optional — falls back to local media/ without it)
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_REGION_NAME=us-east-1
BACKEND_ORIGIN=http://localhost:8000

# CORS (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:8000

# Superuser auto-creation (used by build.sh on deploy)
DJANGO_SUPERUSER_USERNAME=Admin
DJANGO_SUPERUSER_EMAIL=you@example.com
DJANGO_SUPERUSER_PASSWORD=strong-password
```

&gt; **Notes**
&gt; - Never commit `.env`. It must be in `.gitignore`.
&gt; - Google sign-in needs **no backend keys** — verification uses Google's `tokeninfo` endpoint. Only the frontend Client ID is required.
&gt; - Without `AWS_STORAGE_BUCKET_NAME`, uploads are stored in `backend/media/` and served by Django.

### Frontend `.env` (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1/
VITE_WS_URL=ws://127.0.0.1:8000/ws/
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

&gt; On Windows, use `ws://127.0.0.1:8000/ws/` (not `localhost`) for WebSockets.

---

## Database Setup

```bash
psql -U postgres -h localhost -p 5432
```

```sql
CREATE DATABASE skillbridge_db;
CREATE USER skill_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE skillbridge_db TO skill_user;
ALTER SCHEMA public OWNER TO skill_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO skill_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO skill_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO skill_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO skill_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO skill_user;
\q
```

Then:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser   # or: python manage.py ensure_superuser
```

---

## Running the Full Stack

### Terminal 1 — Redis (required)

```bash
sudo service redis-server start     # WSL Ubuntu
redis-cli ping                      # → PONG
```

### Terminal 2 — Django Backend (ASGI/Daphne)

```bash
cd skill-bridge/backend
source ../venv/Scripts/activate     # or ../venv/bin/activate
python manage.py runserver
# → Starting ASGI/Daphne development server at http://127.0.0.1:8000/
```

### Terminal 3 — React Frontend

```bash
cd skill-bridge/frontend
npm run dev
# → Local: http://localhost:5173/
```

### Terminal 4 — ngrok (for M-Pesa callbacks)

```bash
ngrok http --url=your-static-url.ngrok-free.dev 8000
```

Update `MPESA_CALLBACK_URL` in `.env` to the ngrok URL and restart Django.

### Terminal 5 — Stripe CLI

```bash
stripe listen --forward-to localhost:8000/api/v1/wallet/webhook/stripe/
```

Copy the printed `whsec_...` into `.env` as `STRIPE_WEBHOOK_SECRET` and restart Django.

### Open the Platform

Visit [http://localhost:5173](http://localhost:5173).

---

## Payment Gateway Setup

### Stripe (Cards — Global)

1. Create an account at [dashboard.stripe.com](https://dashboard.stripe.com/register)
2. **Developers → API Keys**: publishable key → `frontend/.env`, secret key → backend `.env`
3. Add a webhook endpoint:
   - URL: `https://YOUR-DOMAIN/api/v1/wallet/webhook/stripe/`
   - Events: `payment_intent.succeeded`, `charge.succeeded`
   - Signing secret (`whsec_...`) → backend `.env`

**Test cards** (any future date, any 3-digit CVC):

| Scenario | Card Number |
| ---------- | ------------- |
| Success | `4242 4242 4242 4242` |
| Requires 3D Secure | `4000 0025 0000 3155` |
| Declined | `4000 0000 0000 0002` |

### M-Pesa (Mobile Money — Kenya)

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
2. **My Apps → Create App** (Sandbox), ticking **Lipa Na M-Pesa Online** and **M-Pesa Express**
3. Copy **Consumer Key** and **Consumer Secret** to `.env`
4. Set the callback URL to your ngrok/production URL ending in `/api/v1/wallet/webhook/mpesa/`

**Sandbox test phones:**

| Scenario | Phone |
| ---------- | ------- |
| Success | `254708374149` (PIN `12345`) |
| Failure | `254708374150` |

### Fees

| Action | Fee |
| ------ | --- |
| Platform fee (Free plan) | 5% of order |
| Platform fee (Pro plan) | 3% of order |
| Withdrawal to M-Pesa | 1.5% |
| Withdrawal to bank | 2% |
| Pro subscription | $9.99/mo (billed in KES via M-Pesa at the live rate) |

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and create a project
2. Enable **Google+ API** and **Google People API**
3. **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth 2.0 Client ID** (Web application)
4. Add JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - `https://skill-bridge-roan-pi.vercel.app`
5. Copy the **Client ID** to `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

&gt; New OAuth clients take 5–15 minutes to propagate. If you see `Error 401: invalid_client`, wait and retry. Add yourself as a **Test user** under the OAuth consent screen while the app is in "Testing" mode.

---

## Real-Time Chat (Redis + Channels)

Chat requires Redis (`REDIS_URL`) — the channel layer and cache are Redis-backed in all environments.

- **Transport:** WebSocket via Daphne/ASGI
- **URL:** `ws://&lt;host&gt;/ws/chat/{room_id}/?token={jwt}`
- **Auth:** JWT passed as a query parameter, validated by custom WebSocket middleware
- **Resilience:** the client pre-refreshes expiring tokens, sends 25 s keepalive pings, and reconnects with exponential backoff (1s → 30s cap)
- **Fallback:** if the socket can't connect, chat falls back to polling `GET /api/v1/chat/messages/?room={id}&since={last_id}` every 3 seconds

Make sure `'daphne'` stays first in `INSTALLED_APPS` so `runserver` serves ASGI.

---

## File Uploads (S3)

`POST /api/v1/uploads/` accepts multipart form data:

| Field | Value |
| ----- | ----- |
| `file` | the file (max **25 MB**) |
| `purpose` | `image` \| `document` \| `video` \| `any` |

Purpose-based MIME validation:

- **image** — jpeg, png, webp, gif
- **document** — pdf, txt, zip, doc, docx
- **video** — mp4, webm
- **any** — no restriction

Files are stored in S3 when `AWS_STORAGE_BUCKET_NAME` is set (public-read, no query-string auth); otherwise in `backend/media/`. Used for gig images, portfolio, profile pictures, chat attachments, and order deliverables.

---

## API Documentation

Base URL: `http://localhost:8000/api/v1/`

### Accounts (`/accounts/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| POST | `/register/` | Create a new user (auto-creates role resources + wallet) | Public |
| POST | `/login/` | Login with email **or** username | Public |
| POST | `/token/refresh/` | Refresh JWT access token | Public |
| POST | `/google/verify/` | Google ID-token verification (creates/links account) | Public |
| POST | `/choose-role/` | Switch role: `client` / `freelancer` / `both` | JWT |
| POST | `/subscribe/` | Buy Pro — `method: mpesa \| stripe` | JWT |
| GET | `/subscription-status/` | Current plan, Pro status, expiry | JWT |
| GET | `/freelancers/` | List all freelancers | Public |
| GET/PUT | `/profile/` | View or update own profile | JWT |
| GET/PUT | `/profile/freelancer/` | Freelancer profile | JWT |
| GET/PUT | `/profile/client/` | Client profile | JWT |
| POST | `/delete-account/` | Delete account (password required) | JWT |
| GET | `/admin/users/` | List all users | Admin |
| GET/PUT | `/admin/users/{id}/` | Get or update a user | Admin |

### Gigs (`/gigs/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/gigs/` | List active gigs — filter by `category`, `subcategory`, `freelancer`; search `title`, `description`; order by `price`, `delivery_days`, `created_at` | Public |
| POST | `/gigs/` | Create a gig | JWT |
| GET | `/gigs/{id}/` | Gig details | Public |
| PATCH/PUT | `/gigs/{id}/` | Update own gig | JWT |
| DELETE | `/gigs/{id}/` | Delete own gig | JWT |
| GET/POST | `/gigs/admin/` | Admin gig list/create | Admin |
| POST | `/gigs/admin/{id}/toggle_active/` | Activate/deactivate a gig | Admin |

### Projects (`/projects/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/projects/` | List projects — filter `category`, `status`, `client`; search `title`, `description` | Public |
| POST | `/projects/` | Post a new project | JWT |
| GET | `/projects/{id}/` | Project details | Public |
| PATCH/PUT | `/projects/{id}/` | Update own project | JWT |
| DELETE | `/projects/{id}/` | Delete own project (blocked if active orders exist) | JWT (owner) |
| GET | `/projects/{id}/proposals-list/` | All bids on own project | JWT (owner) |
| POST | `/projects/{id}/accept-proposal/` | Accept a proposal → creates order + chat room | JWT (owner) |
| GET | `/projects/{id}/milestones/` | List project milestones | JWT |
| POST | `/projects/{id}/add-milestone/` | Add a milestone | JWT (owner) |
| GET/POST | `/projects/proposals/` | List/submit proposals (5/month on Free, unlimited on Pro) | JWT |
| GET/PUT/DELETE | `/projects/proposals/{id}/` | Manage a proposal | JWT |
| GET/POST | `/projects/milestones/` | Milestone CRUD | JWT |
| GET/POST | `/projects/admin/` | Admin project management | Admin |

### Orders (`/orders/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/orders/` | List own orders (client or freelancer) | JWT |
| GET | `/orders/{id}/` | Order details | JWT |
| POST | `/orders/buy-gig/` | Start an order from a gig (`gig_id`) | JWT |
| POST | `/orders/{id}/fund-escrow/` | Fund escrow — `payment_method: wallet \| mpesa \| stripe` | JWT (client) |
| POST | `/orders/{id}/mark-funded/` | Mark escrow funded (legacy) | JWT (client) |
| POST | `/orders/{id}/submit-work/` | Submit deliverable (message + URL or file upload) | JWT (freelancer) |
| POST | `/orders/{id}/approve-work/` | Release payment to freelancer | JWT (client) |
| POST | `/orders/{id}/cancel/` | Cancel; auto-refunds if funded | JWT (party) |
| POST | `/orders/{id}/dispute/` | Open a dispute (`reason`) | JWT (party) |
| GET | `/orders/transactions/` | Own order transactions | JWT |
| GET | `/orders/disputes/` | Own disputed orders | JWT |
| GET/POST | `/orders/admin/` | Admin order management | Admin |
| GET | `/orders/admin/disputes/` | All open disputes | Admin |
| POST | `/orders/mpesa-callback/` | M-Pesa order webhook | Public |
| POST | `/orders/stripe-webhook/` | Stripe order webhook | Public |

**Order lifecycle:** `pending → in_progress → delivered → completed` (or `cancelled` / `disputed`).

### Wallet (`/wallet/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/wallet/balance/` | Balance, wallet ID (`SB-XXXXXXXX`), PIN status | JWT |
| POST | `/wallet/set_pin/` | Set wallet PIN | JWT |
| POST | `/wallet/change_pin/` | Change PIN (old PIN required) | JWT |
| POST | `/wallet/deposit/` | Instant test/legacy deposit | JWT |
| POST | `/wallet/withdraw/` | Withdraw — M-Pesa (1.5% fee) or bank (2% fee), PIN required | JWT |
| POST | `/wallet/transfer/` | Send to another wallet by ID, PIN required | JWT |
| GET | `/wallet/lookup/?wallet_id=` | Resolve a wallet ID to a name | JWT |
| GET | `/wallet/transactions/` | Last 50 transactions | JWT |
| GET | `/wallet/exchange-rate/` | Live USD → KES (cached 1 h) | Public |
| POST | `/wallet/stripe/create-intent/` | Create a Stripe PaymentIntent for deposit | JWT |
| POST | `/wallet/webhook/stripe/` | Stripe webhook (deposits + Pro upgrades) | Public |
| POST | `/wallet/mpesa/stk-push/` | Trigger an M-Pesa STK push for deposit | JWT |
| POST | `/wallet/webhook/mpesa/` | M-Pesa callback (deposits + Pro upgrades) | Public |

### Matching (`/matching/`) — Transparent Scoring

Every match returns a **score (0–100) and human-readable reasons**. No black box.

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/matching/projects/` | Open projects scored against *your* skills | JWT (freelancer/both) |
| GET | `/matching/freelancers/?project_id=` | Freelancers scored against your project | JWT (client, project owner) |
| GET | `/matching/gigs/` | Trending gigs by engagement (views + clicks) | JWT |

Scoring combines weighted skill overlap, keyword relevance, category alignment, recency, and trust score.

### Uploads (`/uploads/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| POST | `/uploads/` | Upload a file (`file` + `purpose`), max 25 MB | JWT |

### Reviews (`/reviews/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/reviews/` | List reviews | Public |
| POST | `/reviews/` | Rate an order on 4 dimensions (1–5 each) + comment | JWT |

### Chat (`/chat/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET/POST | `/chat/rooms/` | List/create rooms | JWT |
| GET | `/chat/rooms/{id}/` | Room details + participants | JWT |
| POST | `/chat/rooms/{id}/mark_read/` | Mark messages read | JWT |
| GET | `/chat/rooms/unread_count/` | Unread message count | JWT |
| GET/POST | `/chat/messages/` | Messages (`?room={id}&since={last_id}`) | JWT |

**WebSocket:** `ws://localhost:8000/ws/chat/{room_id}/?token={jwt}`

### Notifications (`/notifications/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/notifications/` | List notifications (`?is_read=true/false`) | JWT |
| GET | `/notifications/unread_count/` | Unread count | JWT |
| POST | `/notifications/mark_all_read/` | Mark all as read | JWT |
| POST | `/notifications/{id}/mark_read/` | Mark one as read | JWT |

### Analytics (`/analytics/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/analytics/admin-stats/` | Platform-wide metrics | Admin |
| GET | `/analytics/freelancer-stats/` | Freelancer earnings/orders | JWT (freelancer) |
| GET | `/analytics/client-stats/` | Client spend/orders | JWT (client) |

---

## User Roles & Subscription Plans

| Role | Capabilities |
| ------ | ------------- |
| **Client** | Post projects, hire freelancers, fund escrow, approve work, review |
| **Freelancer** | Create gigs, submit proposals, deliver work, withdraw earnings |
| **Both** | Everything from both roles — switchable any time via `/accounts/choose-role/` |
| **Admin (Superuser)** | All of the above plus user management, moderation, dispute resolution, analytics |

| Plan | Platform Fee | Proposals | Extras |
| ---- | ------------ | --------- | ------ |
| **Free** | 5% | 5/month | — |
| **Pro** ($9.99/mo) | 3% | Unlimited | Promoted gigs, priority support |

---

## Deployment

### Backend — Render

1. Push code to GitHub
2. Create **PostgreSQL** and **Redis** instances (free tier)
3. Create a **Web Service**:
   - **Build Command:** `./build.sh` (installs deps, collects static, migrates, ensures superuser)
   - **Start Command:** `cd backend && daphne -b 0.0.0.0 -p $PORT config.asgi:application`

**Required Render environment variables:**

```text
SECRET_KEY=&lt;50+ random chars&gt;
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=&lt;Internal Database URL&gt;
REDIS_URL=&lt;Internal Redis URL&gt;
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CALLBACK_URL=https://YOUR-APP.onrender.com/api/v1/wallet/webhook/mpesa/
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=...
AWS_STORAGE_BUCKET_NAME=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_REGION_NAME=us-east-1
BACKEND_ORIGIN=https://YOUR-APP.onrender.com
CORS_ALLOWED_ORIGINS=https://skill-bridge-roan-pi.vercel.app
CSRF_TRUSTED_ORIGINS=https://YOUR-APP.onrender.com
DJANGO_SUPERUSER_USERNAME=Admin
DJANGO_SUPERUSER_EMAIL=you@example.com
DJANGO_SUPERUSER_PASSWORD=&lt;strong&gt;
```

### Frontend — Vercel

1. Import the repository at [vercel.com](https://vercel.com)
2. **Root Directory:** `frontend` · **Framework:** Vite (the repo's `vercel.json` already configures SPA rewrites and immutable asset caching)
3. Environment variables:

```text
VITE_API_URL=https://YOUR-APP.onrender.com/api/v1/
VITE_WS_URL=wss://YOUR-APP.onrender.com/ws/
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

1. Add the Vercel domain to Google OAuth **Authorised JavaScript origins** and Render's `CORS_ALLOWED_ORIGINS`.

---

## Troubleshooting

### Backend

| Problem | Solution |
| --------- | ---------- |
| `ModuleNotFoundError` | Activate the venv first |
| `DATABASE_URL` rejected | Check PostgreSQL port/credentials (default port 5432) |
| `relation does not exist` | Run `python manage.py migrate` |
| `MigrationSchemaMissing` | `ALTER SCHEMA public OWNER TO skill_user` |
| `redis.exceptions.ConnectionError` | Start Redis: `sudo service redis-server start` |
| Chat connects then drops | Redis is required for the channel layer — check `REDIS_URL` |
| `ImproperlyConfigured` in asgi.py | Ensure `'daphne'` is first in `INSTALLED_APPS` |

### Frontend

| Problem | Solution |
| --------- | ---------- |
| Blank page | Check the browser console; hard refresh with Ctrl+Shift+R |
| WebSocket won't connect | Use `ws://127.0.0.1:8000/ws/`, not `localhost`, on Windows |
| 401 on every API call | Clear localStorage and log in fresh |
| Google button missing | Confirm `VITE_GOOGLE_CLIENT_ID` is set and Vite was restarted |

### Payments

| Problem | Solution |
| --------- | ---------- |
| Stripe deposit not crediting | Verify `STRIPE_WEBHOOK_SECRET` matches `stripe listen` output |
| M-Pesa STK push `Invalid Access Token` | Verify Consumer Key/Secret |
| M-Pesa callback never arrives | Confirm ngrok is running and `.env` URL matches |
| `Invalid PhoneNumber` | Use `2547XXXXXXXX` — no `+`, no spaces |
| Pending deposit stuck | Pending M-Pesa transactions auto-fail after 2 minutes without a callback |

### Google OAuth

| Problem | Solution |
| --------- | ---------- |
| `Error 401: invalid_client` | Verify Client ID in `frontend/.env`; wait 15 min after creating |
| Access blocked (test users only) | Add your email under OAuth consent screen → Audience → Test users |

---

## Roadmap

### Shipped

- Registration, Google login, role selection
- Freelancer profiles with portfolios + profile completion scoring
- Gigs, projects, proposals with monthly limits
- Escrow with wallet / M-Pesa / Stripe funding
- Order milestones and dispute resolution with admin review
- Multi-dimensional ratings
- Transparent skill matching with explainable scores
- Pro subscriptions (M-Pesa + Stripe) with fee reduction
- Real-time WebSocket chat with auto-reconnect and polling fallback
- Admin analytics dashboard

### 🔜 Planned

- Cryptocurrency payments (USDC/BTC) — *landing page copy already hints at this*
- Built-in video calls and screen sharing
- Mobile app (React Native)
- Automated skill verification
- Team projects with multiple freelancers
- Learning platform and community forums
- Open API for third-party integrations

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure:

- `.env` files are never committed
- Migrations accompany every model change
- Linting passes (`ruff`/flake8 for Python, `eslint` for JS)
- API changes are reflected in the docs above

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE).

---

## Contact

- **Maintainer:** Kyle Kinyua — [kylekinyua001@gmail.com](mailto:kylekinyua001@gmail.com)
- **Live app:** [skill-bridge-roan-pi.vercel.app](https://skill-bridge-roan-pi.vercel.app/)
- **Repository:** [github.com/Kyle-00/skill-bridge](https://github.com/Kyle-00/skill-bridge)

---

**SkillBridge** — Building the trust infrastructure for the future of work.
