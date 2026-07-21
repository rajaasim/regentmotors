# Regent Motors CMS Upgrade Checklist

- Status: local implementation complete; external provisioning and client decisions remain
- Product level: complete CMS-enabled v1, not an MVP
- Selected stack: Next.js, Drizzle, PostgreSQL/Neon, Better Auth, Cloudflare R2, Cloudflare Turnstile and Vercel
- Tracking rule: check an item only after its implementation and proportional verification are complete
- External rule: items marked `[EXTERNAL]` require user-controlled accounts, credentials or client input and are not implementation blockers where a safe local path exists
- Last updated: 2026-07-19

## 0. Final decisions

- [x] Use a narrow project-owned CMS rather than a general page builder.
- [x] Use PostgreSQL as the source of truth for vehicles, site settings, leads, staff authentication and audit records.
- [x] Use Cloudflare R2 for vehicle and editable site images.
- [x] Use Better Auth with Drizzle for staff-only authentication.
- [x] Do not add public registration, customer accounts or customer login.
- [x] Treat leads as public form submissions, not user accounts.
- [x] Keep email, SMS, Slack and CRM notifications out of this upgrade.
- [x] Keep the initial admin focused on vehicles and mapped site settings.
- [x] Defer protected lead-management screens until the client explicitly requests them.
- [x] Use Vercel Hobby only for development, testing and client review.
- [x] Leave future VPS work outside this checklist.

## 1. Documentation and scope alignment

- [x] Update `docs/V1-SPECIFICATION.md` so CMS, staff authentication, PostgreSQL-backed content and R2 media are included in v1.
- [x] Remove obsolete Sanity/static-content statements and deferred CMS entries from the v1 specification.
- [x] Update `RULES.md` so the approved CMS, authentication, admin and R2 boundaries are permitted without weakening existing safety rules.
- [x] Update `README.md` with the CMS architecture, local setup, migrations, admin bootstrap and testing workflow.
- [x] Update `.env.example` with every required non-secret environment variable and safe format hints.
- [x] Keep email notifications, customer accounts, lead-management UI and generalized page-building explicitly excluded.
- [x] Document the difference between public leads, staff users and sessions.
- [x] Document that secrets and infrastructure configuration are never editable site settings.

## 2. Installed-version research and implementation plan

- [x] Inspect the installed Next.js, React, Drizzle and PostgreSQL packages before adding dependencies.
- [x] Read the relevant installed Next.js 16 documentation in `node_modules/next/dist/docs/` for authentication proxy behavior, caching, revalidation, Route Handlers and Server Actions.
- [x] Verify the selected Better Auth version supports the installed Next.js and Drizzle versions.
- [x] Verify the selected AWS S3 SDK packages support R2 presigned `PUT` and `HEAD` operations.
- [x] Record version-specific constraints: Proxy is optimistic only; every mutation rechecks authorization; Server Actions have a 1 MB body limit; direct database reads use explicit cache/revalidation; R2 image bytes bypass Functions through presigned uploads.
- [x] Create an implementation sequence that keeps the typed source active until the database schema, migration and repositories are verified, then switches public accessors in one stage.

## 3. Environment and server-only configuration

- [x] Define and validate `DATABASE_URL` at the server boundary.
- [x] Define and validate `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` at the server boundary.
- [x] Define and validate `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` and `R2_PUBLIC_BASE_URL` at the server boundary.
- [x] Retain validated `NEXT_PUBLIC_SITE_URL`, Turnstile site key and Turnstile secret handling.
- [x] Ensure secrets cannot be imported into Client Components.
- [x] Provide clear startup errors for missing required server configuration without printing secret values.
- [x] Support a safe local/test configuration that does not require committing or inventing production credentials.
- [x] Verify `.env.local`, generated migrations, build output and test artifacts follow repository hygiene rules.

## 4. PostgreSQL schema and migrations

