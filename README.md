# Rentigo - Peer-to-Peer Rental Marketplace

Rent anything from people nearby. Promote reuse, circular economy, and sustainability.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Payments:** Stripe Connect (peer-to-peer with 5% platform fee)
- **Data Fetching:** TanStack React Query
- **Forms:** React Hook Form + Zod validation
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Maps:** React Leaflet + OpenStreetMap
- **SEO:** Server-side rendering, JSON-LD, dynamic metadata, sitemap

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Stripe account with Connect enabled

### 1. Clone and Install

```bash
git clone <repo-url>
cd rentigo
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Application URL (http://localhost:3000) |

### 3. Database Setup

Run the migration SQL in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, indexes, RLS policies, storage buckets, triggers, and seed data.

### 4. Generate Types

```bash
npm run gen:types
```

Or manually:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 5. Stripe Webhook

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth callback & signup webhook
│   │   ├── bookings/         # Booking creation with Stripe
│   │   └── stripe/           # Connect onboarding & webhooks
│   ├── auth/                 # Login & signup pages
│   ├── checkout/             # Post-payment confirmation
│   ├── favorites/            # Saved items page
│   ├── items/                # Item detail & create pages
│   ├── map/                  # Map view page
│   ├── marketplace/          # Search & browse page
│   ├── messages/             # Messaging pages
│   ├── profile/              # User profile page
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Home page
├── components/
│   ├── booking/              # Booking form
│   ├── items/                # Item card, grid, image upload
│   ├── layout/               # Header, footer
│   ├── map/                  # Map view component
│   ├── messages/             # Chat window
│   ├── search/               # Search filters
│   └── ui/                   # Button, input, select, etc.
├── hooks/                    # React Query hooks
├── lib/                      # Utilities, Supabase, Stripe, validation
├── providers/                # Auth & React Query providers
└── types/                    # TypeScript types & database types
```

## Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   users       │     │  categories  │     │   items      │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)      │
│ email        │     │ name         │     │ owner_id (FK)│──→ users.id
│ name         │     │ slug         │     │ title        │
│ avatar_url   │     │ icon         │     │ slug         │
│ location     │     └──────────────┘     │ description  │
│ stripe_id    │           │              │ category_id  │──→ categories.id
│ created_at   │           │              │ price_per_day│
└──────────────┘           │              │ lat/lng      │
       │                   └──────────────│ city         │
       │                                  │ images[]     │
       │                                  │ created_at   │
       │                                  └──────────────┘
       │                                         │
       │    ┌──────────────┐              ┌──────────────┐
       │    │  favorites   │              │  bookings    │
       │    ├──────────────┤              ├──────────────┤
       ├───→│ user_id (FK) │              │ id (PK)      │
       │    │ item_id (FK) │──→ items.id  │ item_id (FK) │──→ items.id
       │    │ created_at   │              │ renter_id(FK)│──→ users.id
       │    └──────────────┘              │ start_date   │
       │                                  │ end_date     │
       │    ┌──────────────┐              │ total_price  │
       │    │conversations │              │ stripe_pi    │
       │    ├──────────────┤              │ status       │
       ├───→│ renter_id(FK)│              │ created_at   │
       ├───→│ owner_id(FK) │              └──────────────┘
       │    │ item_id (FK) │──→ items.id
       │    │ created_at   │
       │    └──────────────┘
       │           │
       │    ┌──────────────┐
       │    │  messages    │
       │    ├──────────────┤
       │    │ id (PK)      │
       │    │ conv_id (FK) │──→ conversations.id
       └───→│ sender_id(FK)│
            │ message      │
            │ created_at   │
            └──────────────┘
```

### Relationships

- A **user** can own multiple **items**
- A **user** can rent multiple **items** (via bookings)
- An **item** belongs to one **category**
- An **item** can have multiple **bookings**
- **Users** can save **items** as **favorites**
- **Users** can have **conversations** linked to **items**
- **Conversations** contain multiple **messages**

## Key Features

### Payment Flow (Stripe Connect)

1. Renter selects dates and clicks "Book & Pay"
2. API creates a booking (status: pending) and Stripe Checkout session
3. Payment is split: 95% to owner, 5% platform fee
4. Stripe webhook confirms payment → booking status: confirmed

### SEO

- Server-rendered item pages with dynamic metadata
- JSON-LD structured data (Product schema)
- SEO-friendly URLs: `/items/canon-camera-brussels`
- Automatic sitemap generation via `next-sitemap`
- OpenGraph and Twitter Card tags

### Realtime Messaging

- Uses Supabase Realtime Postgres Changes
- Messages appear instantly without page refresh
- Private conversations linked to items

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Stripe Webhook (Production)

Add a webhook endpoint in Stripe Dashboard:
- URL: `https://your-domain.com/api/stripe/webhooks`
- Events: `checkout.session.completed`, `checkout.session.expired`

## License

MIT
