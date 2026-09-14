# COMPONENT CATALOG — APPROVED REFERENCE PATTERNS

## A. Shell / layout

| Pattern | Source |
|---|---|
| Page container | `components/container/PageContainer.tsx` |
| Shared card | `components/shared/AppCard.tsx` |
| Base card | `components/shared/BaseCard.tsx` |
| Blank card | `components/shared/BlankCard.tsx` |
| Breadcrumb | `layouts/full/shared/breadcrumb/Breadcrumb.tsx` |
| Full shell | `layouts/full/FullLayout.tsx` |
| Vertical sidebar | `layouts/full/vertical/sidebar/Sidebar.tsx` |
| Sidebar navigation | `layouts/full/vertical/sidebar/SidebarItems.tsx` |
| Vertical header | `layouts/full/vertical/header/Header.tsx` |
| Horizontal navigation | `layouts/full/horizontal/navbar/Navigation.tsx` |
| Logo | `layouts/full/shared/logo/Logo.tsx` |
| Scroll container | `components/custom-scroll/Scrollbar.tsx` |

## B. Dashboard

- `components/dashboards/modern/TopCards.tsx`
- `components/dashboards/modern/RevenueUpdates.tsx`
- `components/dashboards/modern/YearlyBreakup.tsx`
- `components/dashboards/modern/MonthlyEarnings.tsx`
- `components/dashboards/modern/TopPerformers.tsx`
- `components/dashboards/modern/SellingProducts.tsx`
- `components/dashboards/ecommerce/RecentTransactions.tsx`
- `components/dashboards/ecommerce/SalesOverview.tsx`
- `components/dashboards/ecommerce/WelcomeCard.tsx`

Use as presentation patterns for V3.2 KPIs, recent activity, revenue and operational summaries.

## C. Table / data list

- `views/tables/SearchTable.tsx`
- `views/tables/EnhanceTable.tsx`
- `views/tables/PaginationTable.tsx`
- `views/tables/FixedHeaderTable.tsx`
- `views/tables/CollapsibleTable.tsx`
- `components/tables/Table1.tsx`
- `components/tables/Table2.tsx`
- `components/tables/Table3.tsx`
- `components/tables/Table4.tsx`
- `components/tables/Table5.tsx`
- `components/apps/ecommerce/ProductTableList/ProductTableList.tsx`
- `components/apps/invoice/Invoice-list/index.tsx`

## D. Client / contact

- `views/apps/contacts/Contacts.tsx`
- `components/apps/contacts/ContactList.tsx`
- `components/apps/contacts/ContactListItem.tsx`
- `components/apps/contacts/ContactDetails.tsx`
- `components/apps/contacts/ContactAdd.tsx`
- `components/apps/contacts/ContactSearch.tsx`
- `components/apps/contacts/ContactFilter.tsx`

## E. Forms

High-value form references:

- `views/forms/FormLayouts.tsx`
- `views/forms/FormHorizontal.tsx`
- `views/forms/FormVertical.tsx`
- `views/forms/FormCustom.tsx`
- `views/forms/FormValidation.tsx`
- `views/forms/FormWizard.tsx`
- `components/forms/theme-elements/CustomTextField.tsx`
- `components/forms/theme-elements/CustomFormLabel.tsx`
- `components/forms/theme-elements/CustomSelect.tsx`
- `components/forms/theme-elements/CustomCheckbox.tsx`
- `components/forms/theme-elements/CustomSwitch.tsx`
- `components/forms/form-elements/autoComplete/MultipleValuesAutocomplete.tsx`
- `components/forms/form-elements/autoComplete/ComboBoxAutocomplete.tsx`
- `components/forms/form-elements/date-time/BasicDateTime.tsx`
- `components/forms/form-elements/date-time/DifferentDateTime.tsx`

## F. Dialog / Drawer / interaction

- `views/ui-components/MuiDialog.tsx`
- `views/apps/contacts/Contacts.tsx`
- `components/apps/contacts/ContactAdd.tsx`
- `components/apps/kanban/TaskModal/AddNewTaskModal.tsx`
- `components/apps/kanban/TaskModal/EditTaskModal.tsx`
- `components/apps/kanban/TaskModal/EditCategoryModal.tsx`
- `components/apps/ecommerce/productGrid/ProductSidebar.tsx`
- `components/apps/notes/NoteSidebar.tsx`
- `components/shared/ThreeColumn.tsx`

## G. Catalog / menu / media

