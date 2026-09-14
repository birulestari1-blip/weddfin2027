# MASTER_PROJECT_SPEC_V3.2_FINAL
## Multi-Vendor Event Vendor Management Platform
### Database + ERD + Workflow + File Structure + Role/Permission + Pages + CRUD + API/Service + UI Rules

**Status:** Blueprint utama sebelum coding  
**Basis:** `04_schema_v3_2_final.sql`, `01_WORKFLOW_V3_2_FINAL.md`, `02_FILE_STRUCTURE_INDUSTRY_STANDARD_V3_2_FINAL.md`, dan ERD V3.2  
**Database target:** PostgreSQL / Supabase  
**Application target:** Next.js / React + TypeScript + Supabase  
**Vendor categories:** Catering, Dekorasi, MUA, Photography, Wedding Organizer

---

# 0. ATURAN DOKUMEN

Dokumen ini adalah **master blueprint**. Coding baru dilakukan setelah feature yang akan dikerjakan dapat dipetakan ke:

1. database/table
2. relationship/FK
3. tenant boundary
4. role/permission
5. route/page
6. CRUD
7. service/use-case
8. repository/data access
9. validation/schema
10. UI state
11. test
12. documentation

### Source of truth

| Area | Source utama |
|---|---|
| Database | `04_schema_v3_2_final.sql` |
| Workflow & implementation order | `01_WORKFLOW_V3_2_FINAL.md` |
| Folder/file architecture | `02_FILE_STRUCTURE_INDUSTRY_STANDARD_V3_2_FINAL.md` |
| Visual relationship | `04_erd_v3_2_final.svg` |
| Active DB development | `supabase/migrations/` |
| UI behavior | Master Spec ini + feature specification |

**Catatan penting:** schema V3.2 adalah baseline yang terdiri dari core schema, vendor-specific schema, workflow, RLS, maturity patch, subscription, Super Admin, audit, dan seed. Schema sendiri menegaskan bahwa data bisnis diisolasi dengan `tenant_id + RLS`, data khusus vendor dipisahkan dari core, dan data publik dipisahkan dari data privat vendor.

---

# 1. PRODUCT VISION

Platform ini adalah **multi-tenant event vendor management platform**.

Satu platform melayani banyak vendor. Setiap vendor mempunyai:

- satu tenant
- satu kategori vendor
- profile vendor
- user/team
- client
- service/package
- quotation
- booking/project
- contract
- invoice
- transaction
- portfolio
- inventory jika modul tersedia
- workflow operasional
- modul khusus sesuai kategori vendor
- subscription

Platform juga mempunyai **Super Admin** yang mengelola level platform:

- vendor/tenant
- kategori vendor
- module configuration
- subscription plan
- subscription
- subscription payment
- vendor suspension/status
- platform settings
- audit log
- platform admin

---

# 2. NON-GOALS / BATASAN

Blueprint ini tidak mengubah business logic V3.2 tanpa keputusan baru.

Jangan secara otomatis menambahkan:

- payment gateway tertentu
- marketplace checkout
- calendar engine
- supplier/purchase order
- tax engine
- notification engine
- chat
- customer portal penuh
- availability conflict engine

Jika fitur tersebut diperlukan, harus dibuat sebagai **change request / V3.2+** dan dipetakan ulang ke database, API/service, UI, permission, dan testing.

---

# 3. ARCHITECTURE OVERVIEW

```text
                         ┌──────────────────────────┐
                         │       PLATFORM           │
                         │      SUPER ADMIN         │
                         └────────────┬─────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                 MULTI-TENANT EVENT PLATFORM                     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Tenant A   │  │   Tenant B   │  │       Tenant N         │ │
│  │  Catering    │  │ Photography  │  │ Dekorasi / MUA / WO   │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         │                  │                      │              │
│         └──────────────────┼──────────────────────┘              │
│                            ▼                                     │
│              CORE CRM / SALES / FINANCE                         │
│   Clients → Services → Quotations → Bookings → Contracts        │
│                                      ↓                           │
│                             Invoices / Payments                  │
│                                      ↓                           │
│                         Operational Workflow                    │
│                                                                 │
│   Operations: Inventory / Portfolio / Team                      │
│                                                                 │
│   Vendor Domains:                                               │
│   Catering | Photography | Dekorasi | MUA | Wedding Organizer   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    PostgreSQL / Supabase
                              │
                              ▼
                         RLS / Auth
```

---

# 4. ARCHITECTURE LAYERS

```text
UI / Route
    ↓
Feature Components / Hooks
    ↓
Application Service / Use Case
    ↓
Repository / Data Access
    ↓
Supabase / PostgreSQL
```

## Dependency rules

1. UI component tidak query database langsung.
2. Page/route hanya composition dan orchestration.
3. Database access berada di repository/service.
4. Business rule berada di service/use-case.
5. Validation terpusat pada schema.
6. Database types tidak boleh menjadi satu-satunya domain model.
7. Shared component hanya untuk komponen yang benar-benar reusable.
8. Vendor-specific logic berada di feature vendor masing-masing.
9. Super Admin dipisahkan dari Vendor Dashboard.
10. Semua tenant operation mempertahankan `tenant_id` dan RLS.
11. UI hiding bukan security.
12. Authorization wajib dilakukan pada server/database.

---

# 5. DATABASE BLUEPRINT

## 5.1 Core tenant/vendor

| Table | Fungsi | Tenant scope |
|---|---|---|
| `tenants` | root tenant/vendor account | tenant root |
| `vendor_categories` | katalog kategori vendor | platform |
| `vendor_profiles` | profile privat vendor | tenant |
| `vendor_public_listings` | data aman untuk listing publik | tenant |
| `profiles` | user/team vendor | tenant |

### Relationship

```text
vendor_categories
       │
       ├──────────────► vendor_profiles
       │
       └──────────────► vendor_category_modules

tenants
   │
   ├── vendor_profiles
   ├── profiles
   ├── clients
   ├── vendor_services
   ├── bookings
   ├── finance
   ├── inventory
   └── vendor-specific data
```

---

# 6. MODULE & PERMISSION MODEL

## Tables

- `platform_modules`
- `vendor_category_modules`
- `role_permissions`

## Vendor roles

- `owner`
- `admin`
- `staff`
- `freelancer`

