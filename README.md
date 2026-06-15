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

If email is not configured or delivery fails, notice creation still succeeds. Users should copy the manage link or recover it from the local `/mine` page on the same browser.

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
