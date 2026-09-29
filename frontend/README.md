# SkillBridge — The Next-Generation Freelance Ecosystem

> **Bridge your talent to global opportunities.**

SkillBridge is a full-stack freelance marketplace built for the modern
workforce. It combines the best of Fiverr and Upwork while eliminating
their biggest pain points — high fees, poor discovery, limited payment
options, and lack of real-time collaboration.

Built with **Django 6.1 + Django REST Framework** on the backend and
**React 18 + Vite + Tailwind CSS** on the frontend, SkillBridge ships
with escrow-protected payments, M-Pesa and Stripe integrations, real-time
messaging, multi-dimensional ratings, AI-ready matching, and an
admin analytics dashboard.

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
- [API Documentation](#api-documentation)
- [Testing with Postman](#testing-with-postman)
- [User Roles](#user-roles)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

### For Freelancers

- **Comprehensive profile** — title, overview, skills, portfolio, hourly rate, languages, social links
- **Productized gigs** — create, edit, and manage service listings with custom pricing and delivery times
- **Project bidding** — browse open projects, submit proposals with cover letter, price, and timeline
- **Escrow-protected earnings** — money held safely until the client approves the deliverable
- **Real-time messaging** — chat with clients, share files, get instant notifications
- **Wallet with PIN** — deposit via M-Pesa or Stripe, withdraw to M-Pesa, transfer to other wallets

### For Clients

- **Post projects** — detailed briefs with budget range, category, and deadline
- **Browse gigs** — searchable marketplace of ready-made services with reviews
- **Review proposals** — see bids, cover letters, freelancer trust scores, and pricing
- **Escrow payments** — funds released only when you approve the work
- **Edit projects and gigs** — update details, budgets, and timelines at any time

### Platform-Wide

- **Multi-dimensional ratings** — quality, communication, timeliness, professionalism (1–5 each)
- **Admin dashboard** — platform stats, user management, gigs/projects/orders moderation
- **Notifications** — automatic alerts for orders, deposits, withdrawals, proposals, and messages
- **AI-ready matching** — modular design for bias-aware recommendation engine
- **Multi-currency** — USD, EUR, GBP, KES, TZS, NGN, ZAR with live conversion
- **Dark mode** — beautiful light and dark themes with glassmorphism aesthetics
- **Responsive** — works seamlessly on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
| ------- | ----------- |
| **Backend** | Django 6.1, Django REST Framework, Channels |
| **Frontend** | React 18, Vite, Tailwind CSS 3, Redux Toolkit |
| **Database** | PostgreSQL 18 |
| **Cache / Queue** | Redis, Celery |
| **Real-Time** | Django Channels + WebSockets |
| **Auth** | JWT (SimpleJWT), Google OAuth 2.0 |
| **Payments** | Stripe (cards), Safaricom M-Pesa (mobile) |
| **File Storage** | Local media folder (S3/Cloudinary-ready) |
| **Deployment** | Render (backend), Vercel (frontend) |
| **Testing** | Postman collections |

---

## Project Structure

```text
skill-bridge/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh                    # Render build script
│   ├── config/
│   │   ├── settings.py             # Django settings
│   │   ├── urls.py                 # Root URLs
│   │   ├── asgi.py                 # ASGI + Channels
│   │   └── wsgi.py
│   ├── accounts/                   # Auth, users, profiles, Google OAuth
│   ├── gigs/                       # Freelancer services
│   ├── projects/                   # Client briefs + proposals
│   ├── orders/                     # Escrow-backed orders
│   ├── wallet/                     # Balance, deposits, withdrawals
│   ├── reviews/                    # Multi-dimensional ratings
│   ├── chat/                       # WebSocket + message persistence
│   ├── notifications/              # Alerts for every event
│   ├── analytics/                  # Admin dashboard stats
│   └── media/                      # User uploads
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── .env                        # Frontend env vars
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/                    # Axios + interceptors
│       ├── store/                  # Redux slices
│       ├── hooks/                  # useWebSocket, useNotificationPoll
│       └── components/
│           ├── common/             # Navbar, Sidebar, Footer
│           ├── auth/               # Login, Register
│           ├── dashboard/          # Client/Freelancer/Admin dashboards
│           ├── gigs/               # List, Detail, Create, Edit
│           ├── projects/           # List, Detail, Post, Edit, Manage
│           ├── orders/             # Orders, OrderDetail
│           ├── wallet/             # Wallet, Deposit, Withdraw, Transfer
│           ├── chat/               # ChatRoom
│           ├── messages/           # Room list
│           ├── notifications/      # Notification feed
│           └── pages/              # Landing, Pricing, Resources, etc.
├── postman/
│   ├── SkillBridge.postman_collection.json
│   └── SkillBridge.postman_environment.json
├── .env                            # Backend env vars
├── .env.example                    # Template
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites

Make sure these are installed and running:

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **PostgreSQL 14+** — [postgresql.org](https://www.postgresql.org/download/)
- **Redis** — via WSL2 Ubuntu (`sudo apt install redis-server`) or Docker
- **ngrok** — [ngrok.com/download](https://ngrok.com/download)
- **Stripe CLI** — [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### Clone the Repository

```bash
git clone https://github.com/yourusername/skill-bridge.git
cd skill-bridge
```

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv

# Git Bash on Windows:
source venv/Scripts/activate

# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

Copy `.env.example` to `.env` and fill in your values (see
[Environment Variables](#environment-variables)).

### Frontend Setup

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` and set the API URLs.

---

## Environment Variables

### Backend `.env` (root of project)

```env
# Django
SECRET_KEY=generate-a-long-random-string-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgres://skill_user:your_password@localhost:5432/skillbridge_db

# Redis
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
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/v1/wallet/webhook/mpesa/

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Superuser auto-creation (Render free tier)
DJANGO_SUPERUSER_USERNAME=Admin
DJANGO_SUPERUSER_EMAIL=you@example.com
DJANGO_SUPERUSER_PASSWORD=strong-password
```

### Frontend `.env` (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1/
VITE_WS_URL=ws://127.0.0.1:8000/ws/
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

> **Important:** Never commit `.env` files. They must always be in `.gitignore`.

---

## Database Setup

### PostgreSQL

Open `psql` as the postgres superuser:

```bash
psql -U postgres -h localhost -p 5432
```

Then run:

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

Update `DATABASE_URL` in `.env` with these credentials.

### Run Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

---

## Running the Full Stack

You need **up to five terminals** open for full functionality.

### Terminal 1 — Redis (required for real-time chat)

Open **WSL Ubuntu** from the Start Menu:

```bash
sudo service redis-server start
redis-cli -a 'your_redis_password' ping
```

Expected output: `PONG`

If Redis isn't installed:

```bash
sudo apt update
sudo apt install redis-server -y
```

### Terminal 2 — Django Backend

```bash
cd ~/desktop/skill-bridge/backend
source ../venv/Scripts/activate
python manage.py runserver
```

Expected output:

```text
Starting ASGI/Daphne version 4.2.3 development server at http://127.0.0.1:8000/
```

### Terminal 3 — React Frontend

```bash
cd ~/desktop/skill-bridge/frontend
npm run dev
```

Expected output:

```text
VITE v4.5.14  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Terminal 4 — ngrok (required for M-Pesa callbacks)

```bash
/c/Users/you/ngrok.exe http --url=your-static-url.ngrok-free.dev 8000
```

Expected output:

```text
Forwarding   https://your-static-url.ngrok-free.dev -> http://localhost:8000
```

Update `MPESA_CALLBACK_URL` in `.env` to match this ngrok URL, then restart Django.

### Terminal 5 — Stripe CLI (required for card payments)

```bash
stripe listen --forward-to localhost:8000/api/v1/wallet/webhook/stripe/
```

Expected output:

```text
> Ready! Your webhook signing secret is whsec_xxxxxxxx
```

Copy that `whsec_...` into `.env` as `STRIPE_WEBHOOK_SECRET`, then restart Django.

### Open the Platform

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## Payment Gateway Setup

### Stripe (Cards — Global)

1. Create an account at [dashboard.stripe.com](https://dashboard.stripe.com/register)
2. Navigate to **Developers → API Keys** and copy:
   - **Publishable key** (`pk_test_...`) → frontend `.env`
   - **Secret key** (`sk_test_...`) → backend `.env`
3. Add a webhook endpoint:
   - URL: `https://YOUR-DOMAIN/api/v1/wallet/webhook/stripe/`
   - Events: `payment_intent.succeeded`, `charge.succeeded`
   - Copy the **Signing secret** (`whsec_...`) → backend `.env`

**Test cards** (any future date, any 3-digit CVC):

| Scenario | Card Number |
| ---------- | ------------- |
| Success | `4242 4242 4242 4242` |
| Requires 3D Secure | `4000 0025 0000 3155` |
| Declined | `4000 0000 0000 0002` |

### M-Pesa (Mobile Money — Kenya)

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
2. Go to **My Apps → Create App**, choose **Sandbox**
3. Tick **Lipa Na M-Pesa Online** and **M-Pesa Express**
4. Copy the **Consumer Key** and **Consumer Secret** to `.env`
5. Set the callback URL to your ngrok URL:

```text
https://YOUR-NGROK-URL.ngrok-free.dev/api/v1/wallet/webhook/mpesa/
```

**Sandbox test phone numbers:**

| Scenario | Phone |
| ---------- | ------- |
| Success | `254708374149` (PIN `12345`) |
| Failure | `254708374150` |

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a project (e.g., **SkillBridge**)
3. Enable **Google+ API** and **Google People API** under **APIs & Services → Library**
4. Go to **APIs & Services → Credentials**
5. Click **+ CREATE CREDENTIALS → OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Add JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - `https://YOUR-VERCEL-APP.vercel.app` (production)
8. Copy the **Client ID** and **Client Secret** to both `.env` files

**Important:** New OAuth clients can take 5–15 minutes to propagate across
Google's infrastructure. If you see `Error 401: invalid_client` right after
creating one, wait 15 minutes and try again.

Also configure the **OAuth consent screen** (Audience tab) to add yourself as
a **Test user**. Google blocks unrecognized users while the app is in
"Testing" mode.

---

## Real-Time Chat (Redis + Channels)

SkillBridge supports two chat modes:

### Option A — WebSocket (production-grade)

Requires Redis running. Configure in `backend/config/settings.py`:

```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.getenv('REDIS_URL', 'redis://localhost:6379')],
        },
    },
}
```

Django must run with Daphne (ASGI). The default `runserver` will use
Daphne automatically if `'daphne'` is the first entry in `INSTALLED_APPS`.

### Option B — HTTP Polling (zero dependencies)

If Redis is unavailable, the frontend `ChatRoom.jsx` component falls back
to polling `GET /api/v1/chat/messages/?room={id}&since={last_id}` every
3 seconds. This works on any host including the Render free tier.

---

## API Documentation

Base URL: `http://localhost:8000/api/v1/`

### Accounts (`/accounts/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| POST | `/register/` | Create a new user | Public |
| POST | `/login/` | Login with email or username | Public |
| POST | `/token/refresh/` | Refresh JWT access token | Public |
| POST | `/google/verify/` | Google OAuth verification | Public |
| GET | `/freelancers/` | List all freelancers (public) | Public |
| GET/PUT | `/profile/` | View or update own profile | JWT |
| GET/PUT | `/profile/freelancer/` | Freelancer-specific profile | JWT |
| GET/PUT | `/profile/client/` | Client-specific profile | JWT |
| POST | `/delete-account/` | Permanently delete own account | JWT |
| GET | `/admin/users/` | List all users | Admin |
| PATCH/DELETE | `/admin/users/{id}/` | Update or delete a user | Admin |

### Gigs (`/gigs/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/gigs/` | List all active gigs | Public |
| POST | `/gigs/` | Create a new gig | JWT |
| GET | `/gigs/{id}/` | Get gig details | Public |
| PATCH | `/gigs/{id}/` | Update own gig | JWT |
| DELETE | `/gigs/{id}/` | Delete own gig | JWT |
| POST | `/gigs/{id}/toggle_active/` | Deactivate a gig | Admin |

### Projects (`/projects/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/projects/` | List open projects | Public |
| POST | `/projects/` | Post a new project | JWT |
| GET | `/projects/{id}/` | Project details | Public |
| GET | `/projects/{id}/proposals-list/` | All bids on own project | JWT (owner) |
| POST | `/projects/{id}/accept-proposal/` | Accept a proposal | JWT (owner) |
| POST | `/projects/proposals/` | Submit a proposal | JWT |

### Orders (`/orders/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/orders/` | List own orders (client or freelancer) | JWT |
| POST | `/orders/buy-gig/` | Start an order from a gig | JWT |
| GET | `/orders/{id}/` | Order details | JWT |
| POST | `/orders/{id}/mark-funded/` | Fund the escrow | JWT (client) |
| POST | `/orders/{id}/submit-work/` | Submit deliverable | JWT (freelancer) |
| POST | `/orders/{id}/approve-work/` | Release payment | JWT (client) |
| POST | `/orders/{id}/cancel/` | Cancel and refund if funded | JWT (client) |
| DELETE | `/orders/{id}/` | Delete a cancelled order | JWT (client) |

### Wallet (`/wallet/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/wallet/balance/` | Balance, wallet ID, PIN status | JWT |
| POST | `/wallet/set_pin/` | Set or change wallet PIN | JWT |
| POST | `/wallet/deposit/` | Deposit (legacy direct) | JWT |
| POST | `/wallet/withdraw/` | Withdraw to M-Pesa or bank | JWT |
| POST | `/wallet/transfer/` | Send to another wallet | JWT |
| GET | `/wallet/lookup/?wallet_id=` | Resolve a wallet ID | JWT |
| GET | `/wallet/transactions/` | Transaction history | JWT |
| GET | `/wallet/exchange-rate/` | Live USD → KES rate | Public |
| POST | `/wallet/stripe/create-intent/` | Create a Stripe PaymentIntent | JWT |
| POST | `/wallet/webhook/stripe/` | Stripe webhook receiver | Public |
| POST | `/wallet/mpesa/stk-push/` | Trigger an M-Pesa STK push | JWT |
| POST | `/wallet/webhook/mpesa/` | M-Pesa callback receiver | Public |

### Reviews (`/reviews/`)

| Method | Endpoint | Description | Auth |
| ------- | -------- | ----------- | ---- |
| GET | `/reviews/` | List reviews | Public |
| POST | `/reviews/` | Create a review for an order | JWT |

### Chat (`/chat/`)

|Method|Endpoint|Description|Auth|
|---|---|---|---|
|GET|`/chat/rooms/`|List user's chat rooms|JWT|
|GET|`/chat/rooms/{id}/`|Room details + participants|JWT|
|POST|`/chat/rooms/{id}/mark_read/`|Mark messages read|JWT|
|GET|`/chat/rooms/unread_count/`|Unread message count|JWT|
|GET|`/chat/messages/?room={id}`|Messages in a room|JWT|
|POST|`/chat/messages/`|Send a message|JWT|

WebSocket: `ws://localhost:8000/ws/chat/{room_id}/?token={jwt}`

### Notifications (`/notifications/`)

|Method|Endpoint|Description|Auth|
|---|---|---|---|
|GET|`/notifications/`|List user's notifications|JWT|
|GET|`/notifications/unread_count/`|Unread count|JWT|
|POST|`/notifications/mark_all_read/`|Mark all as read|JWT|
|POST|`/notifications/{id}/mark_read/`|Mark one as read|JWT|

### Analytics (`/analytics/`)

|Method|Endpoint|Description|Auth|
|---|---|---|---|
|GET|`/analytics/admin-stats/`|Platform-wide metrics|Admin|

---

## Testing with Postman

Import both files from the `postman/` folder:

1. `SkillBridge.postman_collection.json` — all API requests grouped by feature
2. `SkillBridge.postman_environment.json` — environment variables

The Login request auto-saves the JWT to `{{access_token}}`, so subsequent
requests authenticate automatically.

**Recommended demo order**:

1. Auth → Login
2. Wallet → Get Balance (saves `wallet_id`)
3. Gigs → Create Gig (saves `gig_id`)
4. Projects → Post Project (saves `project_id`)
5. Projects → Submit Proposal
6. Admin → Platform Stats (requires superuser)
7. Utility → Exchange Rate (public)

---

## User Roles

| Role | Capabilities |
| ------ | ------------- |
| **Client** | Post projects, hire freelancers, fund escrow, approve work, review |
| **Freelancer** | Create gigs, submit proposals, deliver work, withdraw earnings |
| **Both** | Everything from both roles |
| **Admin (Superuser)** | All of the above plus user management, moderation, analytics |

Role is chosen at registration and can be changed via `/accounts/profile/`.

---

## Deployment

### Backend — Render

1. Push code to GitHub
2. Create a **PostgreSQL** instance (Free plan)
3. Create a **Redis** instance (Free plan)
4. Create a **Web Service**:
   - **Root Directory**: (leave empty)
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd backend && daphne -b 0.0.0.0 -p $PORT config.asgi:application`

**Required environment variables on Render**:

```text
SECRET_KEY=<generate 50 random chars>
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DATABASE_URL=<Internal Database URL from Render Postgres>
REDIS_URL=<Internal Redis URL from Render Redis>
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
MPESA_CALLBACK_URL=https://YOUR-APP.onrender.com/api/v1/wallet/webhook/mpesa/
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://YOUR-APP.onrender.com
DJANGO_SUPERUSER_USERNAME=Admin
DJANGO_SUPERUSER_EMAIL=you@example.com
DJANGO_SUPERUSER_PASSWORD=<strong>
USE_REDIS_CHANNELS=True
```

### Frontend — Vercel

1. Import the repository at [vercel.com](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. **Framework Preset**: Vite
4. Environment variables:

```text
VITE_API_URL=https://YOUR-APP.onrender.com/api/v1/
VITE_WS_URL=wss://YOUR-APP.onrender.com/ws/
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

After deployment, add the Vercel domain to your Google OAuth **Authorised
JavaScript origins** and to Render's `CORS_ALLOWED_ORIGINS`.

---

## Troubleshooting

### Backend

| Problem | Solution |
| --------- | ---------- |
| `ModuleNotFoundError` | Activate venv: `source venv/Scripts/activate` |
| `DATABASE_URL` rejected | Confirm PostgreSQL port and credentials in `.env` |
| `relation does not exist` | Run `python manage.py migrate` |
| `MigrationSchemaMissing` | Grant `ALTER SCHEMA public OWNER TO skill_user` |
| `redis.exceptions.ConnectionError` | Start Redis: `sudo service redis-server start` in WSL |
| `ImproperlyConfigured` in asgi.py | Ensure `'daphne'` is first in `INSTALLED_APPS` |

### Frontend

| Problem | Solution |
| --------- | ---------- |
| `react-redux` not found | Run `npm install react-redux @reduxjs/toolkit` |
| `@tailwindcss/postcss` error | Use Tailwind v3 with `postcss.config.cjs` |
| Blank page | Check browser console for errors; hard refresh with Ctrl+Shift+R |
| WebSocket won't connect | Use `ws://127.0.0.1:8000/ws/`, not `localhost`, on Windows |
| 401 on every API call | Clear localStorage, log in fresh |

### Payments

| Problem | Solution |
| --------- | ---------- |
| `STRIPE_WEBHOOK_SECRET` mismatch | Re-run `stripe listen` and update `.env` |
| M-Pesa STK push fails with `Invalid Access Token` | Verify Consumer Key and Consumer Secret; use HTTPBasicAuth |
| M-Pesa callback never arrives | Confirm ngrok is running and `.env` URL matches |
| `Invalid PhoneNumber` | Use format `2547XXXXXXXX` (no `+`, no spaces) |

### Google OAuth

| Problem | Solution |
| --------- | ---------- |
| `Error 401: invalid_client` | Verify client ID in both `.env` files; wait 15 min after creating |
| Google button doesn't appear | Confirm `VITE_GOOGLE_CLIENT_ID` is set and Vite was restarted |
| Access blocked (test users only) | Add your email under OAuth consent screen → Audience → Test users |

---

## Roadmap

### Phase 1 — MVP

- User registration and Google login
- Freelancer profiles with portfolios
- Gig creation and browsing
- Project posting and proposals
- Escrow with M-Pesa and Stripe
- Basic chat and 5-star ratings
- Admin dashboard

### Phase 2 — Core Enhancements

- AI-powered explainable matching
- WebSocket chat with file sharing
- Multi-dimensional ratings (4 dimensions)
- Automated invoicing
- Analytics dashboards
- Multi-currency support (7 currencies)

### Phase 3 — Advanced Features (in progress)

- Built-in video calls and screen sharing
- Cryptocurrency payments (USDC, BTC)
- Mobile app (React Native)
- Smart contracts with blockchain escrow
- Automated skill verification

### Phase 4 — Ecosystem (planned)

- Team projects (multiple freelancers)
- Project insurance for high-value contracts
- Open API for third-party integrations
- Niche sub-marketplaces (design, dev, writing)
- Learning platform with courses
- Community forums and networking events

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure:

- `.env` files are never committed
- Migrations accompany every model change
- Linting passes (`ruff` for Python, `eslint` for JS)
- API changes are reflected in the Postman collection

---

## License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## Acknowledgments

- **Django** and **Django REST Framework** teams
- **Safaricom Daraja** for M-Pesa sandbox access
- **Stripe** for global card payments
- **Render** and **Vercel** for free hosting tiers
- The open-source community for the tools that made this possible

---

## Contact

- **Project Maintainer**: Kyle Kinyua
- **Email**: [kylekinyua001@gmail.com](mailto:kylekinyua001@gmail.com)
- **Repository**: [github.com/Kyle-00/skill-bridge](https://github.com/Kyle-00/skill-bridge)

---

**SkillBridge** — Building the trust infrastructure for the future of work.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