## Permission actions

- `can_view`
- `can_create`
- `can_update`
- `can_delete`
- `can_export`

### Permission resolution

```text
User
 ↓
Profile
 ↓
Tenant
 ↓
Vendor Category
 ↓
Enabled Modules
 ↓
Role
 ↓
Role Permission
 ↓
Feature access
```

### Rule

Module yang tidak enabled untuk kategori vendor tidak boleh menjadi module aktif vendor.

Permission UI hanya membantu UX. Security tetap berada di RLS/server authorization.

---

# 7. CRM / SALES / BOOKING

## Tables

- `clients`
- `vendor_services`
- `promo_codes`
- `vendor_bookings`
- `project_team_assignments`
- `quotations`
- `quotation_items`

## Sales flow

```text
Lead / Client
      ↓
Client
      ↓
Service / Package
      ↓
Quotation
      ↓
Quotation Items
      ↓
Customer Approval
      ↓
Booking
      ↓
Contract
      ↓
Invoice
      ↓
Payment
      ↓
Operational Workflow
      ↓
Completed
```

## Important business rules

- Booking tidak dibuat langsung dari UI tanpa use-case.
- Quotation → Booking adalah satu business operation.
- Historical booking value harus tetap valid walaupun service berubah.
- `vendor_bookings` menyimpan snapshot client fields untuk kebutuhan historis.

---

# 8. FINANCE

## Tables

- `transactions`
- `invoices`
- `contracts`

## Flow

```text
Booking
   ↓
Invoice
   ↓
Payment
   ↓
Transaction
   ↓
Finance reporting
```

### Transaction types

- `income`
- `expense`
- `payout`

### Booking payment statuses

- `unpaid`
- `dp_paid`
- `fully_paid`
- `refunded`

### Invoice status

- `unpaid`
- `paid`
- `overdue`
- `canceled`

---

# 9. PORTFOLIO

## Tables

- `portfolios`
- `portfolio_media`

Flow:

```text
Portfolio
   ├── Image
   └── Video
```

Public access hanya untuk portfolio/media yang dipublish.

---

# 10. INVENTORY

## Tables

- `inventory_categories`
- `inventory_items`
- `inventory_stock_movements`

## Stock model

```text
Inventory Item
      ↓
Stock Movement Ledger
      ↓
apply_inventory_stock_movement()
      ↓
current_stock
```

### Movement types

| Type | Sign |
|---|---:|
| `in` | positive |
| `return` | positive |
| `out` | negative |
| `damaged` | negative |
| `adjustment` | signed adjustment |

### Critical rule

Frontend **tidak boleh mengubah `current_stock` secara langsung**.

Semua perubahan stok harus melalui movement agar audit trail tetap tersedia.

---

# 11. VENDOR-SPECIFIC DOMAINS

## 11.1 Catering

Tables:

- `catering_menus`
- `catering_menu_items`
- `catering_recipes`

Relationship:

```text
Menu
 └── Menu Items
      └── Recipe
           └── Inventory Item
```

CRUD:

- Menu
- Menu item
- Recipe
- image
- active/inactive

---

## 11.2 Photography

Tables:

- `photography_equipment`
- `photography_booking_details`

Relationship:

```text
Inventory Item
      ↓
Photography Equipment

Booking
      ↓
Photography Booking Details
```

CRUD:

- equipment
- equipment status
- shooting details
- photographer count
- delivery deadline
- shot list
- editing notes

---

## 11.3 Dekorasi

Tables:

- `decoration_themes`
- `decoration_items`
- `decoration_theme_items`

Relationship:

```text
Theme
 └── Theme Items
       └── Decoration Item
              └── Inventory Item
```

CRUD:

- themes
- decoration items
- theme composition
- quantity per theme item

---

## 11.4 MUA

Tables:

- `mua_artists`
- `mua_packages`

Relationship:

```text
Profile
   ↓
MUA Artist

MUA Package
   └── Included Services
```

CRUD:

- artists
- artist specialization
- portfolio URLs
- packages
- duration
- included services

---

## 11.5 Wedding Organizer

Tables:

- `wo_rundowns`
- `wo_rundown_items`

Relationship:

```text
Booking
   ↓
Rundown
   └── Rundown Items
```

CRUD:

- rundown
- schedule item
- start/end time
- activity
- location
- PIC
- status
- notes

---

# 12. WORKFLOW ENGINE

## Tables

- `vendor_workflows`
- `workflow_stages`
- `booking_workflow_states`
- `booking_workflow_history`

## Workflow model

```text
Vendor Category
      ↓
Workflow
      ↓
Stages
      ↓
Booking
      ↓
Current Stage
      ↓
History
```

### Default workflows

| Vendor | Workflow |
|---|---|
| Catering | Catering Event Workflow |
| Photography | Photography Workflow |
| Dekorasi | Decoration Workflow |
| MUA | MUA Workflow |
| WO | Wedding Organizer Workflow |

### Important rule

Workflow stage transition harus dilakukan melalui service/use-case agar history tetap tercatat.

---

# 13. SUBSCRIPTION / BILLING PLATFORM

## Tables

- `subscription_plans`
- `subscriptions`
- `subscription_payments`
- `subscription_events`

## Status

`subscription_status_enum`:

- `trialing`
- `active`
- `past_due`
- `paused`
- `canceled`
- `expired`

## Billing interval

- `monthly`
- `yearly`
- `lifetime`

## Payment status

- `pending`
- `paid`
- `failed`
- `refunded`
- `canceled`

## Flow

```text
Tenant
  ↓
Subscription Plan
  ↓
Subscription
  ↓
Subscription Payment
  ↓
Subscription Event
```

---

# 14. SUPER ADMIN

## Tables

- `platform_admins`
- `platform_audit_logs`
- `vendor_status_history`
- `platform_settings`

## Super Admin flow

```text
Login
  ↓
Auth
  ↓
platform_admins
  ↓
is_platform_admin()
  ↓
Super Admin Dashboard
```

## Super Admin capabilities

| Area | Capability |
|---|---|
| Vendors | view/manage tenant vendor |
| Categories | manage vendor categories |
| Modules | manage platform modules |
| Module mapping | configure category modules |
| Permissions | manage role permissions |
| Workflows | manage workflow templates/stages |
| Plans | manage subscription plans |
| Subscriptions | manage tenant subscription |
| Payments | manage subscription payment |
| Audit | view audit log |
| Vendor status | suspend/activate |
| Platform settings | manage global settings |
| Admins | manage platform admins |

