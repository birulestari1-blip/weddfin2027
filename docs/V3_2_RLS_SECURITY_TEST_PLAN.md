# V3.2 RLS Security Test Plan

## Purpose
Validate tenant isolation and Super Admin authorization on a fresh Supabase database after migrations 001–015.

## Actors
- User A: tenant A, ordinary vendor user
- User B: tenant B, ordinary vendor user
- Super Admin: active row in `platform_admins`
- Anonymous: no authenticated user

## Required tests
1. User A can SELECT/INSERT/UPDATE/DELETE only tenant A business rows.
2. User A cannot SELECT tenant B business rows.
3. User A cannot INSERT a tenant-B row.
4. User A cannot attach a tenant-B client/service/promo/profile/booking/etc. to a tenant-A row.
5. User B has the symmetric result.
6. Public/anonymous users can read published `vendor_public_listings` and published portfolios/media only.
7. Public/anonymous users can read vendor categories and active public subscription plans.
8. Public/anonymous users cannot read private vendor finance, clients, bookings, profiles, inventory, quotations, contracts, or workflow state/history.
9. Vendor users can read their category's workflow template/stages but cannot modify category-global workflow configuration.
10. Super Admin can inspect/manage tenant-owned data and platform configuration.
11. A normal vendor user cannot modify `platform_modules`, `vendor_category_modules`, `role_permissions`, `vendor_categories`, `platform_settings`, or `platform_admins`.
12. A normal vendor user cannot forge a platform audit log for another tenant.
13. Subscription payments/events cannot reference a subscription belonging to another tenant.
14. Inventory movement sign constraint rejects `in`/`return` with negative delta and `out`/`damaged` with positive delta.

## Important implementation note
`enforce_same_tenant()` is `SECURITY DEFINER` so its parent-row lookup is not defeated by RLS hiding the other tenant's parent row. This is essential for cross-tenant FK hardening.

## Deployment gate
Do not start application coding until the fresh database passes these tests.
