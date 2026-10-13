# Tech Stack

- **React 18** + **Vite** + **TypeScript** (strict)
- **Tailwind CSS** utility-first styling + custom Miniso brand tokens
- **shadcn/ui** primitive components (Radix UI under the hood) — built from scratch in `src/components/ui/`
- **React Router v6** with lazy route-level code splitting
- **Zustand** (cart, auth, UI state) with `persist` middleware (localStorage)
- **TanStack Query** over an in-memory mock service layer with artificial 200–600 ms latency
- **react-hook-form** + **zod** for all forms
- **Recharts** for all dashboard and report charts
- **i18next** / **react-i18next** for English / Amharic (EN default)
- **@faker-js/faker** seeded at 42 — only for deterministic seed generation, never at render time
- **Vitest** + **React Testing Library** for domain logic unit tests

Rules:
- No real network calls; no secrets committed
- Mobile-first responsive design (360 px minimum)
- WCAG AA colour contrast on all interactive elements
- No `any` types — use `unknown` + type guards where necessary
- All user-facing strings go through `t()` from react-i18next
- All async data through TanStack Query hooks — no raw `useEffect` fetching
