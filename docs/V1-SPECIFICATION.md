# Regent Motors Website — Version 1 Specification

- Status: Approved baseline for implementation
- Reference demo: https://only-demo.lovable.app/
- Visual archive: `reference-screenshots/`
- Document date: 2026-07-17

## 1. Product definition

Regent Motors v1 is a complete, production-ready dealership website for presenting the company, showcasing its current vehicle collection, generating qualified enquiries, and providing clear financing and contact pathways.

The site is CMS-backed in v1. Vehicles, approved page content and site settings are maintained through a narrow project-owned administration interface and persisted in PostgreSQL. Vehicle and editable site images use Cloudflare R2. Authentication exists only for approved staff administration; there are no customer accounts.

This is a full v1 for the agreed scope, not an MVP or disposable prototype.

## 2. Primary objectives

1. Reproduce the client-approved Regent Motors visual direction accurately.
2. Present the vehicle collection in a premium, fast and mobile-friendly experience.
3. Make it easy to enquire about a vehicle, request a test drive, contact the dealership or begin a financing conversation.
4. Provide strong local-business and inventory SEO foundations.
5. Provide a focused staff workflow for maintaining vehicles, images and mapped site settings without introducing a general page builder.
6. Preserve clean upgrade paths for an external inventory feed, CRM or lead-management dashboard.

## 3. Scope

### 3.1 Included in v1

- Responsive public website.
- Home page.
- Inventory page with client-side filtering and search.
- Vehicle-detail overlay for every listed vehicle.
- Financing page with a staged enquiry experience and car-finder form.
- Contact page with dealership details, map and contact form.
- Test-drive and vehicle-availability enquiry entry points.
- Server-side form validation.
- Bot protection.
- PostgreSQL persistence for ordinary lead information.
- PostgreSQL-backed vehicles and mapped site settings.
- Protected staff-only administration for vehicles and site settings.
- Better Auth database sessions with no public registration.
- Cloudflare R2 vehicle and editable site-image storage.
- Material administration audit records.
- SEO metadata, sitemap, robots configuration and structured-data foundations.
- Accessible keyboard navigation, focus states and semantic markup.
- Production deployment on Vercel.
- Automated linting, type checking and baseline browser tests.

### 3.2 Explicitly excluded from v1

- Customer accounts, customer authentication or public registration.
- Lead-management dashboard.
- Email, SMS, Slack or other lead notifications.
- Automated marketing sequences.
- Full online financing application or credit decisioning.
- Storage of highly sensitive financing data.
- Payments, deposits or e-commerce checkout.
- Real-time connection to a dealership-management system.
- A general page builder or arbitrary database/content editor.
- Customer reviews integration.
- Multilingual content.

### 3.3 TODO: deferred options

The following may be added later without changing the public-site design:

- [TODO] Add a dealership-management-system inventory feed only if approved.
- [TODO] Add CRM delivery or notifications only if approved.
- [TODO] Add a protected lead-management dashboard only if approved.
- [TODO] Add CSV exports and lead-status workflows only if approved.
- [TODO] Add analytics and advertising integrations beyond the approved v1 baseline only if approved.
- [TODO] Add a full financing-provider integration only if approved.

## 4. Information architecture

| Route | Purpose |
| --- | --- |
| `/` | Brand introduction, featured vehicles, promises and primary calls to action |
| `/inventory` | Searchable and filterable vehicle collection |
| `/financing` | Financing enquiry and concierge vehicle-finder forms |
| `/contact` | Dealership information, map and general contact form |

Vehicle details are displayed in an accessible modal overlay from Home and Inventory. A future implementation may add canonical vehicle routes such as `/inventory/[slug]` if search or sharing requirements justify them.

## 5. Page requirements

### 5.1 Global header

- Regent Motors wordmark linking to Home.
- Desktop navigation for Home, Inventory, Financing and Contact.
- Active-route indication.
- Click-to-call telephone number.
- Prominent financing call to action.
- Responsive mobile navigation with accessible open/close controls.
- Sticky or fixed behavior only where it matches the approved reference and does not obscure content.

### 5.2 Global footer

