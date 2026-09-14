# V3.2 UI/UX IMPLEMENTATION CONTRACT

## Prompt for coding/refactor agent

You are implementing/refactoring the V3.2 multi-vendor event-business dashboard.

The project has two separate sources of truth:

1. **V3.2 Master Project Spec** — authoritative for database, domain model, services, repositories, permissions, tenant isolation, RLS, workflows, subscriptions and business logic.
2. **`UIUX_REFERENCE_V3.2_FINAL`** — authoritative for visual/interaction reference derived from the audited `src.rar` template.

### Mandatory rules

- Use `src.rar` only as a UI/UX reference.
- Recreate/adapt the visual pattern inside the V3.2 architecture; do not blindly copy the template application.
- Do not copy template mock data.
- Do not copy template MSW/API mock handlers.
- Do not copy ecommerce cart/checkout business logic into catering.
- Do not copy invoice demo state/data model into V3.2 finance.
- Do not copy template contexts as V3.2 domain state.
- Do not replace V3.2 services/repositories with template context/API calls.
- Do not use template navigation as the final V3.2 navigation.
- Do not weaken tenant_id/RLS/permission checks for UI convenience.
- Do not change V3.2 database/business logic merely to match the template UI.

### Architecture contract

Implement through:

```text
Page
 ↓
Feature Components / Hooks
 ↓
Application Service / Use Case
 ↓
Repository / Data Access
 ↓
Supabase / PostgreSQL
```

UI reference is injected only at the presentation/component level.

### Required UI behavior for every V3.2 CRUD page

Provide:

- loading state
- empty state
- error state
- validation state
- permission/disabled state
- success feedback
- destructive-action confirmation
- responsive desktop/tablet/mobile behavior
- search/filter/sort/pagination where required by the feature

### Approved reference selection

Use these mappings:

- Clients → Contacts UI
- Catering Menu → Ecommerce Product UI
- Inventory → Ecommerce Product List + generic Table UI
- Quotations → Invoice UI pattern
- Invoices → Invoice UI
- Contracts → Invoice/document UI pattern
- Bookings → Calendar + detail patterns
- Workflows → Kanban + Calendar
- Team → User Profile / Contacts
- Portfolio → Gallery
- Settings → Account Setting
- Vendor/Super Admin lists → Contacts/Table
- Subscription Plans → Pricing/Table
- Payments → Invoice/Table
- Dashboard → Modern/Ecommerce dashboard cards/charts

### Catering Menu implementation instruction

Use the ecommerce product UI as the reference for:

- catalog/list layout
- search/filter toolbar
- image presentation
- menu detail/gallery
- add/edit form card composition
- pricing block
- availability/status block
- action placement

But implement the actual feature using the V3.2 catering menu schema and services.

Do not introduce ecommerce concepts such as cart, checkout, product variants or order state unless the V3.2 catering specification explicitly requires the equivalent concept.

### Inventory implementation instruction

Use the table/product-list visual pattern for:

- inventory list
- search/filter
- stock/status display
- item form
- detail panel/dialog
- movement history

Actual stock calculations, movement validation, archive behavior and permissions must come from V3.2 inventory services and database constraints.

### Navigation instruction

The template has static demo navigation. Replace it with V3.2 dynamic navigation:

```text
User
 ↓
Tenant
 ↓
Vendor Category
 ↓
Module
 ↓
Subscription Feature
 ↓
Role Permission
 ↓
Visible Navigation
```

### Refactor acceptance criteria

A feature is accepted only when:

- the screen visually follows the selected reference pattern;
- the page uses V3.2 components and feature structure;
- no template mock data remains in production flow;
- no template business logic is accidentally imported;
- data comes from V3.2 service/repository boundaries;
- tenant isolation and RLS are preserved;
- permissions are enforced by V3.2 rules;
- CRUD and business actions are separated;
- responsive behavior is verified;
- loading/empty/error/success/permission states are handled;
- TypeScript/lint/build/tests pass.
