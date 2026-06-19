# LA Checkout Demo

A demo app showcasing Stripe's Payment Element integrated into a LA-style class booking flow. Built with Node.js, Express, and EJS.

## Features

- Package selection (Starter Pack · 10 lessons / Pro Pack · 50 lessons)
- Payment method selection with per-package availability rules:
  - Card — 3% surcharge applied (all packages)
  - Instant Bank Payment / ACH直接借记 · 立刻到账 — Stripe Link (Starter Pack only)
  - ACH Direct Debit / ACH直接借记 · 延时到账 (Pro Pack only)
  - Alipay, WeChat Pay (all packages)
- Stripe Payment Element using `payment_method_types` — no Payment Method Configuration required
- PaymentIntent API (not Checkout Sessions)
- Base URL redirects directly to the Book Class page

## Prerequisites

- Node.js 18+
- A [Stripe account](https://dashboard.stripe.com/register) with test mode enabled

## Setup

**1. Clone the repo and install dependencies:**

```bash
git clone <your-repo-url>
cd la-test-checkout
npm install
```

**2. Copy the environment file and fill in your values:**

```bash
cp .env.example .env
```

Open `.env` and add your Stripe keys:

| Variable | Where to find it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |

**3. Run the app:**

```bash
npm start        # production
npm run dev      # development (auto-reload with nodemon)
```

Open [http://localhost:3000](http://localhost:3000) — redirects straight to Book Class.

## User Flow

```
/ → redirects to /book-class
      └── /book-class                              (select package: Starter or Pro)
            └── /book-class/payment?package=10|50  (select payment method)
                  └── /checkout?package=10|50&method=card|ibp|ach|alipay|wechat
                        └── /book-class/confirmed  (post-payment confirmation)
```

## Payment Method Mapping

| Method selected | Stripe `payment_method_types` | Available for |
|---|---|---|
| Card | `['card']` | All packages (+3% surcharge) |
| Instant Bank Payment (IBP) | `['link']` | Starter Pack only |
| ACH Direct Debit | `['us_bank_account']` | Pro Pack only |
| Alipay | `['alipay']` | All packages |
| WeChat Pay | `['wechat_pay']` | All packages |

## Project Structure

```
├── routes/
│   ├── index.js        # Redirects / → /book-class
│   ├── booking.js      # Book class, payment method selection, confirmed
│   └── checkout.js     # Checkout page + Stripe API endpoints
├── views/
│   ├── book-class.ejs
│   ├── payment.ejs           # Payment method selection
│   ├── checkout.ejs          # Stripe Payment Element
│   ├── book-class-confirmed.ejs
│   └── partials/             # topbar, navbar, sidebar
├── public/
│   ├── css/
│   └── js/checkout.js        # Stripe Elements frontend logic
├── .env.example
├── server.js
└── vercel.json
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/checkout/api/create-payment-intent` | Creates a Stripe PaymentIntent and returns `clientSecret` |
| `GET` | `/checkout/api/payment-intent-status` | Retrieves PaymentIntent status by `?payment_intent=` |

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel --prod
```

### Other Node.js hosts

Set the two environment variables above and run `npm start`. The app listens on `process.env.PORT` (default 3000).

## Security notes

- Never commit `.env` — it is listed in `.gitignore`
- The Stripe secret key is used server-side only (`routes/checkout.js`)
- The publishable key is safe to expose in the browser
- No Payment Method Configuration (PMC) IDs are used — all payment method restrictions are handled via `payment_method_types` on the PaymentIntent