Super Admin mendapat policy khusus untuk mengakses tenant-owned data dan global configuration.

---

# 15. RLS / SECURITY BLUEPRINT

## Vendor request

```text
JWT
 ↓
app_metadata.tenant_id
 ↓
current_tenant_id()
 ↓
RLS
 ↓
current tenant data only
```

## Super Admin

```text
auth.uid()
 ↓
platform_admins
 ↓
is_platform_admin()
 ↓
platform policy
 ↓
global/vendor access
```

### Security rules

1. Tenant A tidak boleh membaca Tenant B.
2. Tenant A tidak boleh update Tenant B.
3. Tenant A tidak boleh insert relation lintas tenant.
4. Public listing hanya data yang memang dipublish.
5. Public portfolio hanya portfolio yang dipublish.
6. `bank_account_info` tidak boleh diekspos melalui public vendor profile.
7. Super Admin dapat mengakses tenant data sesuai platform policy.
8. RLS bukan pengganti application authorization; keduanya harus benar.

---

# 16. PAGE / ROUTE MASTER LIST

## 16.1 Auth

```text
/login
/register
/forgot-password
```

## 16.2 Vendor Core

```text
/dashboard
/clients
/services
/quotations
/bookings
/team
/finance
/invoices
/contracts
/portfolio
/inventory
/workflows
/settings
```

## 16.3 Catering

```text
/catering/menu
/catering/menu/[id]
/catering/recipes
```

## 16.4 Photography

```text
/photography/equipment
/photography/bookings/[bookingId]
```

## 16.5 Dekorasi

```text
/dekorasi/themes
/dekorasi/items
```

## 16.6 MUA

```text
/mua/artists
/mua/packages
```

## 16.7 Wedding Organizer

```text
/wedding-organizer/rundowns
/wedding-organizer/rundowns/[id]
```

## 16.8 Super Admin

```text
/super-admin
/super-admin/vendors
/super-admin/vendor-categories
/super-admin/subscriptions
/super-admin/subscription-plans
/super-admin/payments
/super-admin/audit-logs
/super-admin/platform-settings
/super-admin/admins
```

**Catatan:** route detail dan route action adalah implementasi UI yang mengikuti table/feature terkait; nama route dapat disesuaikan dengan convention project tanpa mengubah domain model.

---

# 17. MASTER CRUD MATRIX

| Feature | Table(s) | List | Search/Filter | Create | Detail | Update | Delete/Archive | Export |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Clients | `clients` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Services | `vendor_services` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Promo | `promo_codes` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Quotations | `quotations`, `quotation_items` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Bookings | `vendor_bookings` | ✓ | ✓ | use-case | ✓ | ✓ | ✓ | permission |
| Team | `profiles` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Assignments | `project_team_assignments` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Invoices | `invoices` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Transactions | `transactions` | ✓ | ✓ | ✓ | ✓ | controlled | controlled | permission |
| Contracts | `contracts` | ✓ | ✓ | ✓ | ✓ | ✓ | controlled | permission |
| Portfolio | `portfolios`, `portfolio_media` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Inventory categories | `inventory_categories` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Inventory items | `inventory_items` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Stock movements | `inventory_stock_movements` | ✓ | ✓ | ✓ | ✓ | append ledger | no direct edit | permission |
| Catering menus | `catering_menus` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Catering menu items | `catering_menu_items` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Catering recipes | `catering_recipes` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Photography equipment | `photography_equipment` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Photography booking details | `photography_booking_details` | ✓ | — | ✓ | ✓ | ✓ | controlled | — |
| Decoration themes | `decoration_themes` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Decoration items | `decoration_items` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Theme items | `decoration_theme_items` | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| MUA artists | `mua_artists` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| MUA packages | `mua_packages` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| WO rundowns | `wo_rundowns` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| WO rundown items | `wo_rundown_items` | ✓ | — | ✓ | ✓ | ✓ | ✓ | — |
| Workflows | `vendor_workflows` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | permission |
| Workflow stages | `workflow_stages` | ✓ | — | ✓ | ✓ | ✓ | ✓ | permission |
| Subscription plans | `subscription_plans` | ✓ | ✓ | ✓ | ✓ | ✓ | controlled | platform |
| Subscriptions | `subscriptions` | ✓ | ✓ | controlled | ✓ | ✓ | controlled | platform |
| Subscription payments | `subscription_payments` | ✓ | ✓ | ✓ | ✓ | controlled | controlled | platform |
| Audit logs | `platform_audit_logs` | ✓ | ✓ | — | ✓ | append-only | no | platform |
| Vendor status history | `vendor_status_history` | ✓ | ✓ | system/admin | ✓ | no | no | platform |
| Platform settings | `platform_settings` | ✓ | ✓ | ✓ | ✓ | ✓ | controlled | platform |

### CRUD rule

CRUD button visibility must follow permission, but backend/RLS must independently enforce authorization.

---

# 18. SERVICE / USE-CASE MASTER

## Auth

```text
authService
  - signIn
  - signOut
  - register
  - resolveSession
```

## Tenant

```text
tenantService
  - resolveTenant
  - getVendorProfile
  - updateVendorProfile
```

## Client

```text
clientService
  - listClients
  - getClient
  - createClient
  - updateClient
  - deleteClient
```

## Service

```text
vendorService
  - listServices
  - getService
  - createService
  - updateService
  - archiveService
```

## Quotation

```text
quotationService
  - listQuotations
  - getQuotation
  - createQuotation
  - updateQuotation
  - sendQuotation
  - acceptQuotation
  - rejectQuotation
  - convertQuotationToBooking
```

## Booking

```text
bookingService
  - listBookings
  - getBooking
  - createBooking
  - updateBooking
  - cancelBooking
  - assignTeam
```

## Invoice

```text
invoiceService
  - listInvoices
  - getInvoice
  - createInvoice
  - updateInvoice
  - markPaid
  - cancelInvoice
```

## Finance

```text
financeService
  - listTransactions
  - createTransaction
  - getTransaction
  - financeSummary
```

