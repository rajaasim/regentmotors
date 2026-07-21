# Regent Motors

Regent Motors is a complete CMS-enabled dealership website. Public visitors can browse the current vehicle collection and submit approved enquiry forms. Authorized staff can manage vehicles, images and mapped site settings through a protected project-owned administration area.

There are no customer accounts or public registration. Staff authentication exists only for `/admin`. Lead submissions remain private PostgreSQL records; notification delivery and lead-management screens are outside the current scope.

## Stack

- Next.js 16 App Router, React 19 and strict TypeScript
- Tailwind CSS 4
- PostgreSQL/Neon with Drizzle ORM
- Better Auth for staff-only database sessions
- Cloudflare R2 through its S3-compatible API
- Zod and Cloudflare Turnstile
- Vitest, PGlite and Playwright
- pnpm

## Routes

Public:

- `/`
- `/inventory`
- `/financing`
- `/contact`
- `POST /api/leads`

Staff administration:

- `/admin/login`
- `/admin`
- `/admin/vehicles`
- `/admin/vehicles/new`
- `/admin/vehicles/[id]`
- `/admin/settings`

Authentication API requests use `/api/auth/*`. Media upload intents and finalization use protected server boundaries; the browser sends image bytes directly to R2.

## Local setup

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

The approved static source data remains available as a typed fallback when no database is configured. Database-backed administration, lead persistence and real R2 uploads require the corresponding local environment values.

The application uses a direct PostgreSQL connection, so the same `DATABASE_URL` format works with local PostgreSQL and Neon. Local development can therefore run the complete schema and seed workflow without a Neon account.

Never commit `.env.local` or real credentials.

## Database workflow

Generate a reviewable migration after changing `src/db/schema.ts`:

```powershell
pnpm db:generate
```

Apply committed migrations to the configured database:

```powershell
pnpm db:migrate
```

Bootstrap commands and source-content migration commands will refuse to run without explicit configuration. They must not print staff passwords or secrets.

After applying migrations, seed the reviewable client-supplied source records with `pnpm db:seed-source`. Create the first staff account with `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` set, then run `pnpm admin:bootstrap`. Use `pnpm admin:reset-password` for maintainer-controlled recovery and `pnpm media:cleanup` for expired/deferred R2 upload cleanup.

Drizzle is the only production migration owner. Database modules are server-only and must never be imported by Client Components.

## Checks

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

The browser suite uses the machine's existing Google Chrome installation and does not download a separate Playwright browser build.

## Content and security boundaries

- Public inventory queries return published records only.
- Vehicle publication state is separate from available/reserved/sold state.
- Site settings are a strict singleton with mapped fields; secrets and executable configuration are never editable content.
- Public forms repeat validation on the server and pass Turnstile before writes.
- Every admin page and mutation validates the database-backed staff session on the server.
- Proxy redirects are an optimistic UX layer, not authorization.
- R2 credentials remain server-only. Uploads use staff-authorized, short-lived presigned URLs and protected finalization.
- Image binaries live in R2; PostgreSQL stores metadata, relationships, ordering and alt text.

## External setup

The user/client owns provisioning and credentials for Neon, Cloudflare R2, Turnstile and Vercel. Follow [`upgrade.md`](./upgrade.md), section 17, for the remaining external checklist. Future VPS work is separately deferred.

## Key references

- CMS execution checklist: `upgrade.md`
- Product and technical scope: `docs/V1-SPECIFICATION.md`
- Engineering rules: `RULES.md`
- Completed remediation record: `docs/REMEDIATION-CHECKLIST.md`
- Approved visual archive: `reference-screenshots/README.md`
- Current migration inputs: `src/data/vehicles.ts` and `src/data/site.ts`
- Lead validation contract: `src/lib/lead-validation.ts`
- Database schema: `src/db/schema.ts`
- Operations and external setup details: `docs/OPERATIONS.md`

## Deferred features

- [TODO] Add protected lead review/status workflows only if the client requests them.
- [TODO] Add notification delivery only after provider and destination approval.
- [TODO] Add email-based staff recovery only after a sending provider/domain is approved.
- [TODO] Add customer accounts only as a separately approved product change.
- [TODO] Plan future VPS work separately from the current CMS upgrade.
