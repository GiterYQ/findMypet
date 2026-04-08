# Engineering Conventions

## Scope

These rules are mandatory for the `findMypet` codebase.

## File headers

Every business file must begin with a short header comment that states:

- the file purpose
- the core responsibility
- the linked files or modules
- the layer, such as page, component, schema, service, repository, mapper

## Naming

- Types, enums, schemas, and classes use `PascalCase`
- Properties, variables, and methods use `camelCase`
- File names use role-based suffixes such as `notice.service.ts` and `notice.schema.ts`

## Comments

Comments are required for high-value business logic:

- state transitions
- token authorization
- moderation changes
- ranking and anti-abuse calculations
- JSONB to derived-column synchronization
- `updatedAt` versus `lastRefreshedAt`

Avoid line-by-line narration of obvious code.

## Localization

- UI and system copy must go through `t(key, fallback)`
- keys must remain stable
- do not concatenate user-facing strings in components

## Data rules

- monetary values are stored in minor units such as cents
- database timestamps are stored in UTC
- lost-time input retains timezone metadata
- JSON payloads must be validated before persistence

## Git

- each independent feature must be committed separately
- use commit prefixes such as `feat:`, `fix:`, `refactor:`, `chore:`
- keep commits rollback-safe