## Inventory

```text
inventoryService
  - listItems
  - createItem
  - updateItem
  - archiveItem
  - listMovements
  - createStockMovement
  - getStockSummary
```

## Workflow

```text
workflowService
  - listWorkflows
  - getWorkflow
  - createWorkflow
  - updateWorkflow
  - deleteWorkflow
  - listStages
  - moveBookingStage
  - getWorkflowHistory
```

## Subscription

```text
subscriptionService
  - listPlans
  - getPlan
  - createPlan
  - updatePlan
  - getSubscription
  - changePlan
  - recordPayment
  - recordSubscriptionEvent
```

## Super Admin

```text
platformAdminService
  - listVendors
  - getVendor
  - updateVendorStatus
  - listSubscriptions
  - managePlans
  - managePayments
  - listAuditLogs
  - managePlatformSettings
  - managePlatformAdmins
```

---

# 19. REPOSITORY LAYER

Repository bertanggung jawab terhadap data access, bukan business workflow.

Contoh:

```text
repositories/
├── clients/
│   └── client-repository.ts
├── bookings/
│   └── booking-repository.ts
├── quotations/
│   └── quotation-repository.ts
├── invoices/
│   └── invoice-repository.ts
├── inventory/
│   └── inventory-repository.ts
└── subscriptions/
    └── subscription-repository.ts
```

Repository tidak boleh mengambil keputusan bisnis seperti:

- apakah quotation boleh dikonversi
- apakah invoice boleh dibayar
- apakah workflow boleh lompat stage
- apakah stok boleh negatif

Keputusan tersebut berada di service/use-case.

---

# 20. VALIDATION

Gunakan schema terpusat.

Contoh:

```text
schemas/
├── auth/
├── clients/
├── quotations/
├── bookings/
├── inventory/
└── subscriptions/
```

Validation minimal:

- required field
- type
- format
- range
- business input constraint
- permission-aware action di service

Database constraint tetap menjadi lapisan terakhir.

---

# 21. UI RULES

## Semua halaman CRUD minimal mempunyai

```text
Loading State
Empty State
Error State
Success Feedback
Validation State
Permission State
Responsive Layout
```

## Standard list page

```text
Page Header
 ├── title
 ├── description
 └── primary action

Toolbar
 ├── search
 ├── filter
 ├── sort
 └── export

Data Table
 ├── status
 ├── actions
 └── pagination

Detail / Form
 ├── view
 ├── edit
 └── delete/archive
```

## Form rules

- label jelas
- required indicator
- inline validation
- disabled state saat submit
- confirmation untuk destructive action
- success/error feedback
- jangan kehilangan input ketika request gagal

## Responsive

Target:

```text
Desktop
Tablet
Mobile
```

Table pada mobile dapat menggunakan:

- horizontal scroll
- card layout
- responsive columns

sesuai kebutuhan feature.

---

# 22. NAVIGATION RULE

Sidebar vendor harus bersifat dynamic.

```text
User
 ↓
Tenant
 ↓
Vendor Category
 ↓
Category Modules
 ↓
Subscription Features
 ↓
Role Permission
 ↓
Visible Navigation
```

Contoh:

### Catering

```text
Dashboard
Clients
Services
Bookings
Menu
Inventory
Team
Finance
Invoices
Contracts
Portfolio
Reports
Settings
```

### Photography

```text
Dashboard
Clients
Services
Bookings
Equipment
Team
Finance
Invoices
Contracts
Portfolio
Reports
Settings
```

### Dekorasi

```text
Dashboard
Clients
Services
Bookings
Decoration
Inventory
Team
Finance
Invoices
Contracts
Portfolio
Reports
Settings
```

### MUA

```text
Dashboard
Clients
Services
Bookings
MUA Artists
Inventory
Team
Finance
Invoices
Contracts
Portfolio
Reports
Settings
```

### Wedding Organizer

```text
Dashboard
Clients
Services
Bookings
Rundown
Team
Finance
Invoices
Contracts
Portfolio
Reports
Settings
```

---

# 23. FILE STRUCTURE MASTER

```text
project-root/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── (vendor)/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── services/
│   │   ├── quotations/
│   │   ├── bookings/
│   │   ├── team/
│   │   ├── finance/
│   │   ├── invoices/
│   │   ├── contracts/
│   │   ├── portfolio/
│   │   ├── inventory/
│   │   ├── workflows/
│   │   └── settings/
│   │
│   ├── (vendor-specific)/
│   │   ├── catering/
│   │   ├── photography/
│   │   ├── dekorasi/
│   │   ├── mua/
│   │   └── wedding-organizer/
│   │
│   ├── (platform)/
│   │   └── super-admin/
│   │       ├── dashboard/
│   │       ├── vendors/
│   │       ├── vendor-categories/
│   │       ├── subscriptions/
│   │       ├── subscription-plans/
│   │       ├── payments/
│   │       ├── audit-logs/
│   │       ├── platform-settings/
│   │       └── admins/
│   │
│   └── api/
│
├── features/
│   ├── auth/
│   ├── tenants/
│   ├── clients/
│   ├── services/
│   ├── quotations/
│   ├── bookings/
│   ├── team/
│   ├── finance/
│   ├── invoices/
│   ├── contracts/
│   ├── portfolio/
│   ├── inventory/
│   ├── workflows/
│   ├── catering/
│   │   ├── menus/
│   │   └── recipes/
│   ├── photography/
│   │   ├── equipment/
│   │   └── booking-details/
│   ├── dekorasi/
│   │   ├── themes/
│   │   └── items/
│   ├── mua/
│   │   ├── artists/
│   │   └── packages/
│   ├── wedding-organizer/
│   │   └── rundowns/
│   └── super-admin/
│       ├── vendors/
│       ├── subscriptions/
│       ├── payments/
│       ├── audit-logs/
│       └── platform-settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── data-table/
│   ├── forms/
│   ├── feedback/
│   └── charts/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── admin.ts
│   ├── auth/
│   ├── permissions/
│   ├── tenant/
│   ├── query/
│   └── utils/
│
├── repositories/
│   ├── clients/
│   ├── bookings/
│   ├── quotations/
│   ├── invoices/
│   ├── inventory/
│   └── subscriptions/
│
├── services/
│   ├── booking/
│   ├── quotation/
│   ├── invoice/
│   ├── payment/
│   ├── inventory/
│   ├── workflow/
│   ├── subscription/
│   └── audit/
│
├── schemas/
│   ├── clients/
│   ├── quotations/
│   ├── bookings/
│   ├── inventory/
│   ├── subscriptions/
│   └── auth/
│
├── types/
│   ├── database.types.ts
│   ├── domain/
│   └── api/
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-tenant.ts
│   ├── use-permission.ts
│   └── use-debounce.ts
│
├── config/
│   ├── navigation.ts
│   ├── modules.ts
│   ├── permissions.ts
│   └── vendor-categories.ts
│
├── constants/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── functions/
├── docs/
│   ├── architecture/
│   ├── workflows/
│   ├── database/
│   ├── permissions/
│   └── features/
├── public/
├── .env.example
├── eslint.config.*
├── tsconfig.json
├── package.json
└── README.md
```