- Short Regent Motors description.
- Business hours.
- Quick links.
- Telephone, email and physical address.
- Render social-media links only when the client supplies verified profile URLs; omit the section otherwise.
- Copyright notice and brand statement.
- No Lovable editor badge or Lovable branding.

### 5.3 Home page

- Premium hero with background vehicle image, Regent Motors eyebrow, headline and supporting copy.
- Primary Inventory call to action.
- Secondary Test Drive call to action.
- Body-style selector for All, Sedan, SUV, Coupe, Convertible, Hatchback and Truck.
- Featured inventory grid.
- Regent Promise section covering value, financing and inspection.
- Concierge sourcing section leading to the car-finder experience.
- Motion should be subtle, optional under reduced-motion preferences and must not delay interaction.

### 5.4 Inventory page

- Page heading and introductory copy.
- Filter panel containing make, body style, fuel, maximum price and model search.
- Clear count of matching vehicles.
- Responsive vehicle grid.
- Useful empty state when no vehicles match.
- Filters operate locally without a page reload.
- Filter state may be reflected in URL search parameters if it improves sharing and browser navigation.
- Each vehicle card exposes a clear View Details action.

### 5.5 Vehicle-detail overlay

- Accessible dialog semantics, keyboard focus trap, Escape-to-close and visible close control.
- Vehicle image, year, trim, make/model, price and VIN where approved for publication.
- Mileage, engine, fuel, drivetrain, transmission, exterior and interior information.
- Illustrative payment calculator clearly labelled as an estimate.
- Availability enquiry form pre-populated with the selected vehicle.
- Background scroll locking while open.
- Mobile layout that keeps all content reachable without horizontal scrolling.

### 5.6 Financing page

- Financing introduction.
- Staged enquiry UI representing contact, employment and financial-profile steps.
- v1 submission must remain a financing enquiry, not a credit application.
- Car-finder form for make, model, year range, maximum budget and maximum mileage.
- Clear privacy and consent language before submission.
- No collection or storage of government identifiers, credit-card data, bank details, credit scores, uploaded documents or similarly sensitive records.

The staged presentation may collect only fields approved in the final form inventory. If the client requires a true financing application, it must be handled by an approved financing provider in a separately scoped integration.

### 5.7 Contact page

- Visit, call and write introduction.
- Showroom address, direct telephone, email and opening hours.
- Embedded map and Get Directions link.
- Contact form for name, email, telephone, subject and message.
- Clear success and failure states that do not discard entered data unnecessarily.

## 6. Content model

V1 content is persisted in PostgreSQL and accessed through typed server-only repositories. The existing typed source files are migration inputs and temporary rollback references only.

### 6.1 Vehicle

```ts
type Vehicle = {
  id: string;
  slug: string;
  publicationStatus: "draft" | "published";
  inventoryStatus: "available" | "reserved" | "sold";
  featured: boolean;
  year: number;
  make: string;
  model: string;
  trim: string;
  bodyStyle: "sedan" | "suv" | "coupe" | "convertible" | "hatchback" | "truck";
  price: number;
  mileage: number;
  mileageUnit: "mi" | "km";
  fuel: string;
  engine: string;
  drivetrain: string;
  transmission: string;
  exterior: string;
  interior: string;
  vin?: string;
  images: Array<{ src: string; alt: string }>;
};
```

Vehicle access must be centralized behind functions such as `getVehicles()`, `getFeaturedVehicles()` and `getVehicleBySlug()`. Public queries return published records only. Administration mutations use strict server validation, database-backed authorization and audit records.

### 6.2 Site settings

- Business name.
- Telephone and display formatting.
- Email address.
- Physical address.
- Opening hours.
- Social links.
- Default SEO title and description.
- Map/directions URL.
- Approved homepage, financing and contact copy groups.
- Per-primary-route SEO title and description.

Settings use a strict singleton schema. Routes, navigation structure, secrets, environment configuration, validation enums and executable code are never editable settings.

### 6.3 Staff authentication

- Staff users exist only to access `/admin`.
- Public sign-up and customer accounts do not exist.
- Better Auth stores staff users, accounts, sessions and required verification records in PostgreSQL.
- Every protected page, Server Action and Route Handler performs a server-side session and authorization check.
- The first administrator is provisioned through a controlled maintainer command.