- [x] Preserve the existing allow-listed leads schema and its privacy constraints.
- [x] Add a `vehicles` table with stable ID, unique slug, publication status, inventory status and the approved vehicle fields.
- [x] Separate staff publication state (`draft`, `published`) from inventory state (`available`, `reserved`, `sold`); do not expose the legacy archive state in administration.
- [x] Add database constraints for valid statuses, unique slugs and valid non-negative numeric fields.
- [x] Add a `vehicle_images` table containing R2 object metadata, alt text and deterministic ordering.
- [x] Add a strictly enforced singleton `site_settings` table.
- [x] Add Better Auth-managed staff user, session, account and verification tables required by the selected configuration.
- [x] Add an append-only `admin_audit_events` table with minimal safe change summaries.
- [x] Add a `pending_media_uploads` table or equally durable mechanism for upload finalization and orphan cleanup.
- [x] Add required foreign keys and intentional delete/archive behavior.
- [x] Add indexes for public inventory queries, unique lead references, sessions and upload intents.
- [x] Ensure Drizzle is the only schema-migration owner.
- [x] Generate reviewable migrations without destructive changes to existing lead data.
- [x] Add schema-level tests for constraints and important relationships.

## 5. Strict domain types and validation

- [x] Update the `Vehicle` domain type without introducing `any`, broad strings or unsafe assertions.
- [x] Add explicit publication-status and inventory-status unions.
- [x] Define strict server-side Zod schemas for vehicle create and update operations.
- [x] Define strict server-side Zod schemas for site-settings reads and writes.
- [x] Define strict upload-intent and upload-finalization schemas.
- [x] Validate database rows at the data-access boundary where runtime trust is not guaranteed.
- [x] Keep client-side validation as a usability layer only.
- [x] Reject unknown or arbitrary submitted keys in the completed validation schemas.
- [x] Add focused validation tests for valid, invalid and boundary inputs.

## 6. Staff authentication

- [x] Install and configure Better Auth with the Drizzle/PostgreSQL adapter.
- [x] Mount only the required authentication Route Handler endpoints.
- [x] Disable public sign-up in configuration and UI.
- [x] Add a controlled CLI or server-side bootstrap command for the first administrator.
- [x] Ensure the bootstrap command never logs or commits the password.
- [x] Add centralized server-side session helpers such as `getAuthenticatedStaff()` and `requireStaff()`.
- [x] Add role support only to the minimum needed for one administrator while keeping a safe upgrade path for an editor role.
- [x] Add secure login, logout, expiration and revocation behavior.
- [x] Configure secure, HTTP-only and appropriate same-site cookies outside local development.
- [x] Rate-limit login attempts without persisting sensitive submitted credentials.
- [x] Add `proxy.ts` only as an optimistic redirect layer; never use it as the sole authorization check.
- [x] Add a maintainer-controlled password-recovery/reset command while email delivery remains excluded.
- [x] Test successful login, invalid login, logout, expired sessions, revoked sessions and unauthorized access.
- [x] Verify no public-registration path or customer-account functionality exists.

## 7. Admin shell and accessibility

- [x] Add `/admin/login` with accessible labels, errors, focus handling and status messages.
- [x] Add a protected `/admin` layout with server-side authorization.
- [x] Add concise admin navigation for Overview, Vehicles and Settings only.
- [x] Add an admin overview without fake metrics, charts, activity or placeholder controls.
- [x] Add an explicit logout control.
- [x] Ensure every admin interaction is keyboard operable with visible focus states.
- [x] Ensure admin pages work across supported mobile, tablet and desktop widths.
- [x] Prevent horizontal overflow and inaccessible fixed-height panels.
- [x] Respect reduced-motion preferences.
- [x] Add helpful not-found, unauthorized and unexpected-error states without leaking internals.

## 8. Vehicle administration