---

# 24. FEATURE INTERNAL STRUCTURE

Untuk feature besar:

```text
features/bookings/
├── components/
│   ├── booking-table.tsx
│   ├── booking-form.tsx
│   ├── booking-detail.tsx
│   └── booking-status-badge.tsx
├── hooks/
│   ├── use-bookings.ts
│   └── use-booking-mutations.ts
├── services/
│   └── booking-service.ts
├── repositories/
│   └── booking-repository.ts
├── schemas/
│   └── booking-schema.ts
├── types/
│   └── booking.types.ts
├── utils/
│   └── booking-utils.ts
└── tests/
    └── booking-service.test.ts
```

Refactor feature harus terutama terjadi di boundary feature tersebut.

---

# 25. DATABASE MIGRATION MASTER

Untuk development aktif:

```text
supabase/migrations/
├── 001_extensions.sql
├── 002_enums.sql
├── 003_core_tenant.sql
├── 004_users_permissions.sql
├── 005_clients_services.sql
├── 006_bookings.sql
├── 007_quotations.sql
├── 008_finance.sql
├── 009_inventory.sql
├── 010_vendor_specific.sql
├── 011_workflows.sql
├── 012_subscription.sql
├── 013_super_admin.sql
├── 014_hardening_rls.sql
└── 015_seed.sql
```

**Catatan:** migration harus menjadi source of truth untuk database development. SQL final V3.2 disimpan sebagai baseline/reference.

---

# 26. API / DATA ACCESS BOUNDARY

API route jika diperlukan:

```text
app/api/
├── auth/
├── clients/
├── services/
├── quotations/
├── bookings/
├── invoices/
├── inventory/
├── workflows/
├── subscriptions/
└── super-admin/
```

Namun jika operasi dapat dilakukan aman melalui server action/service + Supabase policy, jangan membuat endpoint hanya demi menambah endpoint.

### Rule

```text
Route
 ↓
Service / Use Case
 ↓
Repository
 ↓
Supabase
```

Tidak:

```text
Route
 ↓
random Supabase query
```

---

# 27. DOMAIN TYPE BOUNDARY

```text
types/database.types.ts
        ↓
domain types
        ↓
API/UI types
```

Tujuan:

- database schema dapat berubah tanpa merusak seluruh UI
- domain model lebih jelas
- API contract terkontrol
- mapping database → domain berada di boundary

---

# 28. STANDARD PAGE SPEC

Setiap halaman baru wajib memiliki:

```text
1. Route
2. Purpose
3. Permission
4. Module dependency
5. Database table
6. Relationship
7. List fields
8. Search/filter
9. CRUD
10. Form schema
11. Service
12. Repository
13. Loading state
14. Empty state
15. Error state
16. Success feedback
17. Responsive behavior
18. RLS consideration
19. Test cases
```

Template:

```text
FEATURE:
ROUTE:
MODULE:
ROLES:

TABLES:
RELATIONSHIPS:

LIST:
SEARCH:
FILTER:
SORT:
PAGINATION:

CREATE:
READ:
UPDATE:
DELETE/ARCHIVE:

VALIDATION:

SERVICE:
REPOSITORY:

PERMISSION:

RLS:

UI STATES:

TEST:
```

---

# 29. STANDARD CRUD WORKFLOW

```text
List
 ↓
Search / Filter / Pagination
 ↓
Create
 ↓
Validate
 ↓
Save
 ↓
Invalidate / Refresh
 ↓
Detail
 ├── Edit
 └── Delete / Archive
```

Setiap CRUD harus mempunyai:

- loading
- empty
- error
- success
- validation
- permission
- responsive UI

---

# 30. BUSINESS OPERATION VS CRUD

Tidak semua action adalah CRUD sederhana.

### Simple CRUD

```text
Create Client
Update Client
Delete Client
```

### Business operation

```text
Accept Quotation
       ↓
Convert to Booking
       ↓
Create/Update Booking
       ↓
Initialize Workflow
```

### Inventory operation

```text
Create Stock Movement
       ↓
Trigger
       ↓
Update current_stock
```

### Workflow operation

```text
Move Stage
       ↓
Validate transition
       ↓
Update current state
       ↓
Write history
```

Business operation harus dibuat sebagai service/use-case.

---

# 31. ROLE MATRIX — BASELINE

Role permissions di schema default di-seed sebagai berikut:

| Role | View | Create | Update | Delete | Export |
|---|---:|---:|---:|---:|---:|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Staff | ✓ | — | ✓ | — | — |
| Freelancer | ✓ | — | — | — | — |

Mapping aktual tetap dikendalikan oleh `role_permissions`.

**Catatan:** hak akses Super Admin bukan bagian dari role vendor di atas. Super Admin menggunakan `platform_admins` dan `platform_admin_role_enum`.

---

# 32. PLATFORM ADMIN ROLES

Schema menyediakan:

- `super_admin`
- `support_admin`
- `finance_admin`
- `content_admin`

Super Admin memiliki prioritas penuh terhadap platform role check.

Hak detail untuk role non-super-admin perlu didefinisikan sebagai policy platform sebelum implementasi granular.

---

# 33. SUBSCRIPTION FEATURE GATING

Model:

```text
Vendor Category
      +
Subscription Plan
      +
Role Permission
      ↓
Effective Feature Access
```

Contoh:

