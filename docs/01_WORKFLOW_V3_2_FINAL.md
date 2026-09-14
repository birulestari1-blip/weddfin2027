# WORKFLOW DEVELOPMENT — MULTI-VENDOR EVENT PLATFORM V3.2 FINAL

## Architecture
`UI/Page → Feature Components/Hooks → Application Service/Use Case → Repository/Data Access → Supabase/PostgreSQL`

## Core sales flow
Client → Service → Quotation → Quotation Items → Customer Approval → Booking → Contract → Invoice → Vendor Transaction/Payment → Operational Workflow → Completed.

### Quotation conversion rule
Quotation → Booking is one business operation handled by a service/use-case. V3.2 does **not** create a generic `booking_items` table. Booking history must preserve the agreed service/price snapshot through the existing booking-level fields and quotation items.

## Finance boundary
`subscription_payments` = payment from vendor to the platform. `invoices` and `transactions` = vendor-side customer/business finance.

## Inventory
Inventory Category → Inventory Item → Stock Movement (`in`, `out`, `adjustment`, `return`, `damaged`) → `current_stock`. Frontend is not the source of truth for stock balance.

## Vendor-specific
- Catering: Menu → Menu Items → Recipe → Inventory → Quotation/Booking → Event Execution
- Photography: Service → Booking → Photography Booking Detail → Equipment/Team → Production → Delivery
- Dekorasi: Theme → Decoration Items → Inventory → Booking → Setup → Event → Dismantle
- MUA: Client → MUA Package → MUA Artist → Booking → Schedule/Assignment → Service → Completed
- WO: Client → Quotation → Booking → Rundown → Rundown Items → Team Assignment → Event Execution → Completed

## Generic workflow
Booking Created → Current Stage → Transition request → Validate transition → Update state → Write history → Next Stage.

**V3.2 limitation:** workflow stages/history exist, but dedicated transition-rule table is not part of the schema. Until that enhancement is approved, transition validation lives in the workflow service/use-case.

## Permissions/RLS
Vendor: User → Profile/Role → Role Permission → Module/Subscription check → Server authorization → RLS.
Super Admin: Auth User → `platform_admins` → Platform Role → Platform authorization → Global management. UI hiding is not security.

## Refactor rules
Pages compose; components do not query Supabase directly; repositories own data access; services own business operations; validation is centralized; vendor-specific code stays isolated; Super Admin has a separate boundary.

## Definition of Done
UI, responsive behavior, CRUD/business operations, validation, loading/empty/error/success states, permission, RLS, cross-tenant tests, typecheck, lint, relevant unit/integration/E2E tests, no duplicate business logic, no DB query in UI components, and updated documentation.
