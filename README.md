# findMypet

A lightweight global lost-pet notice tool built with Next.js and Prisma.

## Local setup

1. Copy `.env.example` to `.env`
2. Run `npm install`
3. Run `TMPDIR=/tmp npx prisma db push`
4. Run `npm run dev`

## Current MVP slice

- Anonymous notice creation
- Hosted share page and owner manage URL
- Prisma schema with notice state machine
- Public/admin payload split
- Risk-based priority scoring
- Report and moderation downrank/hide flow

## Verification

- `npm run lint`
- `npm run build`
