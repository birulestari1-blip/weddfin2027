# V3.2 Supabase migrations

These 15 files are the canonical development sequence for V3.2. They have passed the static V3.2 Supabase readiness audit; live execution is still required before production. They were reordered by dependency rather than by the old source-section numbers. `015_seed.sql` contains the actual seed data; `014_hardening_rls.sql` contains indexes, RLS, consistency triggers, updated_at triggers, and platform-admin policies.

Run only these migrations on a fresh database, or use the monolithic `04_schema_v3_2_final.sql` as an alternative baseline. Do not run both.
