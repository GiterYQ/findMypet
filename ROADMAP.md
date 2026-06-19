# findMypet Roadmap

## Purpose

This roadmap turns the current MVP into an open, production-ready lost-pet notice tool.

The project should stay focused on high-completion utility work:

- create a notice quickly
- produce shareable posters and copy
- keep public pages current after posters spread
- make anonymous management safe enough for real users

It should not become a full social platform too early.

## Current Stage

Status: local/demo-ready MVP.

What works today:

- anonymous notice creation
- browser draft autosave
- hosted public share page
- manage link with token authorization
- status, refresh, reopen, report flows
- five poster templates
- mobile-first step flow
- public list with basic filters
- local SQLite and local image upload storage

What is not production-ready yet:

- storage is local
- database is SQLite
- upload moderation is not integrated
- rate limiting is missing
- reverse geocoding uses a low-frequency public fallback
- most UI copy is still hardcoded Chinese

## P0: Open Source And Production Foundation

Goal: make the repository safe and clear enough for outside contributors and small public trials.

Tasks:

- Add and maintain open-source community files: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates, and PR template.
- Move production database from SQLite to PostgreSQL.
- Move image storage from `public/uploads` to object storage such as S3, R2, OSS, or COS.
- Add API rate limiting for create, upload, report, refresh, status, and reopen endpoints.
- Add upload moderation for pornographic, violent, abusive, or illegal images before public display.
- Add key Prisma indexes for list queries, moderation queries, owner email lookup, and region filtering.
- Lock status transition rules at the service layer so `ACTIVE` restoration must go through `reopen`.
- Configure HTTPS deployment, `APP_BASE_URL`, cron secret, database URL, object storage credentials, and mail provider.
- Configure scheduled calls to `/api/cron/notices/activity`.

Exit criteria:

- `npm run lint`, `npm test`, and `npm run build` pass in CI.
- A fresh contributor can run the app from README instructions.
- Public upload endpoints have at least basic abuse protection.
- The public list query remains indexed for growing data.

## P1: Publishing Success

Goal: reduce friction for people creating a notice under stress.

Tasks:

- Improve location capture with a map picker or provider-specific reverse geocoding for production.
- Add a manual address fallback for non-China regions.
- Expand pet types and allow user-defined labels without breaking filtering.
- Add AI-assisted photo feature suggestions as opt-in draft values only.
- Add manage-link resend through owner notification email.
- Split `NoticeForm.tsx` into smaller focused components without changing payload semantics.
- Move high-frequency UI copy behind `t(key, fallback)` to support English and future languages.

Exit criteria:

- A user can create a usable notice on mobile within 1-2 minutes.
- Location failure never blocks manual publishing.
- AI suggestions are always editable and never submitted without user confirmation.

## P2: Sharing And Poster Quality

Goal: make generated output more effective in WeChat groups, communities, and printed scenes.

Tasks:

- Add QR code or short link on every poster.
- Add template thumbnails in the creation flow.
- Add a recovered/closed poster state to stop old posters from spreading.
- Improve default share copy for WeChat, WhatsApp, Telegram, and email.
- Add more real-world poster templates based on rescue volunteer feedback.
- Add template-level regression screenshots or visual checks.

Exit criteria:

- Every generated poster clearly shows status, short ID, update time, and public page link.
- A stale poster still leads viewers to the latest share page state.

## P3: Lightweight Collaboration

Goal: support rescue helpers without building a full social network.

Tasks:

- Add collaborator invite links with refresh-only permission.
- Add simple report review workflow for hidden/downranked notices.
- Add admin moderation screen for reports and uploads.
- Add regional public pages.
- Add analytics events for create start, create success, poster open, poster download, share copy, refresh, recovered, and report.
- Add data export for rescue organizations.

Exit criteria:

- Helpers can assist with freshness without editing owner data.
- Moderation can react to abuse without direct database access.

## P4: Platform Expansion

Goal: expand only after the lightweight tool is stable.

Tasks:

- Add public API documentation.
- Add optional login binding without removing anonymous manage links.
- Add site-level statistics dashboard.
- Explore WeChat official account menu integration.
- Explore mini program only if H5 usage proves real demand.

## Non-Goals For Now

- Full social feed.
- In-app private messaging.
- Paid marketplace or transaction handling.
- Poster drag-and-drop editor.
- Automatic AI publishing without human confirmation.
- Complex recommendation algorithm before abuse controls exist.

