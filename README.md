# findMypet

A lightweight global lost-pet notice tool built with Next.js and Prisma.

## Local setup

1. Copy `.env.example` to `.env`
2. Run `npm install`
3. Run `TMPDIR=/tmp npx prisma db push`
4. Run `npm run dev`

## Environment

- `DATABASE_URL`: local SQLite or production database URL
- `APP_BASE_URL`: public site origin used when generating share and manage links
- `RESEND_API_KEY`: optional Resend API key for owner manage-link emails
- `RESEND_FROM_EMAIL`: optional sender address for manage-link emails
- `CRON_SECRET`: secret for `/api/cron/notices/activity` when running scheduled stale/archive maintenance

If email is not configured or delivery fails, notice creation still succeeds. Users should copy the manage link or recover it from the local `/mine` page on the same browser.

## Operations

- Run `GET /api/cron/notices/activity` or `POST /api/cron/notices/activity` on a schedule to move old active notices from `fresh` to `stale` and then `archived`.
- In production, call the cron endpoint with `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
- Without `CRON_SECRET`, the cron endpoint is only allowed outside production.

## Current MVP slice

- Anonymous notice creation
- Hosted share page and owner manage URL
- Local `/mine` page for anonymous manage-link recovery
- Prisma schema with notice state machine
- Public/admin payload split
- Risk-based priority scoring
- Report and moderation downrank/hide flow

## Verification

- `npm test`
- `npm run lint`
- `npm run build`
