# Vendor Management Platform — V3.2

Multi-vendor business management platform for:

- Catering
- Dekorasi
- MUA
- Photography
- Wedding Organizer (WO)

V3.2 is the project source of truth for database structure, business architecture, workflow, permissions, tenant isolation, and official UI/UX reference.

## 1. Source of Truth

Before implementing or changing code, read these documents in order:

1. `docs/MASTER_PROJECT_SPEC_V3.2_FINAL.md`
2. `docs/WORKFLOW_V3.2_FINAL.md`
3. `docs/FILE_STRUCTURE_INDUSTRY_STANDARD_V3.2_FINAL.md`
4. `docs/UIUX_REFERENCE_V3.2_FINAL_README.md`
5. `docs/UIUX_REFERENCE_V3.2_FINAL/` — page/component mapping and reference catalog
6. `supabase/migrations/` — executable database migration source

The monolithic `04_schema_v3_2_final.sql` is a consolidated reference. The numbered migrations are the migration source of truth for implementation.

## 2. Core Rule

**UI/UX may be adapted; V3.2 business logic and database contracts may not be silently changed.**

The uploaded `src.rar` is a UI/UX reference template only. Do not copy its demo business logic, mock data, ecommerce state, MSW handlers, or template-specific application behavior into the production domain.

## 3. Architecture

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

Pages compose UI. Components should not contain direct database queries. Services own business rules. Repositories own data access. Tenant, permission, subscription, and RLS rules must remain enforced.

## 4. Main Product Areas

- Authentication
- Vendor dashboard
- Clients / CRM
- Services
- Quotations
- Bookings
- Finance
- Invoices
- Contracts
- Portfolio
- Inventory
- Workflows
- Vendor-specific modules
- Subscription
- Super Admin

## 5. Vendor-Specific Areas

### Catering
- Menu
- Menu detail
- Recipes
- Inventory integration

### Photography
- Equipment
- Booking detail

### Dekorasi
- Themes
- Items

### MUA
- Artists
- Packages

### Wedding Organizer
- Rundowns
- Rundown detail

## 6. Local Development

1. Install Node.js LTS.
2. Copy `.env.example` to `.env.local` and provide Supabase values.
3. Install dependencies.
4. Run the development server.
5. Apply Supabase migrations in order.

Exact commands may be finalized by the implementation phase; do not invent a competing project structure without updating the V3.2 specification.

## 7. Git Workflow

- `main`: stable/integrated branch.
- `develop`: integration branch if the team chooses a two-branch workflow.
- `feature/<name>`: feature work.
- `fix/<name>`: bug fixes.
- `refactor/<name>`: non-functional refactors.

Every significant change should preserve V3.2 contracts and be reviewable as a focused commit.

## 8. AI Studio

Google AI Studio is an implementation environment, not the authority for product requirements. AI Studio must follow `.ai/AI_STUDIO_RULES.md` and the V3.2 documents.

When a requested implementation conflicts with V3.2, stop and report the conflict instead of silently redesigning the system.
