# V3.2 Supabase Deployment Checklist

## Before migration
- [ ] Create a fresh Supabase project.
- [ ] Do not run `04_schema_v3_2_final.sql` together with the migrations.
- [ ] Keep the Supabase service-role key server-side only.

## Migration
- [ ] Run `001_extensions.sql` through `015_seed.sql` in order, preferably with Supabase CLI migration workflow.
- [ ] Confirm no migration error.

## Database verification
- [ ] 47 tables
- [ ] 11 enums
- [ ] 7 functions
- [ ] expected indexes/triggers
- [ ] RLS enabled on all 47 tables
- [ ] quotation module mapped to all five vendor categories
- [ ] seed workflows and subscription plans exist

## Security verification
- [ ] Cross-tenant SELECT denied.
- [ ] Cross-tenant INSERT/UPDATE denied.
- [ ] Vendor users cannot mutate category-global workflows.
- [ ] Platform admin access works.
- [ ] Public listing/portfolio policies expose only published records.
- [ ] `current_tenant_id()` resolves from profile after onboarding.

## Application onboarding
- [ ] Sign-up creates/provisions tenant + vendor profile + user profile through a secure server-side flow.
- [ ] No service-role credential is sent to the browser.
- [ ] Tenant identity is not taken from user-editable `user_metadata`.
