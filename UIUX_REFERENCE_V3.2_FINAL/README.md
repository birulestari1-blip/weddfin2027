# UIUX_REFERENCE_V3.2_FINAL

## Status
**Official UI/UX reference for MASTER_PROJECT_SPEC_V3.2_FINAL.**

## Source audited
- Archive: `src.rar`
- Archive entries: **1366**
- Files: **1033**
- Directories: **333**
- SHA-256: `93813049b23a76cbfd0c73390002e5413b272fa8550d23aaca1d3454e0204dab`
- Source type: React + TypeScript UI template/reference source.

## Scope
This package defines how the `src.rar` template is used by V3.2: **visual and interaction reference only**. It does not replace V3.2 database schema, tenant/RLS rules, permissions, services, repositories, business workflows, or domain models.

## Package
- `SOURCE/src.rar` — original audited source archive.
- `SOURCE_INVENTORY.csv` — complete file inventory.
- `AUDIT_DATA.json` — audit metrics and pattern counts.
- `01_UIUX_AUDIT_REPORT.md` — audit findings and source-of-truth rules.
- `02_PAGE_REFERENCE_MAP.md` — V3.2 route-to-template mapping.
- `03_COMPONENT_CATALOG.md` — reusable component/pattern catalog.
- `04_IMPLEMENTATION_PROMPT.md` — prompt/contract for coding agents.

## Source-of-truth hierarchy
1. V3.2 database schema and migrations
2. V3.2 business/domain/service/repository contracts
3. V3.2 permissions, tenant isolation and RLS
4. V3.2 workflow definitions
5. **This UI/UX reference package** for visual/interaction patterns
6. Existing template implementation details only when they do not conflict with 1–5

## Non-goals
Do not copy template mock data, MSW handlers, ecommerce business rules, invoice business rules, demo routes, demo navigation, or template contexts into production domain logic.
