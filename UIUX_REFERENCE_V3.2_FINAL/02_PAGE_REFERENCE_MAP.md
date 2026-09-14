# V3.2 PAGE → UI/UX REFERENCE MAP

## Mapping rule

The left side is the **V3.2 product requirement**. The right side is the **visual/interaction reference only**. The V3.2 route, domain data, permission and business logic remain authoritative.

| V3.2 route | Primary source reference | Secondary reference | Adaptation |
|---|---|---|---|
| `/login` | `views/authentication/auth1/Login.tsx` | `views/authentication/auth2/Login2.tsx` | V3.2 auth only |
| `/register` | `views/authentication/auth1/Register.tsx` | `views/authentication/auth2/Register2.tsx` | V3.2 onboarding/auth only |
| `/forgot-password` | `views/authentication/auth1/ForgotPassword.tsx` | `views/authentication/auth2/ForgotPassword2.tsx` | V3.2 auth only |
| `/dashboard` | `views/dashboard/Modern.tsx` | `views/dashboard/Ecommerce.tsx` | KPI/dashboard composition |
| `/clients` | `views/apps/contacts/Contacts.tsx` | `components/apps/contacts/*` | client list/filter/detail/create |
| `/services` | `views/apps/eCommerce/EcomProductList.tsx` | `views/tables/SearchTable.tsx` | catalog/table pattern, not ecommerce logic |
| `/quotations` | `views/apps/invoice/List.tsx` | `views/apps/invoice/Detail.tsx`, `Create.tsx`, `Edit.tsx` | quotation document/list pattern |
| `/bookings` | `views/apps/calendar/BigCalendar.tsx` | `views/apps/contacts/Contacts.tsx` | schedule + booking detail |
| `/team` | `views/apps/user-profile/UserProfile.tsx` | `views/apps/contacts/Contacts.tsx` | member/profile management |
| `/finance` | `views/dashboard/Ecommerce.tsx` | `views/tables/*` | KPI + finance tables |
| `/invoices` | `views/apps/invoice/List.tsx` | `Detail.tsx`, `Create.tsx`, `Edit.tsx` | direct invoice reference |
| `/contracts` | `views/apps/invoice/Detail.tsx` | `views/apps/invoice/Create.tsx`, `Edit.tsx` | document layout only |
| `/portfolio` | `views/apps/user-profile/Gallery.tsx` | `components/apps/userprofile/gallery/GalleryCard.tsx` | gallery/card presentation |
| `/inventory` | `views/apps/eCommerce/EcomProductList.tsx` | `views/tables/EnhanceTable.tsx`, `PaginationTable.tsx` | inventory table/filter/status |
| `/workflows` | `views/apps/kanban/Kanban.tsx` | `views/apps/calendar/BigCalendar.tsx` | stage board + schedule |
| `/settings` | `views/pages/account-setting/AccountSetting.tsx` | account-setting components | settings tabs |
| `/catering/menu` | `views/apps/eCommerce/EcomProductList.tsx` | `views/apps/eCommerce/Ecommerce.tsx`, `components/apps/ecommerce/productGrid/*` | menu catalog |
| `/catering/menu/[id]` | `views/apps/eCommerce/EcommerceDetail.tsx` | `components/apps/ecommerce/productDetail/*` | menu detail/gallery |
| `/catering/recipes` | `views/tables/EnhanceTable.tsx` | `views/forms/FormLayouts.tsx` | recipe CRUD |
| `/photography/equipment` | `views/apps/eCommerce/EcomProductList.tsx` | `views/apps/eCommerce/EcommerceAddProduct.tsx`, `EcommerceEditProduct.tsx` | equipment catalog CRUD |
| `/photography/bookings/[bookingId]` | `views/apps/calendar/BigCalendar.tsx` | `views/apps/invoice/Detail.tsx` | booking detail/schedule |
| `/dekorasi/themes` | `views/apps/eCommerce/EcomProductList.tsx` | `EcommerceDetail.tsx` | theme catalog |
| `/dekorasi/items` | `views/apps/eCommerce/EcomProductList.tsx` | `views/tables/EnhanceTable.tsx` | item catalog/inventory-like table |
| `/mua/artists` | `views/apps/contacts/Contacts.tsx` | `views/apps/user-profile/UserProfile.tsx` | artist/member cards and detail |
| `/mua/packages` | `views/apps/eCommerce/EcomProductList.tsx` | `EcommerceDetail.tsx` | package catalog |
| `/wedding-organizer/rundowns` | `views/apps/kanban/Kanban.tsx` | `views/apps/calendar/BigCalendar.tsx` | rundown board + scheduling |
| `/wedding-organizer/rundowns/[id]` | `views/apps/calendar/BigCalendar.tsx` | `views/apps/kanban/Kanban.tsx` | rundown detail/schedule |
| `/super-admin` | `views/dashboard/Modern.tsx` | `views/dashboard/Ecommerce.tsx` | platform KPI dashboard |
| `/super-admin/vendors` | `views/apps/contacts/Contacts.tsx` | `views/tables/SearchTable.tsx` | vendor list/filter/detail |
| `/super-admin/vendor-categories` | `views/tables/EnhanceTable.tsx` | `views/forms/FormLayouts.tsx` | taxonomy CRUD |
| `/super-admin/subscriptions` | `views/tables/EnhanceTable.tsx` | `views/apps/invoice/List.tsx` | subscription list/status |
| `/super-admin/subscription-plans` | `views/pages/pricing/Pricing.tsx` | `views/tables/EnhanceTable.tsx` | plan cards + CRUD table |
| `/super-admin/payments` | `views/apps/invoice/List.tsx` | `views/apps/invoice/Detail.tsx` | payment list/detail |
| `/super-admin/audit-logs` | `views/tables/EnhanceTable.tsx` | `views/tables/CollapsibleTable.tsx` | log table/detail |
| `/super-admin/platform-settings` | `views/pages/account-setting/AccountSetting.tsx` | `views/forms/FormLayouts.tsx` | platform settings |
| `/super-admin/admins` | `views/apps/contacts/Contacts.tsx` | `views/apps/user-profile/UserProfile.tsx` | admin list/profile |