- [x] Add protected `/admin/vehicles` listing with search and status filtering.
- [x] Add protected `/admin/vehicles/new` for creating drafts.
- [x] Add protected `/admin/vehicles/[id]` for editing existing records.
- [x] Map every approved vehicle field from the current typed model.
- [x] Generate a proposed slug from vehicle data while allowing validated correction before publication.
- [x] Enforce unique slugs and surface conflicts clearly.
- [x] Support clear draft and publish transitions; the archive workflow was removed after staff review.
- [x] Support available, reserved and sold inventory transitions independently from publication.
- [x] Support the featured flag without allowing it to publish a draft.
- [x] Prevent hard deletion of vehicles referenced by leads.
- [x] Require accurate factual fields before publication.
- [x] Require at least the approved minimum image/alt-text state before publication once the image policy is supplied.
- [x] Add safe loading, validation, success, conflict and failure states.
- [x] Record material vehicle mutations in the audit table.
- [x] Revalidate affected public inventory caches after successful mutations.
- [x] Add unit/integration tests for authorization, validation and lifecycle transitions.

## 9. R2 image management

- [x] Add a server-only R2 client with least-privilege bucket configuration.
- [x] Add a protected upload-intent endpoint or Server Action.
- [x] Verify staff authorization before issuing any upload intent.
- [x] Generate collision-resistant server-owned object keys.
- [x] Restrict intents to allow-listed image MIME types and configured size limits.
- [x] Generate short-lived presigned `PUT` URLs with the expected content type included in the signature.
- [x] Upload directly from the authenticated browser to R2 rather than through a Vercel Function body.
- [x] Add a protected upload-finalization mutation.
- [x] Verify finalized objects with R2 `HEAD` before creating image records.
- [x] Store object key, MIME type, byte size, dimensions, alt text and ordering in PostgreSQL.
- [x] Add image ordering, alt-text editing, replacement and removal to vehicle administration.
- [x] Prevent arbitrary object-key deletion and removal of still-referenced images.
- [x] Add a controlled orphan-upload cleanup mechanism.
- [x] Ensure public image URLs use only the configured public base URL.
- [x] Configure Next.js image handling for the approved R2 public host.
- [x] Add tests for unauthorized intents, invalid types/sizes, expired/invalid finalization, ordering and deletion authorization.
- [x] Document R2 CORS, token scope, public host and cleanup requirements for the external setup owner.

## 10. Site settings administration

- [x] Map the current `src/data/site.ts` values into a strict settings schema.
- [x] Preserve the confirmed business name, logo and telephone values.
- [x] Treat email, address, hours, map and social URLs as client-confirmed fields rather than invented defaults.
- [x] Add typed groups for brand/contact details, opening hours, public page copy and SEO.
- [x] Add protected `/admin/settings` with accessible grouped controls.
- [x] Keep navigation paths, secrets, deployment configuration, validation enums and formulas code-owned.
- [x] Reject arbitrary keys and validate the complete singleton before persistence.
- [x] Support approved logo, favicon and Open Graph image selection through the R2 media flow.
- [x] Record settings mutations in the audit table without storing secrets or excessive content snapshots.
- [x] Revalidate affected layout, page and metadata caches after successful changes.
- [x] Add tests for singleton enforcement, authorization, validation and cache invalidation.

## 11. Database-backed public content

- [x] Implement server-only repository functions for published vehicles and site settings.
- [x] Preserve the existing application-facing accessors so UI components do not import database modules.
- [x] Return explicit domain types rather than raw Drizzle rows.
- [x] Exclude drafts and archived vehicles from public inventory, metadata, sitemap and structured data.
- [x] Define the approved public behavior for sold vehicles once client input is available.
- [x] Keep client-side inventory filtering functional with database-backed published data.
- [x] Update the homepage featured inventory to use published database records.
- [x] Update the vehicle-detail overlay to use database-backed records without regressing accessibility.
- [x] Update header, footer, homepage, financing, contact and SEO metadata to use mapped settings.
- [x] Add supported Next.js caching and targeted revalidation.
- [x] Provide safe behavior when the database is unavailable without serving invented content.
- [x] Add public-route and filtering regression tests.

