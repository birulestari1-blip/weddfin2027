# PROJECT FILE STRUCTURE — INDUSTRY STANDARD V3.2 FINAL

## Primary rule
Feature-local ownership is the default. `features/<feature>/` owns components, hooks, services, repositories, schemas, types, utils, and tests for that feature. Root-level services/repositories are allowed only for genuinely cross-feature infrastructure.

```text
project-root/
├── app/
│   ├── (auth)/login/
│   ├── (auth)/register/
│   ├── (auth)/forgot-password/
│   ├── (vendor)/dashboard/
│   ├── (vendor)/clients/
│   ├── (vendor)/services/
│   ├── (vendor)/quotations/
│   ├── (vendor)/bookings/
│   ├── (vendor)/team/
│   ├── (vendor)/finance/
│   ├── (vendor)/invoices/
│   ├── (vendor)/contracts/
│   ├── (vendor)/portfolio/
│   ├── (vendor)/inventory/
│   ├── (vendor)/workflows/
│   ├── (vendor)/settings/
│   ├── (vendor-specific)/catering/menu/
│   ├── (vendor-specific)/catering/recipes/
│   ├── (vendor-specific)/photography/equipment/
│   ├── (vendor-specific)/photography/bookings/[bookingId]/
│   ├── (vendor-specific)/dekorasi/themes/
│   ├── (vendor-specific)/dekorasi/items/
│   ├── (vendor-specific)/mua/artists/
│   ├── (vendor-specific)/mua/packages/
│   ├── (vendor-specific)/wedding-organizer/rundowns/
│   └── (platform)/super-admin/
├── features/
│   ├── auth/ tenants/ clients/ services/ quotations/ bookings/ team/ finance/ invoices/ contracts/ portfolio/ inventory/ workflows/
│   ├── catering/{menus,recipes}/
│   ├── photography/{equipment,booking-details}/
│   ├── dekorasi/{themes,items}/
│   ├── mua/{artists,packages}/
│   ├── wedding-organizer/rundowns/
│   └── super-admin/{vendors,subscriptions,payments,audit-logs,platform-settings,admins}/
├── components/{ui,layout,navigation,data-table,forms,feedback,charts}/
├── lib/{supabase,auth,permissions,tenant,query,utils}/
├── types/{database.types.ts,domain,api}/
├── config/{navigation.ts,modules.ts,permissions.ts,vendor-categories.ts}/
├── constants/
├── tests/{unit,integration,e2e}/
├── supabase/{migrations,seed,functions}/
├── docs/{architecture,workflows,database,permissions,features}/
└── public/
```

## Dependency
`Page → Feature Hook/Component → Service/Use Case → Repository → Supabase/Postgres`

## Naming
Files kebab-case; React components PascalCase; functions camelCase; database snake_case; booleans use `is/has/can` naming.
