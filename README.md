# Miniso Ethiopia — E-commerce Demo

A front-end-only React demonstration of the ConDigital E-commerce + ERP Integration solution for Miniso Ethiopia.

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
```

## Demo Accounts (password: `demo123`)

| Role       | Email              |
|------------|--------------------|
| Admin      | admin@demo         |
| Manager    | manager@demo       |
| Staff      | staff@demo         |
| Marketing  | marketing@demo     |
| Finance    | finance@demo       |
| Customer   | customer@demo      |

All accounts are shown as one-click buttons on the Login page.

## Demo Surfaces

| Surface           | URL          | Description                                    |
|-------------------|--------------|------------------------------------------------|
| Storefront        | `/`          | Customer-facing shop — browse, cart, checkout  |
| Customer Account  | `/account`   | Orders, wishlist, addresses, profile           |
| Admin Back Office | `/admin`     | Dashboard, orders, catalogue, inventory, etc.  |
| ERP Simulator     | `/erp-sim`   | Real-time inventory/sales/payment sync demo    |

## Demo Control Bar

The floating bar (bottom-left) lets the presenter:
- **Switch role** with one click (applies full RBAC instantly)
- **Switch language** — English / Amharic
- **Switch currency** — ETB / USD
- **Trigger events** — New order, Low stock alert, Payment settled
- **Start/pause** the event simulator (generates live orders automatically)
- **Reset all demo data** to the original seed

## Key Features Built

- 60 products across 8 categories (Plush, Stationery, Beauty, Home, Electronics, Snacks, Fashion, Vouchers)
- 150 historical orders, 12 refunds, 8 returns, 25 reviews
- 6 coupons with live validation in cart
- Multi-language storefront (EN + Amharic) with Noto Sans Ethiopic font
- Multi-currency pricing (ETB / USD)
- Hero banner carousel with auto-advance
- Full checkout flow: Contact → Delivery → Payment → Review → Confirmation
- Mock payment gateway with configurable success/fail/pending outcome
- Printable receipt on order confirmation
- Admin dashboard with live KPI cards, area/bar/pie charts, live activity feed
- Order status machine with timeline view
- Stock adjustment with audit trail
- Marketing: coupons, banners, email/SMS campaigns with stats
- Reports: sales, products, customers, payments — CSV export button
- Integrations page with test-connection mock
- API docs page with REST endpoint samples
- Backup & Recovery with mock progress bar
- Users & Roles matrix showing all permissions
- ERP Simulator with BroadcastChannel cross-tab sync
- Sync log with direction arrows, failure + retry simulation

## Architecture

- **Zero backend** — all data in `localStorage`, reset on demand
- **BroadcastChannel** lets the Storefront and ERP Simulator sync across two browser tabs
- **Zustand** stores persist cart and auth across page refreshes
- **TanStack Query** with 200–600 ms artificial latency for realistic feel
- Route-level lazy loading — 60+ code-split chunks
- Deterministic seed (`faker.seed(42)`) — same data every reset

## Build

```bash
npm run build      # production bundle in dist/
npm run preview    # preview the production build
npm run typecheck  # TypeScript strict check
npm run test       # Vitest unit tests
```

## Deploy

Drop the `dist/` folder on any static host (Vercel, Netlify, S3+CloudFront). No server needed.

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir dist
```