## 12. Current-data migration

- [x] Write a one-off, reviewable migration/seed command for `src/data/vehicles.ts`.
- [x] Write a one-off, reviewable migration/seed command for `src/data/site.ts`.
- [x] Make migration idempotency or duplicate prevention explicit.
- [x] Preserve traceability to the client-supplied Lovable reference archive.
- [x] Do not create placeholder vehicles, settings, staff or media.
- [x] Keep the static data available as a rollback reference during local implementation and review.
- [x] Switch the public accessors only after schema, repository and migration tests pass.
- [x] Remove obsolete static production imports after the database-backed path is verified.
- [x] Remove static source files only in a dedicated cleanup step when no runtime consumer remains.

## 13. Leads compatibility and privacy

- [x] Confirm every existing lead form still uses client usability validation and authoritative server Zod validation.
- [x] Confirm Turnstile verification occurs before every lead write.
- [x] Preserve allow-listed per-form payload fields and reject arbitrary browser keys.
- [x] Preserve the rule that email is required when phone is absent and phone is required when email is absent.
- [x] Add a stable vehicle reference/display snapshot where needed for historical enquiries.
- [x] Prevent vehicle lifecycle changes from deleting or corrupting lead history.
- [x] Ensure no lead data is exposed through public or admin content APIs.
- [x] Ensure complete lead payloads are not logged or placed in analytics.
- [x] Keep email/message notifications absent.
- [x] Keep sensitive financing and identity information rejected.
- [x] Run lead validation and persistence regression tests.

## 14. Audit, abuse resistance and error handling

- [x] Record acting staff ID, action type, entity type/ID, timestamp and minimal safe summary for material mutations.
- [x] Keep audit records append-only through application permissions.
- [x] Avoid passwords, tokens, secrets and complete personal-data payloads in audit records.
- [x] Add authorization checks to every Server Action, Route Handler and protected Server Component.
- [x] Add origin/CSRF protections appropriate to the selected mutation mechanisms.
- [x] Add rate limits to authentication and upload-intent boundaries.
- [x] Return minimal safe errors without stack traces, SQL details, credentials or R2 secrets.
- [x] Add log redaction for authentication, lead and storage boundaries.
- [x] Test horizontal and vertical privilege escalation attempts.
- [x] Test arbitrary IDs, object keys, unknown fields and malformed payloads.

## 15. Automated and visual verification

- [x] Replace the production build's network-dependent Google Fonts import with deterministic system fallbacks; revisit self-hosted typography later if the client supplies approved font files. 
- [x] Add unit tests for new formatters, validation schemas and authorization helpers.
- [x] Add database integration tests for repositories, constraints and migrations.
- [x] Add authentication tests covering allowed and denied flows.
- [x] Add R2 integration-boundary tests without importing test fixtures into production code.
- [x] Add Playwright coverage for admin login/logout and protected-route redirects.
- [x] Add Playwright coverage for vehicle create/edit/status/publish flows.
- [x] Add Playwright coverage for site-settings updates.
- [x] Add Playwright coverage for image-management UI using test-only fixtures.
- [x] Re-run public route, filtering, modal, form and accessibility coverage.
- [x] Check admin and public pages at mobile, tablet, desktop and 1440px widths.
- [x] Confirm reduced motion, keyboard navigation, focus restoration and error announcements.
- [x] Run `pnpm lint`.
- [x] Run `pnpm typecheck`.
- [x] Run `pnpm build`.
- [x] Run the complete relevant automated test suite.
- [x] Fix all correctness, security, accessibility and production-risk warnings.

## 16. Handoff documentation

- [x] Document local PostgreSQL setup and migration commands.
- [x] Document first-admin bootstrap and maintainer-controlled password recovery.
- [x] Document vehicle lifecycle and publication behavior for staff.
- [x] Document settings ownership and code-owned boundaries.
- [x] Document R2 upload, CORS, custom/public host, token scope and orphan cleanup.
- [x] Document Neon migration and connection requirements.
- [x] Document Vercel environment variables and testing deployment steps.
- [x] Document backup/export expectations for PostgreSQL and R2.
- [x] Document that customer accounts and public registration do not exist.
- [x] Document deferred notification and lead-management features with `[TODO]` markers.
- [x] Update this checklist after every completed implementation group.