### 6.4 Media

- Cloudflare R2 stores image binaries.
- PostgreSQL stores object metadata, relationships, ordering and alt text.
- Authenticated browser uploads use short-lived presigned URLs followed by protected server verification/finalization.
- Full-resolution images do not pass through a Vercel Function request body.

## 7. Forms and lead persistence

### 7.1 Form types

- General contact.
- Test-drive request.
- Vehicle-availability enquiry.
- Car-finder enquiry.
- Financing enquiry.

### 7.2 Submission flow

1. User completes a form.
2. Client performs usability validation.
3. Server repeats authoritative validation with Zod.
4. Server verifies Cloudflare Turnstile.
5. Server normalizes and stores the lead in PostgreSQL.
6. Server returns a non-sensitive submission reference and success response.

There are no email or messaging notifications in v1. [TODO] Add notification delivery only if the client approves it as a later requirement.

### 7.3 Lead schema

```text
id                  UUID primary key
reference           Human-readable unique reference
form_type           Contact, test_drive, availability, car_finder or financing
full_name           Required
email               Required when phone is absent
phone               Required when email is absent
subject             Optional
message             Optional
vehicle_id          Optional reference to the static vehicle identifier
payload             JSONB for form-specific, approved non-sensitive fields
consent             Boolean
consent_text_version String identifying the accepted wording
created_at           Timestamp with time zone
```

The JSON payload is limited to allow-listed fields for the selected form type. Arbitrary browser-provided keys must not be persisted.

### 7.4 Data handling

- Collect the minimum information required to respond.
- Keep database credentials server-only.
- Never log complete submissions or personal data to browser analytics.
- Apply length limits and normalization to all free-text fields.
- Escape content when displayed or exported.
- Establish a retention policy with the client before production launch.
- Restrict production database access to authorized project maintainers.
- Do not expose a public lead-listing API.

## 8. Technical architecture

### 8.1 Core stack

- Next.js App Router.
- React and TypeScript with strict type checking.
- Tailwind CSS with project-specific design tokens.
- Zod for server-side form validation.
- Neon PostgreSQL through Vercel's native integration.
- Drizzle ORM for schema definitions and migrations.
- Cloudflare Turnstile for bot protection.
- Vercel for previews and production hosting.
- Playwright for browser-level verification.
- Vitest where unit tests provide value.
- pnpm for dependency management.

### 8.2 Rendering model

- Public content pages are statically generated where possible.
- Published inventory and settings are read from PostgreSQL through server-only repositories.
- Public content is cached where appropriate and invalidated after authorized administration changes.
- Filtering and modal interactions run on the client.
- Form submission endpoints use server-side Route Handlers.
- Database code must never be included in client bundles.

### 8.3 Project boundaries

```text
src/app             Routes, metadata and route handlers
src/components      Shared and feature components
src/data            Server-only repositories, migration inputs and lead persistence
src/db              Database connection and schema
src/lib/auth        Staff authentication and authorization boundaries
src/lib/storage     R2 media boundaries
src/lib             Validation, formatting and shared utilities
src/types           Shared domain types
public              Optimized local assets
docs                Product and technical documentation
reference-screenshots  Approved visual reference archive
```

## 9. Visual implementation

- Use the archived 1440 × 900 captures as the desktop reference.
- Build a responsive system rather than encoding screenshot-specific absolute positions.
- Centralize background, surface, border, muted text and gold brand colors as CSS variables.
- Prefer custom components over imposing a generic component library aesthetic.
- Preserve the dark premium presentation, restrained gold accents, generous spacing and strong typographic hierarchy.
- All vehicle imagery requires meaningful alt text unless explicitly decorative.
- Icons must use a consistent SVG icon set or project-owned SVG components.

## 10. Accessibility

- Target WCAG 2.2 AA for applicable public content and interactions.
- Maintain visible keyboard focus.
- Provide skip navigation.
- Use semantic headings in a logical order.
- Associate form labels, descriptions and error messages programmatically.
- Do not rely on color alone for active, invalid or selected states.
- Ensure dialogs announce their title and description.
- Support reduced motion.
- Maintain touch targets of practical mobile size.
- Test keyboard-only operation at minimum on navigation, filters, dialogs and forms.

