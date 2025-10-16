# HerbSense

A production-ready plant identification and herbal medicine information platform built with Next.js, Supabase, and Stripe.

## Overview

HerbSense allows users to:
- Identify plants using AI-powered recognition (Plant.id, Pl@ntNet, or mock mode)
- Access comprehensive herbal monographs with evidence-based information
- Save favorites and view scan history
- Upgrade to Pro for unlimited scans

## Tech Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Payments**: Stripe Subscriptions
- **Plant ID**: Plant.id or Pl@ntNet APIs (configurable)

## Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes (Stripe checkout)
│   ├── admin/                # Admin panel for monograph management
│   ├── plant/[species]/      # Dynamic plant detail pages
│   ├── scan/                 # Plant scanning interface
│   ├── history/              # Scan history
│   ├── favorites/            # Saved favorites
│   └── settings/             # User settings & subscription
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── header.tsx            # App header with navigation
│   ├── uploader.tsx          # Image upload component
│   ├── candidate-card.tsx    # Identification result card
│   ├── evidence-badge.tsx    # Evidence level badge
│   ├── section-card.tsx      # Monograph section wrapper
│   ├── citations-list.tsx    # Citations display
│   ├── paywall-dialog.tsx    # Upgrade prompt
│   └── quota-badge.tsx       # Scan quota display
├── lib/                      # Utility functions and configs
│   ├── supabase/             # Supabase client setup
│   ├── auth/                 # Auth provider
│   └── types/                # TypeScript types
├── hooks/                    # Custom React hooks
│   ├── use-entitlement.ts    # Pro subscription status
│   ├── use-limits.ts         # Scan quota management
│   └── use-favorites.ts      # Favorites CRUD
└── supabase/                 # Supabase configuration
    ├── migrations/           # SQL migrations
    └── functions/            # Edge Functions
        ├── identify/         # Plant identification
        └── stripe-webhook/   # Stripe event handling
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- (Optional) Stripe account for payments
- (Optional) Plant.id or Pl@ntNet API key

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:

   Copy `.env` and update with your credentials:

   ```bash
   # Supabase (already configured in this project)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Free tier limits
   NEXT_PUBLIC_FREE_SCANS_PER_DAY=5
   FREE_SCANS_PER_DAY=5

   # Stripe (optional for local dev)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Plant Identification Provider
   PLANT_PROVIDER=mock  # Options: mock, plantid, plantnet
   PLANTID_API_KEY=your_plantid_key
   PLANTNET_API_KEY=your_plantnet_key
   ```

3. **Database setup**:

   The Supabase database is already configured with:
   - Schema migrations (profiles, scans, monographs, etc.)
   - RLS policies for security
   - Seed data with 10 sample monographs

4. **Edge Functions**:

   Two Edge Functions are already deployed:
   - `identify`: Plant identification with quota enforcement
   - `stripe-webhook`: Subscription webhook handling

5. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **profiles**: User profiles with plan type (free/pro)
- **entitlements**: Pro subscription details and expiration
- **scans**: Plant identification history with results
- **favorites**: User-saved plants
- **monographs**: Comprehensive herbal information
- **citations**: Academic references for monographs
- **audit_logs**: Admin action tracking

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only access their own data (profiles, scans, favorites)
- Monographs and citations are publicly readable
- Admin operations require service_role

## Edge Functions

### identify

Handles plant identification:
- Validates and processes uploaded images
- Enforces daily scan quotas for free users
- Calls external plant ID APIs (Plant.id/Pl@ntNet)
- Stores results in database
- Returns normalized candidates

**Endpoint**: `${SUPABASE_URL}/functions/v1/identify`

### stripe-webhook

Processes Stripe webhook events:
- `checkout.session.completed`: Activate Pro subscription
- `customer.subscription.updated`: Update subscription status
- `customer.subscription.deleted`: Downgrade to free

**Endpoint**: `${SUPABASE_URL}/functions/v1/stripe-webhook`

## Authentication

HerbSense supports two authentication methods:

1. **Anonymous Sign-in** (default): Instant access without email
2. **Magic Link**: Email-based passwordless authentication

Authentication is handled by Supabase Auth with automatic profile creation on first sign-in.

## Stripe Integration

### Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add keys to `.env` file
4. Configure webhook endpoint: `${SUPABASE_URL}/functions/v1/stripe-webhook`
5. Update `STRIPE_WEBHOOK_SECRET` with signing secret

### Checkout Flow

1. User clicks "Upgrade to Pro" → `/api/stripe/checkout`
2. API creates Stripe Checkout session with user_id in metadata
3. User completes payment on Stripe
4. Webhook updates `entitlements` table
5. User gains unlimited scans

## Plant Identification Providers

### Mock Mode (Default)

Returns static test data. Good for development without API costs.

```bash
PLANT_PROVIDER=mock
```

### Plant.id (Kindwise)

Sign up at [plant.id](https://web.plant.id/)

```bash
PLANT_PROVIDER=plantid
PLANTID_API_KEY=your_api_key
```

### Pl@ntNet

Sign up at [plantnet.org](https://my.plantnet.org/)

```bash
PLANT_PROVIDER=plantnet
PLANTNET_API_KEY=your_api_key
```

## Admin Panel

Access monograph management at `/admin/monographs`

Features:
- List all monographs
- Search by species or common name
- Edit existing monographs (create editor page as needed)

**Note**: Admin operations require server-side authentication with service role key. Implement proper authentication before production use.

## Deployment

### Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in project settings
4. Deploy

### Supabase

Database and Edge Functions are already deployed. To update:

1. Edge Functions are deployed via the Supabase management API
2. Migrations are applied automatically via the MCP tool
3. Monitor functions in Supabase Dashboard

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `NEXT_PUBLIC_FREE_SCANS_PER_DAY` | Yes | Free tier daily scan limit |
| `FREE_SCANS_PER_DAY` | Yes | Same as above for Edge Functions |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `PLANT_PROVIDER` | Yes | Plant ID provider: mock/plantid/plantnet |
| `PLANTID_API_KEY` | No | Plant.id API key |
| `PLANTNET_API_KEY` | No | Pl@ntNet API key |

## Important Security Notes

1. **Educational Use Only**: All content is for educational purposes. Include disclaimers prominently.
2. **API Keys**: Never commit API keys to version control
3. **RLS Policies**: Verify RLS policies are working correctly
4. **Input Validation**: All user inputs are validated on the server
5. **Rate Limiting**: Consider adding rate limiting for production

## Testing

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

## License

This project is for educational and demonstration purposes.

## Support

For issues or questions:
1. Check Supabase logs for Edge Function errors
2. Verify environment variables are set correctly
3. Check browser console for client-side errors
4. Review RLS policies if data access fails

---

**Disclaimer**: HerbSense provides information for educational purposes only. Always consult qualified healthcare professionals before using herbal remedies. Never self-diagnose or self-treat serious medical conditions.