## 17. External account, credential and client steps

These are intentionally owned by the user/client. The implementation goal may finish with these items open.

- [x] [EXTERNAL] Create or select the Neon project and provide the development/preview `DATABASE_URL` values through secure environment configuration.
- [x] [EXTERNAL] Create or select the Cloudflare R2 bucket and provide scoped S3-compatible credentials through secure environment configuration.
- [x] [EXTERNAL] Configure the approved R2 public/custom domain and DNS.
- [x] [EXTERNAL] Apply the documented R2 CORS policy for local, preview and approved site origins.
- [x] [EXTERNAL] Create or select the Vercel project and connect the repository.
- [x] [EXTERNAL] Add documented environment variables to Vercel development/preview environments.
- [x] [EXTERNAL] Configure Turnstile keys and allowed hostnames for preview testing.
- [x] [EXTERNAL] Run reviewed production/service migrations against the supplied Neon project.
- [ ] [EXTERNAL] Bootstrap the real first administrator through the documented secure command.
- [x] [EXTERNAL] Perform the private Vercel client-review deployment.
- [ ] [EXTERNAL][TODO] Confirm the final business email, address, hours, map/directions URL and verified social profiles.
- [ ] [EXTERNAL][TODO] Confirm the final vehicle inventory, VIN publication rule and image rights.
- [ ] [EXTERNAL][TODO] Confirm whether sold vehicles remain visible publicly.
- [ ] [EXTERNAL][TODO] Confirm accepted image formats, maximum upload size and expected image count per vehicle.
- [ ] [EXTERNAL][TODO] Confirm whether more than one staff administrator or an editor role is required.
- [ ] [EXTERNAL][TODO] Confirm final editable homepage, financing and contact copy.
- [ ] [EXTERNAL][TODO] Approve consent wording, privacy policy and lead-retention period.
- [ ] [EXTERNAL][TODO] Confirm account ownership and handoff access for Vercel, Neon, Cloudflare and the production domain.

## 18. Deferred features outside this goal

- [ ] [TODO] Add protected lead review and lead-status workflows only if the client requests them.
- [ ] [TODO] Add email, SMS, Slack or CRM notifications only after provider and destination approval.
- [ ] [TODO] Add email-based staff password recovery only after a sending provider/domain is approved.
- [ ] [TODO] Add staff invitations and editor-role management only when multiple staff users are confirmed.
- [ ] [TODO] Add a dealership-management-system inventory feed only if approved.
- [ ] [TODO] Add analytics or advertising integrations only if approved.
- [ ] [TODO] Add online financing-provider integration only as a separately approved project.
- [ ] [TODO] Plan any future VPS migration separately; it is not part of this upgrade goal.
- [ ] [TODO] Revisit self-hosted typography only if approved font files or a licensed font source are supplied.

## 19. Goal completion condition

The CMS upgrade goal is complete when:

- [x] Every locally actionable item in sections 1–16 is implemented and checked.
- [x] Only section 17 external account/credential/client items and section 18 explicitly deferred features remain open.
- [x] The application has no placeholder/mock production content, no loose types and no unmarked deferrals.
- [x] Public pages, forms and accessibility behavior have no regressions.
- [x] The staff-only admin, vehicle workflow, settings workflow, authentication and R2 integration are complete and verified at every locally testable boundary.
- [x] Lint, type checking, production build and relevant automated tests pass.

## 20. Official implementation references

Recheck these during implementation because platform limits and integration behavior can change:

- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Vercel Function limits](https://vercel.com/docs/functions/limitations)
- [Neon pricing](https://neon.com/pricing)
- [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next)
- [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle)
