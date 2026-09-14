# SOURCE COVERAGE MATRIX

## Complete inventory coverage

The audit enumerated every archive file. The complete path-level inventory is in `SOURCE_INVENTORY.csv`.

### Top-level coverage

| Directory / file group | Files | Audit role |
|---|---:|---|
| `components` | 602 | Reusable UI components and feature patterns |
| `assets` | 210 | Visual assets and demo images |
| `views` | 124 | Reference pages/screens |
| `layouts` | 36 | Application shell, navigation, header/sidebar, shared layout |
| `api` | 15 | Mock/demo data and handlers; reference-only |
| `types` | 14 | Template/demo TypeScript types; reference-only |
| `context` | 12 | Template/demo state contexts; reference-only |
| `theme` | 8 | Visual theme primitives and MUI overrides |
| `utils` | 5 | Localization and utility support |
| `App.css` | 1 | Template styles |
| `App.tsx` | 1 | Template root app composition |
| `LoadingBar.tsx` | 1 | Loading indicator pattern |
| `index.css` | 1 | Template global styles |
| `main.tsx` | 1 | Template entrypoint |
| `routes` | 1 | Template demo routing; reference-only |
| `vite-env.d.ts` | 1 | Vite typing |

## Second-level coverage

- `api/blog/` — 1 files
- `api/chat/` — 1 files
- `api/contacts/` — 1 files
- `api/eCommerce/` — 1 files
- `api/email/` — 1 files
- `api/globalFetcher.ts/` — 1 files
- `api/invoice/` — 1 files
- `api/kanban/` — 1 files
- `api/language/` — 1 files
- `api/mocks/` — 2 files
- `api/notes/` — 1 files
- `api/ticket/` — 1 files
- `api/userprofile/` — 2 files
- `assets/images/` — 209 files
- `assets/react.svg/` — 1 files
- `components/apps/` — 88 files
- `components/charts/` — 9 files
- `components/container/` — 1 files
- `components/custom-scroll/` — 1 files
- `components/dashboards/` — 24 files
- `components/forms/` — 165 files
- `components/frontend-pages/` — 41 files
- `components/landingpage/` — 20 files
- `components/material-ui/` — 84 files
- `components/muicharts/` — 74 files
- `components/muitrees/` — 20 files
- `components/pages/` — 6 files
- `components/react-tables/` — 16 files
- `components/shared/` — 12 files
- `components/tables/` — 7 files
- `components/widgets/` — 34 files
- `context/BlogContext/` — 1 files
- `context/ChatContext/` — 1 files
- `context/ConatactContext/` — 1 files
- `context/CustomizerContext.tsx/` — 1 files
- `context/EcommerceContext/` — 1 files
- `context/EmailContext/` — 1 files
- `context/InvoiceContext/` — 1 files
- `context/NotesContext/` — 1 files
- `context/TicketContext/` — 1 files
- `context/UserDataContext/` — 1 files
- `context/config.ts/` — 1 files
- `context/kanbancontext/` — 1 files
- `layouts/blank/` — 1 files
- `layouts/full/` — 35 files
- `routes/Router.tsx/` — 1 files
- `theme/Components.tsx/` — 1 files
- `theme/DarkThemeColors.tsx/` — 1 files
- `theme/DefaultColors.tsx/` — 1 files
- `theme/LightThemeColors.tsx/` — 1 files
- `theme/Shadows.tsx/` — 1 files
- `theme/Theme.tsx/` — 1 files
- `theme/ThemeColors.tsx/` — 1 files
- `theme/Typography.tsx/` — 1 files
- `types/apps/` — 12 files
- `types/auth/` — 1 files
- `types/layout/` — 1 files
- `utils/i18n.ts/` — 1 files
- `utils/languages/` — 4 files
- `views/apps/` — 25 files
- `views/authentication/` — 15 files
- `views/charts/` — 7 files
- `views/dashboard/` — 2 files
- `views/forms/` — 16 files
- `views/mui-trees/` — 5 files
- `views/muicharts/` — 7 files
- `views/pages/` — 12 files
- `views/react-tables/` — 12 files
- `views/spinner/` — 2 files
- `views/tables/` — 6 files
- `views/ui-components/` — 12 files
- `views/widgets/` — 3 files

## Structural findings

- No package.json at archive root; dependency versions cannot be treated as authoritative from this source alone.
- No app/ directory; this is not the V3.2 application structure.
- No pages/ directory at root; routing is handled under routes/Router.tsx in the template.
- Template contains mock/demo API and Context layers under api/ and context/.
- Template contains static demo navigation under layouts/full/*/sidebar/MenuItems.ts and layouts/full/horizontal/navbar/Menudata.ts.
- Some code-example files import aliases such as @/store and @/app that are not present at the archive root; those examples are not a production architecture contract.

## Dependency signals found in source

The source imports major UI libraries including Material UI, Tabler Icons, MUI charts/date pickers/tree view, ApexCharts, React Table, Formik/Yup, React Big Calendar, React Dropzone, DnD libraries, SWR and MSW. These are **observed dependencies**, not a V3.2 dependency mandate.

## Audit interpretation

The archive is broad enough to serve as a visual system reference, but it is not a drop-in V3.2 application. V3.2 must selectively adapt patterns rather than merge the entire archive into the production codebase.