```text
Module enabled by category?
      ↓
YES
      ↓
Included by subscription?
      ↓
YES
      ↓
Role has permission?
      ↓
YES
      ↓
ALLOW
```

Jika salah satu boundary menolak:

```text
DENY
```

UI boleh menyembunyikan module, tetapi authorization backend tetap wajib.

---

# 34. AUDIT

Audit table:

`platform_audit_logs`

Action enum:

- create
- update
- delete
- restore
- suspend
- activate
- login
- logout
- subscription_change
- payment_update
- impersonation_start
- impersonation_end

Audit minimal menyimpan:

- actor
- tenant
- action
- entity type
- entity id
- old data
- new data
- metadata
- timestamp

---

# 35. DATA LIFECYCLE

Untuk destructive data, prefer:

```text
Active
 ↓
Archive / Inactive
 ↓
Delete hanya jika aman
```

Namun schema V3.2 tidak menyediakan soft-delete field generik pada seluruh tabel. Jangan mengarang soft-delete implementation secara otomatis. Jika soft-delete menjadi requirement, buat perubahan schema tersendiri.

---

# 36. TESTING BLUEPRINT

## Unit

Target:

- service
- validation
- calculation
- permission resolver
- workflow logic
- inventory logic

## Integration

Target:

- repository
- Supabase interaction
- RLS
- tenant isolation
- business operation

## E2E

Minimal:

```text
Vendor A tidak dapat melihat Vendor B
Vendor A tidak dapat mengubah Vendor B
Super Admin dapat melihat Vendor A + B
Super Admin dapat mengelola subscription
Vendor hanya melihat module sesuai category/subscription
```

## Feature E2E

```text
Client CRUD
Service CRUD
Quotation lifecycle
Quotation → Booking
Booking → Invoice
Payment → Transaction
Inventory movement
Workflow transition
Catering menu CRUD
Photography equipment CRUD
Decoration theme CRUD
MUA artist CRUD
WO rundown CRUD
Subscription management
Super Admin vendor management
```

---

# 37. REFACTOR WORKFLOW

Sebelum refactor:

```text
Understand
 ↓
Identify dependency
 ↓
Add/verify tests
 ↓
Refactor
 ↓
Typecheck
 ↓
Lint
 ↓
Tests
 ↓
Review affected modules
```

### Jangan

- mengganti business logic hanya karena merapikan code
- membuat `utils.ts` raksasa
- membuat `components.tsx` raksasa
- query Supabase dari semua page
- membuat conditional JSX vendor yang terlalu panjang

### Lakukan

- extract feature
- extract reusable component
- extract service/use-case
- extract schema
- extract types
- keep dependencies one-directional

---

# 38. IMPLEMENTATION PHASES

## Phase 1 — Foundation

1. Auth
2. Tenant
3. Vendor profile
4. User/profile
5. Role & permission
6. Module resolver
7. App shell

## Phase 2 — Core CRM

1. Clients
2. Services
3. Quotations
4. Bookings
5. Team
6. Contracts

## Phase 3 — Finance

1. Invoices
2. Transactions
3. Payment status
4. Finance dashboard

## Phase 4 — Operations

1. Inventory
2. Workflow
3. Portfolio

## Phase 5 — Vendor-specific

1. Catering
2. Photography
3. Dekorasi
4. MUA
5. Wedding Organizer

## Phase 6 — Platform

1. Super Admin
2. Vendor management
3. Subscription plans
4. Subscriptions
5. Subscription payments
6. Audit logs
7. Vendor suspension

## Phase 7 — Hardening

1. RLS testing
2. Authorization testing
3. Cross-tenant testing
4. Performance
5. Error monitoring
6. Backup/recovery
7. Production deployment

---

# 39. DEFINITION OF DONE

Feature hanya dianggap selesai jika:

- [ ] UI selesai
- [ ] responsive
- [ ] CRUD bekerja
- [ ] validation bekerja
- [ ] loading state
- [ ] empty state
- [ ] error state
- [ ] success feedback
- [ ] permission benar
- [ ] RLS benar
- [ ] tenant isolation diuji
- [ ] typecheck lolos
- [ ] lint lolos
- [ ] unit/integration test relevan lolos
- [ ] E2E relevan lolos
- [ ] tidak ada duplicate business logic
- [ ] tidak ada query database di UI component
- [ ] dokumentasi feature diperbarui

---

# 40. PRE-CODING CHECKLIST

Sebelum developer mulai sebuah feature:

### Database

- [ ] Table sudah ada?
- [ ] FK sudah benar?
- [ ] tenant_id sudah benar?
- [ ] unique/check constraint sudah ada?
- [ ] index diperlukan?
- [ ] RLS sudah ada?
- [ ] trigger diperlukan?

### Domain

- [ ] relationship jelas?
- [ ] business rule jelas?
- [ ] lifecycle jelas?
- [ ] destructive action jelas?

### Permission

- [ ] module?
- [ ] role?
- [ ] action?
- [ ] Super Admin?
- [ ] subscription gating?

### Backend

- [ ] service/use-case?
- [ ] repository?
- [ ] schema validation?
- [ ] domain type?
- [ ] API/server action jika diperlukan?

### UI

- [ ] route?
- [ ] list?
- [ ] search/filter?
- [ ] form?
- [ ] detail?
- [ ] loading?
- [ ] empty?
- [ ] error?
- [ ] success?
- [ ] responsive?

### Testing

- [ ] unit?
- [ ] integration?
- [ ] RLS?
- [ ] cross-tenant?
- [ ] E2E?

---

# 41. CURRENT V3.2 DATABASE INVENTORY

## Platform

```text
subscription_plans
subscriptions
subscription_payments
subscription_events
platform_admins
platform_audit_logs
vendor_status_history
platform_settings
```

## Core Vendor / Tenant

```text
tenants
vendor_categories
vendor_profiles
vendor_public_listings
profiles
```

## Module / Permission

```text
platform_modules
vendor_category_modules
role_permissions
```

## CRM / Sales / Booking

```text
clients
vendor_services
promo_codes
vendor_bookings
project_team_assignments
quotations
quotation_items
```

## Finance

```text
transactions
invoices
contracts
```

## Portfolio

```text
portfolios
portfolio_media
```

## Inventory

```text
inventory_categories
inventory_items
inventory_stock_movements
```

