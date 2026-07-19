# Regent Motors Remediation Checklist

This checklist records the review findings from the GLM-generated worktree and the agreed resolution for each. It follows `RULES.md` and `docs/V1-SPECIFICATION.md`.

## Product truth and scope

- [x] Removed the non-functional newsletter subscription form; email collection and marketing flows are outside v1.
- [x] Removed unverified social links and the unsupported Careers link.
- [x] Replaced inert, pointer-styled service items with real enquiry and financing routes or non-interactive content.
- [x] Removed fabricated certification, inspection, service-history, delivery and sourcing claims.
- [x] Restored the approved v1 information architecture: vehicle detail remains an accessible overlay, not an unapproved canonical vehicle route.

## Enquiry flows

- [x] Vehicle availability and test-drive entry points preserve the selected vehicle and chosen intent through to the lead form.
- [x] Query-selected vehicles are validated against the typed local inventory before they are used in the form.

## Navigation and accessibility

- [x] Restored Home, Inventory, Financing and Contact in the desktop navigation, the click-to-call telephone link, and a financing-focused CTA.
- [x] Mobile navigation supports Escape, focus containment, focus restoration and background scroll locking.
- [x] Fixed-header navigation uses document scroll padding and page-hero spacing so it does not obscure content or anchors.
- [x] Replaced duplicate, screen-reader-only inventory controls with one set of visible, labelled native controls.
- [x] Every inventory control has a programmatic label and a visible keyboard focus state.
- [x] Reduced-motion users do not wait through animation delays before content or calls to action become available.

## Performance, SEO and quality

- [x] Removed the unused loading/reveal additions that hid server-rendered content before hydration and added unnecessary client JavaScript.
- [x] Eliminated Next Image warnings while using the client-provided logo with explicit intrinsic dimensions.
- [x] Removed all trailing whitespace reported by `git diff --check`.
- [x] Added browser coverage for mobile navigation, vehicle-enquiry context and the visible inventory controls.
- [x] Updated project documentation to record the completed remediation and preserve the approved v1 scope.
- [x] Ignored the generated `project_code_bundle.txt` artifact so it cannot be committed.

## Client-owned facts that remain open

- [x] Final logo file, `REGENT MOTORS LLC` business name and telephone number were confirmed by the client on 2026-07-19.
- [ ] [TODO] Confirm the production email and address with the client; v1 continues to use the traceable Lovable-reference values until then.
- [ ] [TODO] Obtain verified social profile URLs before adding social links.
