# Regent Motors

Production-oriented v1 skeleton for the Regent Motors dealership website.

The site uses static, typed content for the public pages and inventory. Public forms persist approved lead data to PostgreSQL through a server-only data layer. CMS functionality, user accounts, administration and notifications are intentionally outside the v1 scope.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Neon PostgreSQL
- Drizzle ORM
- Zod
- Cloudflare Turnstile integration boundary
- Playwright
- pnpm

## Routes

- `/`
- `/inventory`
- `/financing`
- `/contact`
- `POST /api/leads`

## Local setup

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

The public site can be viewed without database credentials. Form submission remains unavailable until PostgreSQL and Turnstile environment values are configured.

## Checks

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm test:e2e
```

The browser suite uses the machine's existing Google Chrome installation and does not download a separate Playwright browser build.

## Database

Generate a migration after changing `src/db/schema.ts`:

```powershell
pnpm db:generate
```

Apply committed migrations to the configured database:

```powershell
pnpm db:migrate
```

Database code is isolated under `src/db` and `src/data/leads.ts`. Do not import it into Client Components.

## Key project references

- Product and technical scope: `docs/V1-SPECIFICATION.md`
- Completed remediation record: `docs/REMEDIATION-CHECKLIST.md`
- Approved visual archive: `reference-screenshots/README.md`
- Static inventory: `src/data/vehicles.ts`
- Lead validation contract: `src/lib/lead-validation.ts`
- Database schema: `src/db/schema.ts`

## TODO backlog

- [TODO] Confirm client-approved final content and legal language.
- [TODO] Configure production Neon and Turnstile credentials before launch.
- [TODO] Complete final visual matching against every reference screenshot.
- [TODO] Add a CMS or external inventory feed only if the client approves that requirement.
- [TODO] Add notifications or CRM delivery only if the client approves that requirement.
- [TODO] Add a protected lead-management interface only if the client approves that requirement.