## 11. SEO and sharing

- Unique title and description for every primary route.
- Canonical URL configuration.
- Open Graph and social-sharing imagery.
- `robots.txt` and XML sitemap.
- LocalBusiness or AutoDealer structured data after client details are confirmed.
- Vehicle structured data only when the published fields are accurate and crawlable.
- Consistent name, address and telephone information.
- Descriptive image alt text and useful link labels.

## 12. Performance requirements

- Use appropriately sized modern image formats.
- Prioritize the hero image without eagerly loading all inventory imagery.
- Avoid autoplaying heavy video.
- Keep client components limited to interactive areas.
- Prevent layout shift by reserving image and interface dimensions.
- Avoid third-party scripts unless they provide an approved business function.
- Test production builds with representative mobile throttling before launch.

## 13. Responsive behavior

The design must support at least:

- Small mobile: 320–479 px.
- Large mobile: 480–767 px.
- Tablet: 768–1023 px.
- Desktop: 1024–1439 px.
- Wide desktop: 1440 px and above.

Exact component transitions should be driven by available space, not device names. No supported width may produce horizontal page scrolling.

## 14. Environment configuration

Expected environment variables:

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_BASE_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

Development, preview and production environments must use separate Turnstile configuration where appropriate. Production secrets must be stored in Vercel rather than committed to Git.

## 15. Quality assurance

### 15.1 Automated checks

- ESLint.
- TypeScript type checking.
- Production build.
- Unit coverage for formatters, filters and validation schemas where useful.
- Playwright smoke coverage for every route.
- Playwright coverage for inventory filtering and opening/closing vehicle details.
- Authentication and authorization coverage for administration routes and mutations.
- Vehicle and site-settings administration coverage.
- R2 upload-intent and finalization boundary coverage.
- Form validation tests without submitting real production data.

### 15.2 Visual checks

- Compare Home, Inventory, Financing and Contact to the archived references.
- Verify every vehicle-detail overlay.
- Inspect mobile, tablet and 1440 px desktop layouts.
- Confirm loading, empty, success and error states.
- Confirm the Lovable editor badge is absent.

## 16. Deployment and release

- Source hosted in Git.
- `main` represents the production-ready branch.
- Pull requests or feature branches receive Vercel preview deployments.
- Production environment variables are configured before release.
- Database migrations run as an explicit release step.
- Domain, redirects and canonical site URL are verified before launch.
- A rollback-capable production deployment is retained.

## 17. Definition of done for v1

v1 is complete when:

1. All four primary routes match the approved direction across supported widths.
2. All approved vehicles and details are represented accurately.
3. Inventory filters and detail overlays work with keyboard, mouse and touch.
4. Approved forms validate, pass bot protection and persist expected lead records.
5. No sensitive financing fields outside the approved inventory are accepted or stored.
6. SEO metadata, sitemap and robots configuration are present.
7. Automated checks and the production build pass.
8. Preview and production deployments are verified.
9. Staff can securely manage vehicles, images and approved settings without public registration.
10. Draft content cannot leak to public routes, metadata, sitemap or structured data.
11. Client-supplied business information and legal wording are confirmed.
12. The site contains no Lovable branding or demo-only controls.

## 18. TODO: open client inputs

- Logo asset, `REGENT MOTORS LLC` business name and telephone number are confirmed client-provided facts; preserve them unless the client supplies a replacement.
- [TODO] Confirm the business address and email with the client.
- [TODO] Confirm opening hours with the client.
- [TODO] Obtain verified social profile URLs or omit social links.
- [TODO] Confirm the final vehicle inventory and image rights.
- [TODO] Confirm whether VIN values should be public.
- [TODO] Approve final lead-form fields and consent wording.
- [TODO] Approve the privacy policy and data-retention period.
- [TODO] Approve the map provider/API.
- [TODO] Obtain the production domain and DNS access.
- [TODO] Confirm whether analytics or advertising pixels are required at launch.
