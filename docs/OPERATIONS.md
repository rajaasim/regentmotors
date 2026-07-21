# Regent Motors CMS operations

## R2 bucket

Create one private R2 bucket for the project and expose only the approved public/custom host through `R2_PUBLIC_BASE_URL`. The application needs S3-compatible `PutObject`, `HeadObject` and `DeleteObject` access for its scoped bucket; do not use account-wide credentials. Presigned upload URLs expire after five minutes and include the expected content type.

Set the bucket CORS policy to the exact local and preview origins used by the project, plus the production origin once the client supplies it. A safe starting shape is:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://preview.example.com"],
    "AllowedMethods": ["PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 300
  }
]
```

Replace example origins before provisioning. Do not allow `*` for authenticated uploads.

## Neon/PostgreSQL

Apply the committed Drizzle migrations with `pnpm db:migrate`, then run `pnpm db:seed-source` once to import the traceable client-supplied source records. Keep `DATABASE_URL` in Vercel environment configuration only; never commit it or paste it into content settings.

## Staff administration

Set `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` only for the one-time `pnpm admin:bootstrap` command. Remove those shell variables after the command. Use `pnpm admin:reset-password` for a maintainer-controlled reset; it revokes all existing sessions. Public registration is disabled in normal application configuration.

Vehicles are created as drafts. Staff must add accurate factual fields and at least one verified image with alternative text before publishing. Publication (`draft`, `published`) is independent from inventory (`available`, `reserved`, `sold`). There is no archive or hard-delete action in the staff interface, and lead history remains independent from vehicle changes.

Settings contain mapped business details, public copy and SEO only. Navigation paths, validation enums, secrets, credentials, deployment configuration and application formulas remain code-owned.

## Media cleanup

Run `pnpm media:cleanup` from a controlled maintenance environment with the database and R2 credentials set. It removes expired upload intents and deferred object deletions. It does not delete active or finalized objects.

## Vercel preview

Configure the variables in `.env.example` separately for Development and Preview. Set `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `R2_PUBLIC_BASE_URL` and Turnstile allowed hostnames to the exact preview URL. Run migrations against the intended Neon database before bootstrapping the first real administrator.

## Backup and export

Take a PostgreSQL export before production migrations and on the client-approved maintenance schedule; verify restoration in a non-production database. Treat the R2 bucket and database as one content set: retain an object inventory/export alongside database backups, and confirm bucket versioning or retention policy with the account owner before launch.
