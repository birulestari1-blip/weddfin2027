# AI Studio Implementation Rules — V3.2

## ROLE

You are implementing an existing V3.2 product specification. You are NOT free to redesign the database, business rules, workflow model, permission model, tenant model, or navigation merely because another implementation seems easier.

## REQUIRED READING ORDER

Before writing or refactoring code, read:

1. `docs/MASTER_PROJECT_SPEC_V3.2_FINAL.md`
2. `docs/WORKFLOW_V3.2_FINAL.md`
3. `docs/FILE_STRUCTURE_INDUSTRY_STANDARD_V3.2_FINAL.md`
4. `docs/UIUX_REFERENCE_V3.2_FINAL_README.md`
5. `docs/UIUX_REFERENCE_V3.2_FINAL/02_PAGE_REFERENCE_MAP.md`
6. `docs/UIUX_REFERENCE_V3.2_FINAL/03_COMPONENT_CATALOG.md`
7. Relevant files under `supabase/migrations/`

## NON-NEGOTIABLE RULES

1. Preserve V3.2 database schema and relationships unless a migration/change is explicitly requested.
2. Preserve existing business logic and behavior during refactors.
3. Do not rename database tables/columns/enums/functions merely for UI wording.
4. Do not bypass RLS, tenant isolation, or permission checks.
5. Do not put direct Supabase/database queries in presentational pages/components.
6. Put feature-specific business rules in feature services/use cases.
7. Put data-access logic in feature repositories.
8. Reuse shared UI components only when their behavior is genuinely generic.
9. Vendor-specific modules must remain isolated from unrelated vendor domains.
10. Super Admin is a platform-level area and must not be treated as ordinary vendor UI.
11. `src.rar` is reference-only. Adapt its visual patterns; do not copy demo business logic or mock application state.
12. Do not invent missing database tables or fields. If a requirement needs new persistence, propose a migration first.
13. Do not replace a V3.2 workflow with a template workflow.
14. Do not introduce duplicate sources of truth for the same business data.
15. Do not silently remove existing functionality.

## UI/UX ADAPTATION RULE

Use the official UI/UX mapping to select visual references. Reuse:

- layout patterns
- navigation patterns
- spacing
- typography hierarchy
- cards
- tables
- forms
- dialogs/drawers
- filters
- pagination
- invoice/document presentation
- calendar patterns
- kanban patterns
- product/media patterns

Adapt the content and interaction model to V3.2.

Example:

`src.rar ecommerce product UI → Catering Menu UI`

Allowed: product-card visual hierarchy, image gallery, pricing layout, media uploader pattern.

Not allowed: ecommerce cart, checkout, product inventory state machine, demo API, or unrelated ecommerce business rules.

## PAGE IMPLEMENTATION ORDER

Implement incrementally:

1. App shell / theme / navigation
2. Authentication
3. Tenant + profile context
4. Dashboard
5. Clients
6. Services
7. Quotations
8. Bookings
9. Finance / Invoices / Contracts
10. Portfolio
11. Inventory
12. Workflows
13. Catering
14. Photography
15. Dekorasi
16. MUA
17. Wedding Organizer
18. Subscription
19. Super Admin
20. Hardening / testing / performance

Do not implement all modules in one uncontrolled pass.

## CHANGE PROTOCOL

For every non-trivial change:

1. Identify the relevant V3.2 requirement.
2. Identify affected route/feature/service/repository/database objects.
3. Check permissions and tenant scope.
4. Check whether an existing component can be reused.
5. Implement the smallest compatible change.
6. Run type/lint/test/build checks where available.
7. Report files changed and any unresolved conflict.

## CONFLICT PROTOCOL

If code, template, or user instruction conflicts with V3.2:

- do not silently choose one;
- identify the conflict;
- explain the affected contract;
- propose the minimum safe resolution;
- wait for explicit approval when the resolution changes schema or business behavior.

## DATABASE RULE

The numbered migration files are the implementation source of truth. Apply them in order. Do not manually modify production data to make the UI work.

## SECURITY RULE

Never place service-role secrets or private credentials in client-side code. Only public client configuration belongs in frontend environment variables.

## DEFINITION OF DONE

A feature is not done merely because its screen renders. It must have, as applicable:

- route
- permission handling
- tenant scoping
- validation
- loading state
- empty state
- error state
- success feedback
- CRUD/use-case behavior
- repository boundary
- service/use-case boundary
- responsive UI
- accessibility basics
- tests appropriate to the feature
- no regression to V3.2 contracts
