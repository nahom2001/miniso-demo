# Product

Demo of a multi-surface e-commerce platform for a retail client (Miniso Ethiopia).

Surfaces:
1. **Customer storefront** — public-facing shop at `/`
2. **Admin back office** — role-gated at `/admin`
3. **Client ERP Simulator** — integration demo at `/erp-sim`

All data is mocked client-side with `@faker-js/faker` (seeded for determinism) and persisted in `localStorage`.

The demo must feel **real, fast and polished**. Primary audience: client executives in a sales presentation.
Prioritise visual polish, smooth flows and believable data over completeness of edge cases.

Branding is driven by `src/config/brand.config.ts` (name, logo, primary/secondary colours).
Items labelled with the `<Badge variant="tbc">` component are "Demo / TBC" to the audience.
