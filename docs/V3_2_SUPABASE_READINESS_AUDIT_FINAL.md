# V3.2 SUPABASE READINESS AUDIT — FINAL

Date: 2026-09-15

## Verdict

**NOT YET READY to run on the production/live Supabase project.**

The V3.2 migration package was re-audited statically and three important issues were corrected in the repository before deployment:

1. `vendor_categories` now has RLS enabled, so its platform-admin policy is actually enforced.
2. `quotations` is now included in the `vendor_category_modules` seed mapping for all five vendor categories.
3. Category-global workflow templates are now vendor-readable but vendor users cannot mutate the shared templates. Platform admins retain management access.
4. `current_tenant_id()` is redefined after `profiles` exists so it can fall back from a trusted `app_metadata.tenant_id` claim to the authenticated user's active profile. This removes the dependency on a custom JWT tenant claim for normal post-onboarding tenant access.

A live PostgreSQL/Supabase execution was **not** performed in this environment, so SQL runtime compatibility, Supabase CLI behavior, generated types, and actual RLS behavior still require execution against a fresh Supabase project.

## Static inventory

- 15 migration files
- 47 tables
- 11 enums
- 7 functions
- 21 indexes
- 33 explicitly declared triggers plus dynamically created trigger sets
- 47/47 tables have RLS enabled after the hardening patch
- No detected FK dependency-order violations
- No duplicate table definitions across migrations
- `015_seed.sql` contains real seed data

## Migration order

```text
001_extensions.sql
002_enums.sql
003_core_tenant.sql
004_users_permissions.sql
005_clients_services.sql
006_bookings.sql
007_quotations.sql
008_finance.sql
009_inventory.sql
010_vendor_specific.sql
011_workflows.sql
012_subscription.sql
013_super_admin.sql
014_hardening_rls.sql
015_seed.sql
```

## Important operational requirements

### 1. Fresh database only for first deployment

Run the migrations against a fresh Supabase project. Do not run the monolithic baseline and the migration sequence together.

### 2. Tenant onboarding

The database still does not create a tenant/profile automatically when a user signs up. The application must implement a secure onboarding/provisioning flow. If the flow uses the Supabase service-role key, that key must remain server-side and must never be exposed to browser code.

### 3. Tenant resolution

After a profile is provisioned, `current_tenant_id()` can resolve the tenant from the authenticated profile. A trusted `app_metadata.tenant_id` claim may also be used when the application deliberately provisions that claim.

Do not use user-editable `user_metadata` as the security source for tenant identity.

### 4. Workflow templates

`vendor_workflows` and `workflow_stages` remain category-global by design. Vendor users can read the template for their category. Only platform admins can mutate shared workflow configuration. Tenant-specific workflow customization is still outside V3.2 scope.

### 5. Quotation module

The `quotations` platform module is seeded and is now mapped to every vendor category. This closes the previously identified module-seed inconsistency.

## Pre-deployment test gate

Before connecting the application to the database, verify on the fresh project:

- all 47 tables exist
- all 11 enums exist
- all expected functions exist
- all expected indexes exist
- all expected triggers exist
- RLS is enabled on every table
- platform-admin policies exist
- public listing/portfolio read policies behave correctly
- quotation module mapping exists for all five categories
- role permission seed exists
- workflow seed exists
- subscription plan seed exists
- authenticated user without a profile cannot access tenant data
- authenticated vendor user can access only its own tenant data
- vendor user cannot read another tenant's data
- vendor user cannot modify global workflow templates
- platform admin can inspect/manage platform data
- platform admin can inspect/manage tenant data according to policy
- inventory movement sign constraints work
- cross-tenant foreign-key trigger checks reject mismatched tenant references
- profile FK to `auth.users` works

## Remaining intentional V3.2 limitations

These are not silently expanded by this audit:

- no generic `booking_items`
- no generic `invoice_items`
- workflow transition rules remain service-level
- workflow templates remain category-global
- role permissions remain global
- public listing synchronization remains application responsibility
- audit automation is not globally automatic
- soft delete is not universal
- payment gateway provider is not defined

## Final recommendation

**Create the Supabase project, but do not connect the production application yet.**

First execute the corrected migration sequence on the fresh Supabase project, verify the runtime test gate above, then commit the corrected repository to GitHub and use that repository as the source of truth for Google AI Studio.


## Final security hardening pass
- `enforce_same_tenant()` changed to `SECURITY DEFINER` with `search_path = public` and now rejects a missing tenant-owned parent. This prevents RLS-hidden parent rows from bypassing cross-tenant consistency checks.
- `vendor_categories` now has a public SELECT policy so onboarding can discover available vendor categories; only platform admins can mutate categories.
- `platform_audit_logs` insert policy now requires either a platform admin or a normal user inserting only their own actor identity and current tenant.
- Added `docs/V3_2_RLS_SECURITY_TEST_PLAN.md`.
