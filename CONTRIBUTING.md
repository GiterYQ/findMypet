# Contributing to findMypet

## Project Direction

findMypet is a lightweight lost-pet and found-owner notice tool. The project should prioritize fast notice creation, safe anonymous management, shareable posters, and current public status pages.

Do not turn the MVP into a full social platform before the production foundation is ready.

## Good First Contribution Areas

- Improve mobile form usability.
- Add tests for existing behavior.
- Improve poster templates while keeping status, short ID, update time, and public page link clear.
- Improve docs and deployment instructions.
- Add production foundation work listed in `ROADMAP.md`.

## Local Setup

```bash
npm install
cp .env.example .env
TMPDIR=/tmp npx prisma db push
npm run dev
```

For phone testing on the same Wi-Fi:

```bash
npm run dev:mobile
```

## Required Checks Before Pull Request

Run all checks before opening a PR:

```bash
npm run lint
npm test
npm run build
```

If a check cannot be run, explain why in the PR.

## Engineering Rules

- Every business file must start with a header comment explaining purpose, linked files, and layer.
- Keep independent features in separate commits.
- Use `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, or `chore:` commit prefixes.
- Do not remove existing tests unless the behavior is intentionally changed.
- Store money in minor units such as cents.
- Keep `updatedAt` and `lastRefreshedAt` semantics separate.
- Do not bypass the status machine with generic patch logic.
- User-facing copy should move toward `t(key, fallback)` instead of hardcoded component strings.

## Pull Request Scope

Keep PRs small and reviewable:

- One feature or bug fix per PR.
- Include tests for behavior changes.
- Include screenshots or screen recordings for UI changes.
- Update README, ROADMAP, or related docs when behavior changes.

## Security And Abuse

This project handles public images, contact information, location information, and rewards. Treat abuse prevention as product work, not optional infrastructure.

Do not submit PRs that:

- expose manage tokens
- weaken upload validation
- publish private owner fields in public payloads
- remove anti-scam messaging
- add AI output that bypasses user confirmation

Report security issues through `SECURITY.md` instead of public issues.
