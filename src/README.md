# Source Architecture

Feature ownership is local to `src/features/<feature>/`.

```text
src/features/<feature>/
├── components/    # feature UI
├── hooks/         # feature hooks/state adapters
├── services/      # application/business use cases
├── repositories/  # feature data access
├── schemas/       # validation schemas
└── types/         # feature domain types
```

Global `src/services` and `src/repositories` are reserved for genuinely cross-feature infrastructure. Avoid duplicate ownership.