## Generic CRUD page composition

For V3.2 list pages, prefer this visual composition:

```text
PageContainer
└── Breadcrumb / page title
    └── AppCard / BlankCard
        ├── Header
        │   ├── title
        │   ├── description
        │   └── primary action
        ├── Toolbar
        │   ├── search
        │   ├── filters
        │   └── actions
        ├── Table / Grid
        │   ├── status
        │   ├── row actions
        │   └── pagination
        └── Detail / Dialog / Drawer
```

## Catering Menu composition

```text
Menu List
├── Header: Menu + Add Menu
├── Search
├── Category / availability filters
├── List/Grid toggle if appropriate
├── Menu cards or table
│   ├── image
│   ├── name
│   ├── category
│   ├── price
│   ├── status/availability
│   └── actions
└── pagination / empty state

Menu Detail
├── gallery / thumbnail
├── menu information
├── pricing
├── availability/status
├── description
└── edit/archive actions

Menu Form
├── general information
├── media
├── pricing
├── status
└── submit/cancel
```

Primary source paths:

- `views/apps/eCommerce/EcomProductList.tsx`
- `views/apps/eCommerce/EcommerceAddProduct.tsx`
- `views/apps/eCommerce/EcommerceEditProduct.tsx`
- `views/apps/eCommerce/EcommerceDetail.tsx`
- `components/apps/ecommerce/productAdd/GeneralCard.tsx`
- `components/apps/ecommerce/productAdd/Media.tsx`
- `components/apps/ecommerce/productAdd/Pricing.tsx`
- `components/apps/ecommerce/productAdd/Status.tsx`
- `components/apps/ecommerce/productDetail/ProductCarousel.tsx`
- `components/apps/ecommerce/productDetail/ProductDesc.tsx`

## Inventory composition

Use the table/list pattern, not the ecommerce checkout/cart pattern.

```text
Inventory
├── Header + Add Item
├── Search/filter
├── Stock status
├── Data table
│   ├── item
│   ├── category
│   ├── quantity
│   ├── unit
│   ├── status
│   └── actions
├── Pagination
└── Item detail / movement dialog
```

## Quotation composition

Use invoice document presentation but implement V3.2 quotation semantics.

```text
Quotation List
└── filters + status + search + actions

Quotation Detail
├── vendor/client header
├── quotation metadata
├── item snapshot
├── totals
├── status
└── actions

Quotation Form
├── client
├── validity/date fields
├── items
├── notes/terms
└── save/send/convert actions
```

## Workflow / rundown composition

```text
Board / Calendar
├── stage or date navigation
├── cards/events
├── status indicator
├── detail panel
└── permitted transition actions
```

The template only supplies visual interaction patterns. V3.2 service/use-case logic controls which transitions are allowed.
