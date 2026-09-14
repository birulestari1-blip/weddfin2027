# AI Studio — First Prompt

You are taking over an existing project defined by V3.2 specifications.

Before coding anything:

1. Read `.ai/AI_STUDIO_RULES.md` completely.
2. Read `docs/MASTER_PROJECT_SPEC_V3.2_FINAL.md`.
3. Read `docs/WORKFLOW_V3.2_FINAL.md`.
4. Read `docs/FILE_STRUCTURE_INDUSTRY_STANDARD_V3.2_FINAL.md`.
5. Read the UI/UX reference README, page mapping, and component catalog.
6. Inspect `supabase/migrations/` and understand the dependency order.
7. Inspect the existing source tree and determine what is already implemented.

Then produce an implementation audit only. Do NOT make broad code changes yet.

Your audit must report:

- current stack and entry points
- current routes
- current components
- current data-access pattern
- current Supabase integration
- current auth/tenant handling
- current permission handling
- current gaps against V3.2
- current gaps against the official UI/UX mapping
- files that can be reused
- files that should be refactored
- files that should not be copied from the UI template
- database changes that would be required, if any
- risks and blockers

End with a phased implementation plan. Preserve V3.2 contracts. Do not invent missing requirements.