## Catering

```text
catering_menus
catering_menu_items
catering_recipes
```

## Photography

```text
photography_equipment
photography_booking_details
```

## Dekorasi

```text
decoration_themes
decoration_items
decoration_theme_items
```

## MUA

```text
mua_artists
mua_packages
```

## Wedding Organizer

```text
wo_rundowns
wo_rundown_items
```

## Workflow

```text
vendor_workflows
workflow_stages
booking_workflow_states
booking_workflow_history
```

---

# 42. KNOWN V3.2 GAPS / DECISIONS BEFORE PRODUCTION

Bagian ini **bukan penambahan fitur otomatis**. Ini adalah daftar hal yang perlu diputuskan jika ingin production-grade lebih lanjut.

## 42.1 Workflow ownership

V3.2 menyimpan workflow berdasarkan `vendor_category_id`, sehingga workflow berfungsi sebagai template/configuration category. Jika setiap tenant harus memiliki workflow custom yang benar-benar independen, diperlukan model tenant-specific workflow.

## 42.2 Permission scope

`role_permissions` adalah konfigurasi role/module global. Jika permission harus berbeda antar tenant, diperlukan tenant-scoped permission model.

## 42.3 Public listing synchronization

`vendor_public_listings` memisahkan data publik dari `vendor_profiles`, tetapi sinkronisasi keduanya perlu ditangani secara eksplisit oleh application service/trigger.

## 42.4 Booking items

V3.2 menggunakan booking-level service/price fields dan quotation items, tetapi belum menyediakan generic `booking_items`. Jika satu booking harus berisi banyak service/package secara native, perlu keputusan schema.

## 42.5 Invoice items

V3.2 belum menyediakan generic `invoice_items`. Jika invoice harus mempunyai beberapa line item, perlu schema tambahan.

## 42.6 Workflow transition rules

V3.2 menyediakan stages dan history, tetapi aturan transisi antar-stage belum menjadi tabel transition rule khusus. Jika diperlukan approval/allowed transition yang ketat, perlu enhancement.

## 42.7 Audit automation

Audit log table tersedia, tetapi mekanisme otomatis untuk menangkap semua perubahan bisnis perlu ditentukan.

## 42.8 Soft delete

Tidak semua table memiliki `deleted_at`. Jangan menganggap delete = archive secara otomatis.

## 42.9 Payment gateway

Subscription payment table sudah tersedia, tetapi provider/payment gateway tertentu belum ditetapkan.

---

# 43. MASTER DEVELOPMENT CONTRACT

Developer wajib mengikuti kontrak berikut:

```text
DATABASE
   ↓
DOMAIN
   ↓
SERVICE / USE-CASE
   ↓
REPOSITORY
   ↓
HOOK
   ↓
COMPONENT
   ↓
PAGE
```

Tidak boleh membalik dependency tanpa alasan arsitektural yang terdokumentasi.

### Tenant contract

```text
Every tenant business operation
        ↓
must preserve tenant context
        ↓
RLS
        ↓
cross-tenant access denied
```

### Super Admin contract

```text
Platform admin
        ↓
platform_admins
        ↓
is_platform_admin()
        ↓
platform policies
        ↓
global/vendor management
```

### Vendor domain contract

```text
Core
 ├── Client
 ├── Service
 ├── Quotation
 ├── Booking
 ├── Finance
 └── Team

Vendor-specific
 ├── Catering
 ├── Photography
 ├── Dekorasi
 ├── MUA
 └── WO
```

Vendor-specific logic tidak boleh merusak core abstraction.

---

# 44. FINAL BLUEPRINT

```text
                    MASTER_PROJECT_SPEC_V3.2_FINAL
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
     DATABASE               SECURITY             PLATFORM
        │                     │                     │
        ▼                     ▼                     ▼
       ERD                    RLS              SUPER ADMIN
        │                     │                     │
        └──────────────┬──────┴──────────────┬──────┘
                       ▼                     ▼
                    DOMAIN               SUBSCRIPTION
                       │
                       ▼
                   WORKFLOW
                       │
                       ▼
                  SERVICE/API
                       │
                       ▼
                  REPOSITORY
                       │
                       ▼
                  FEATURE MODULE
                       │
                       ▼
                       UI
                       │
                       ▼
                    TESTING
                       │
                       ▼
                   PRODUCTION
```

## Prinsip akhir

**Database menentukan data.**  
**ERD menentukan relationship.**  
**Workflow menentukan proses bisnis.**  
**Role/permission menentukan siapa boleh melakukan apa.**  
**RLS menentukan batas keamanan data.**  
**Service/use-case menentukan business operation.**  
**Repository menentukan data access.**  
**Feature module menentukan ownership code.**  
**Page menentukan composition UI.**  
**Testing memastikan semuanya tetap benar.**

Dengan blueprint ini, coding dilakukan **feature-by-feature**, bukan dengan menambahkan file secara acak.

---

# 45. OFFICIAL UI/UX REFERENCE — V3.2

V3.2 menggunakan hasil audit `src.rar` sebagai **sumber resmi UI/UX reference**, tanpa menjadikannya sumber business logic. Package resmi berada di:

```text
UIUX_REFERENCE_V3.2_FINAL/
├── README.md
├── 01_UIUX_AUDIT_REPORT.md
├── 02_PAGE_REFERENCE_MAP.md
├── 03_COMPONENT_CATALOG.md
├── 04_IMPLEMENTATION_PROMPT.md
├── 05_SOURCE_COVERAGE_MATRIX.md
├── SOURCE_INVENTORY.csv
├── AUDIT_DATA.json
└── SOURCE/
    └── src.rar
```

## 45.1 Source status

Audit complete:

- 1,366 archive entries
- 1,033 files
- 333 directories
- React/TypeScript template/reference source
- source inventory tersedia secara path-level

## 45.2 UI/UX source-of-truth hierarchy

Urutan authority:

```text
1. V3.2 Database Schema / Migration
2. V3.2 Domain + Business Rules
3. V3.2 Service / Use Case
4. V3.2 Repository / Data Access
5. V3.2 Permission + Tenant Isolation + RLS
6. V3.2 Workflow Contract
7. UIUX_REFERENCE_V3.2_FINAL
8. Detail implementation dari template, hanya jika tidak konflik
```

