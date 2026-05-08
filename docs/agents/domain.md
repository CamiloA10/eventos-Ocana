# Domain Documentation

This repository uses a **single-context** layout for domain documentation.

## Sources

- **Primary Context**: `CONTEXT.md` at the repository root. This file defines the "Ubiquitous Language" and core domain models.
- **Architectural Decisions**: `docs/adr/*.md`. These files record past architectural choices and their rationale.

## Rules for Agents

1. **Read First**: Always read `CONTEXT.md` before proposing or implementing changes.
2. **Update**: Use `grill-with-docs` to sharpen terminology and keep these documents in sync with the implementation.
3. **Consistency**: Use the terms defined in `CONTEXT.md` in code, PRDs, and issues.
