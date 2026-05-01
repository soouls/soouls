# Domain Documentation

## Layout

This repository uses a multi-context layout for domain documentation:

- `CONTEXT-MAP.md` at the repository root maps to separate `CONTEXT.md` files for each context (e.g., frontend, backend, admin).
- Architectural Decision Records (ADRs) are located in `docs/adr/` or `src/<context>/docs/adr/`.

## Usage

- Before making architectural changes, review the relevant `CONTEXT.md` file and ADRs for guidance.
- Update the ADRs after implementing architecture-impacting changes to ensure historical context and rationale are preserved.