## 45.3 Mandatory UI adaptation rule

```text
V3.2 Page
  ↓
V3.2 Feature Component / Hook
  ↓
V3.2 Service / Use Case
  ↓
V3.2 Repository
  ↓
Supabase / PostgreSQL

UI/UX reference only:
  src.rar
```

Template tidak boleh menggantikan service, repository, schema, permission, tenant scope, RLS, workflow, atau domain model V3.2.

## 45.4 Official page mapping

- Clients → Contacts pattern
- Catering Menu → Ecommerce Product CRUD pattern
- Inventory → Ecommerce Product List + generic Table pattern
- Quotations → Invoice/document pattern
- Invoices → Invoice pattern
- Contracts → Invoice/document pattern
- Bookings → Calendar + detail pattern
- Workflows → Kanban + Calendar pattern
- Team → User Profile + Contacts pattern
- Portfolio → Gallery pattern
- Settings → Account Setting pattern
- Super Admin lists → Contacts/Table patterns
- Subscription Plans → Pricing/Table patterns
- Payments → Invoice/Table patterns
- Dashboard → Modern/Ecommerce dashboard patterns

Exact source paths and route-level mapping are defined in `UIUX_REFERENCE_V3.2_FINAL/02_PAGE_REFERENCE_MAP.md`.

## 45.5 Prohibited template reuse

Do not copy into production V3.2 as business logic:

- template mock data
- MSW handlers
- demo API layer
- ecommerce cart/checkout behavior
- invoice demo data/state model
- template contexts as domain state
- template static navigation
- demo route structure
- sample users/products/contacts/dates

## 45.6 V3.2 visual consistency standard

All CRUD pages must preserve the V3.2 UI rules:

- loading state
- empty state
- error state
- validation state
- success feedback
- permission state
- destructive confirmation
- responsive desktop/tablet/mobile behavior
- search/filter/sort/pagination where required

The template's MUI/theme/layout patterns may be adapted to satisfy these rules.

## 45.7 Catering Menu UI contract

Catering Menu is the primary reference implementation for catalog-style UI:

```text
Menu List
├── header + Add Menu
├── search/filter
├── menu card/table
│   ├── image
│   ├── name
│   ├── category
│   ├── price
│   ├── availability/status
│   └── actions
└── pagination / empty state

Menu Detail
├── gallery
├── menu information
├── pricing
├── availability/status
└── actions

Menu Form
├── general information
├── media
├── pricing
├── status
└── submit/cancel
```

Referensi utama:

- `views/apps/eCommerce/EcomProductList.tsx`
- `views/apps/eCommerce/EcommerceAddProduct.tsx`
- `views/apps/eCommerce/EcommerceEditProduct.tsx`
- `views/apps/eCommerce/EcommerceDetail.tsx`
- `components/apps/ecommerce/productAdd/Media.tsx`
- `components/apps/ecommerce/productAdd/Pricing.tsx`
- `components/apps/ecommerce/productDetail/ProductCarousel.tsx`

Semua data dan behavior tetap berasal dari V3.2 catering schema/service.

## 45.8 Coding gate

Sebelum refactor/coding feature dimulai, developer/agent wajib membaca:

1. `MASTER_PROJECT_SPEC_V3.2_FINAL.md`
2. `docs/01_WORKFLOW_V3_2_FINAL.md`
3. `docs/02_FILE_STRUCTURE_INDUSTRY_STANDARD_V3_2_FINAL.md`
4. `UIUX_REFERENCE_V3.2_FINAL/01_UIUX_AUDIT_REPORT.md`
5. `UIUX_REFERENCE_V3.2_FINAL/02_PAGE_REFERENCE_MAP.md`
6. `UIUX_REFERENCE_V3.2_FINAL/03_COMPONENT_CATALOG.md`
7. feature-specific V3.2 contract

No feature is considered ready merely because it visually resembles the template; it must also satisfy the V3.2 architecture, data, security, permission, workflow and testing contracts.


## END OF MASTER_PROJECT_SPEC_V3.2_FINAL

# V3.2 CONSISTENCY AUDIT & RESOLUTION LEDGER

## A. Findings resolved

1. **Migration semantic mismatch:** the old 001–015 package was mechanically split by source section number. Its filenames did not match their contents; for example `013_super_admin.sql` contained module seeds, while subscription/platform tables appeared inside `014_rls.sql`, and `015_seed.sql` was effectively empty. V3.2 reorders the same schema content by dependency and places all seed data in `015_seed.sql`.
2. **Quotation module gap:** the application specification contains `/quotations`, quotation CRUD/use-cases, and quotation permissions, but the V3.1 platform-module seed did not define/map a `quotations` module. V3.2 adds an explicit core `quotations` module.
3. **Booking-items contradiction:** architecture examples mentioned `booking_items`, but the database does not contain that table. V3.2 treats `booking_items` as out-of-scope and does not reference it as an implemented table.
4. **Feature architecture duplication:** the earlier structure had both feature-local repositories/services and root-level repositories/services. V3.2 rule: feature-local code is primary; root-level folders are reserved only for genuinely cross-feature shared infrastructure.
5. **ERD completeness:** the V3.1 ERD was a high-level relationship map and omitted/abstracted several tables. V3.2 ERD is generated from the SQL table/FK inventory and is the relationship reference.

## B. Explicit V3.2 non-changes

No automatic addition of booking_items, invoice_items, calendar/availability engine, supplier/purchase-order, tax engine, notification engine, chat, customer portal, or payment gateway provider. These remain change-request items.

## C. Source-of-truth contract

- Database baseline: `04_schema_v3_2_final.sql`
- Active development database: `supabase/migrations/001–015`
- Relationship: `04_erd_v3_2_final.svg`
- Workflow: `01_WORKFLOW_V3_2_FINAL.md`
- Architecture/file structure: `02_FILE_STRUCTURE_INDUSTRY_STANDARD_V3_2_FINAL.md`
- Master contract: this document

## D. Pre-coding gate

Coding starts only after: migration sequence is run successfully on a fresh Supabase database; all 47 tables, 11 enums, 7 functions, indexes, triggers, and RLS policies are present; seed data exists; quotation module is enabled/mapped; and cross-tenant + Super Admin authorization tests pass.
