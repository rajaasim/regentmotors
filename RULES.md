# Regent Motors Engineering Rules

These rules apply to all source code, tests, configuration, documentation and generated artifacts in this repository. They are mandatory unless the user explicitly overrides a rule for a specific task.

## 1. Product truth

1. Treat `docs/V1-SPECIFICATION.md` as the v1 product and technical source of truth.
2. Treat `reference-screenshots/` as the approved visual reference, not as production source code.
3. Do not silently expand the agreed scope.
4. Do not describe this project as an MVP. It is the complete v1 for the agreed scope.

## 2. Types and correctness

1. Do not use explicit or implicit `any`.
2. Use `unknown` only at genuine trust boundaries, then validate or narrow it immediately.
3. Do not use `@ts-ignore`, `@ts-nocheck` or disable strict TypeScript checks.
4. Do not use non-null assertions (`!`) to bypass missing-state handling.
5. Avoid type assertions (`as`). When an assertion is unavoidable, keep it narrow and explain why the runtime guarantee exists.
6. Prefer discriminated unions, literal unions and domain types over broad strings or unstructured objects.
7. Validate all external input on the server. Client validation is a usability feature, never the authority.
8. Return minimal, explicitly typed data from server boundaries.
9. `as const` is permitted for literal inference; it must not conceal an unsafe runtime assumption.

## 3. Real content only

1. Do not add placeholder, mock, sample, demo or fabricated production content.
2. Do not invent contact information, legal wording, social URLs, vehicle specifications, prices, credentials or business claims.
3. Content reproduced from the client-supplied Lovable reference is permitted and must remain traceable to the reference archive.
4. If verified content is unavailable, omit the feature or represent it as a documented configuration requirement. Never make up a plausible value.
5. Test fixtures are permitted only inside test-specific files and must never be imported by production code.
6. Do not ship “coming soon,” lorem ipsum, fake statistics or non-functional controls.
7. HTML input `placeholder` attributes are permitted when they provide a concise format hint and are not used as a substitute for a label or real content.

## 4. Deferred work and TODOs

1. Every intentionally deferred implementation item must be marked with `TODO`.
2. Use this format in code:

   ```text
   TODO(scope): action required; condition or owner that unblocks it.
   ```

3. A TODO must explain what remains and why it is not part of the current change.
4. Do not use TODOs to excuse broken builds, failing checks, unsafe behavior or incomplete work that is already in scope.
5. Deferred product decisions in documentation must use `[TODO]` at the start of the relevant item.
6. Remove the TODO in the same change that completes the work.

## 5. Architecture boundaries

1. Keep Server Components as the default. Add `"use client"` only at the smallest interactive boundary.
2. Keep database credentials, Turnstile secrets and other secrets in server-only modules.
3. Database access must go through the server-only data-access layer.
4. Client Components must not import database packages, server-only modules or environment secrets.
5. Inventory and settings access must remain behind typed server-only functions such as `getVehicles()` so storage changes do not rewrite UI components.
6. The project-owned CMS, staff-only authentication, protected administration and Cloudflare R2 media flow approved in `upgrade.md` are in scope. Do not introduce a different CMS, customer authentication, notification delivery or additional object storage without an approved requirement.
7. Do not add a dependency when the platform or a small project-owned utility already solves the requirement clearly.
8. Drizzle is the only production database schema-migration owner.
9. Public content reads must exclude drafts and archived records.

## 6. Authentication and administration

1. Staff authentication exists only to protect administration; do not add public registration or customer accounts.
2. Validate the database-backed session and authorization on every protected Server Component, Server Action and Route Handler.
3. Proxy checks and hidden UI are usability measures, never authorization boundaries.
4. Return minimal staff data and never expose password hashes, account credentials, session tokens or verification values.
5. Do not log passwords, authentication payloads, tokens or complete session objects.
6. Rate-limit authentication and upload-intent boundaries.
7. Record material administration mutations with minimal audit metadata and no secrets or complete lead payloads.
8. Reject unknown fields and validate all administration mutations with strict Zod schemas.

## 7. Forms and personal data

1. Persist only allow-listed fields defined by the server validation schema.
2. Never persist arbitrary keys submitted by the browser.
3. Require server-side Zod validation and Turnstile verification before database writes.
4. Do not store sensitive financing or identity information in the general leads table.
5. Do not log complete form payloads or personal information.
6. Do not implement email, SMS, Slack or CRM notifications in v1.
7. Error responses must not reveal credentials, SQL details, stack traces or internal implementation data.

## 8. UI and accessibility

1. Every interactive element must be keyboard operable.
2. Use native semantic HTML before adding ARIA.
3. Maintain visible focus states and logical heading order.
4. Dialogs must expose dialog semantics, a labelled title, Escape handling, focus restoration and a visible close control.
5. Form controls require programmatic labels and accessible error/status messaging.
6. Respect reduced-motion preferences.
7. No supported viewport may introduce horizontal page scrolling.
8. Do not reproduce the Lovable editor badge or any demo-host controls.

## 9. Styling and assets

1. Use shared design tokens for project colors, spacing and typography decisions.
2. Prefer project-owned components over generic component-library styling.
3. Every meaningful image requires accurate alt text.
4. Do not hotlink production assets from the demo host. Store approved project assets locally or use the approved production asset service.
5. Preserve source image quality and aspect ratio.
6. R2 upload credentials remain server-only; browser uploads require short-lived, staff-authorized presigned URLs and protected finalization.
7. Store image metadata and relationships in PostgreSQL, never image binaries.
8. Do not accept caller-controlled arbitrary object keys for deletion or replacement.

## 10. Quality gates

1. Before committing, run:

   ```text
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

2. Run relevant tests for changed behavior.
3. Do not commit failing checks, disabled tests or focused tests.
4. Do not weaken lint, type or test configuration merely to make a failure disappear.
5. Fix warnings that indicate correctness, security, accessibility or production risk.

## 11. Git and repository hygiene

1. Keep commits focused and use an imperative commit message.
2. Never commit secrets, `.env.local`, build output, test reports or dependency directories.
3. Do not rewrite or discard user-authored changes without explicit approval.
4. Do not commit temporary capture files or exploratory artifacts as production source.
5. Update documentation when a change alters scope, setup, environment variables or architecture.