- `views/apps/eCommerce/EcomProductList.tsx`
- `views/apps/eCommerce/EcommerceAddProduct.tsx`
- `views/apps/eCommerce/EcommerceEditProduct.tsx`
- `views/apps/eCommerce/EcommerceDetail.tsx`
- `components/apps/ecommerce/ProductTableList/ProductTableList.tsx`
- `components/apps/ecommerce/productGrid/ProductList.tsx`
- `components/apps/ecommerce/productGrid/ProductSearch.tsx`
- `components/apps/ecommerce/productGrid/ProductFilter.tsx`
- `components/apps/ecommerce/productGrid/ProductSidebar.tsx`
- `components/apps/ecommerce/productAdd/GeneralCard.tsx`
- `components/apps/ecommerce/productAdd/Media.tsx`
- `components/apps/ecommerce/productAdd/Pricing.tsx`
- `components/apps/ecommerce/productAdd/ProductDetails.tsx`
- `components/apps/ecommerce/productAdd/Status.tsx`
- `components/apps/ecommerce/productAdd/Thumbnail.tsx`
- `components/apps/ecommerce/productDetail/ProductCarousel.tsx`
- `components/apps/ecommerce/productDetail/ProductDesc.tsx`
- `components/apps/ecommerce/productDetail/ProductRelated.tsx`

## H. Invoice / document

- `views/apps/invoice/List.tsx`
- `views/apps/invoice/Create.tsx`
- `views/apps/invoice/Detail.tsx`
- `views/apps/invoice/Edit.tsx`
- `components/apps/invoice/Invoice-list/index.tsx`
- `components/apps/invoice/Add-invoice/index.tsx`
- `components/apps/invoice/Invoice-detail/index.tsx`
- `components/apps/invoice/Edit-invoice/index.tsx`

## I. Calendar / workflow

- `views/apps/calendar/BigCalendar.tsx`
- `views/apps/calendar/EventData.ts`
- `views/apps/kanban/Kanban.tsx`
- `components/apps/kanban/KanbanHeader.tsx`
- `components/apps/kanban/CategoryTaskList.tsx`
- `components/apps/kanban/TaskManager.tsx`
- `components/apps/kanban/TaskModal/AddNewTaskModal.tsx`
- `components/apps/kanban/TaskModal/EditTaskModal.tsx`

## J. Team / profile / gallery

- `views/apps/user-profile/UserProfile.tsx`
- `views/apps/user-profile/Gallery.tsx`
- `components/apps/userprofile/profile/ProfileBanner.tsx`
- `components/apps/userprofile/profile/ProfileTab.tsx`
- `components/apps/userprofile/profile/IntroCard.tsx`
- `components/apps/userprofile/gallery/GalleryCard.tsx`

## K. Settings

- `views/pages/account-setting/AccountSetting.tsx`
- `components/pages/account-setting/AccountTab.tsx`
- `components/pages/account-setting/SecurityTab.tsx`
- `components/pages/account-setting/NotificationTab.tsx`
- `components/pages/account-setting/BillsTab.tsx`

## L. Feedback / loading

The source includes Alert, Snackbar/Dialog, Skeleton and spinner patterns. Useful references include:

- `views/ui-components/MuiAlert.tsx`
- `views/ui-components/MuiDialog.tsx`
- `components/widgets/banners/Banner1.tsx` through `Banner5.tsx`
- `components/widgets/banners/code/NotificationCode.tsx`
- `components/widgets/banners/code/ErrorBannerCode.tsx`
- `components/widgets/banners/code/EmptyCartCode.tsx`
- `components/apps/ecommerce/productGrid/ProductList.tsx` (Skeleton/empty-oriented card behavior)
- `views/spinner/Spinner.tsx`

V3.2 must standardize these into its own feedback primitives.

## M. Theme primitives

- `theme/Theme.tsx`
- `theme/Components.tsx`
- `theme/Typography.tsx`
- `theme/Shadows.tsx`
- `theme/DefaultColors.tsx`
- `theme/LightThemeColors.tsx`
- `theme/DarkThemeColors.tsx`
- `context/CustomizerContext.tsx` — reference for configurability only; do not couple V3.2 domain behavior to it.

## N. Charts

The source contains multiple chart examples under:

- `views/charts/*`
- `views/muicharts/*`
- `components/charts/*`
- `components/muicharts/*`
- `components/widgets/charts/*`

Use the chart type that matches the V3.2 KPI/analytics requirement; chart demo data and business semantics must be replaced by V3.2 data sources.
