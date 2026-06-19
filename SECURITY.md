# Security Policy

## Supported Versions

The current `main` branch is the only supported development line.

## Reporting A Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

If GitHub private vulnerability reporting is enabled for the repository, use it. Otherwise, contact the repository owner privately and include:

- affected route or feature
- impact
- reproduction steps
- whether user data, manage tokens, uploaded images, or location data can be exposed
- suggested mitigation if known

Avoid sharing working exploit code publicly.

## Security-Sensitive Areas

Please be careful around:

- anonymous manage token generation and verification
- public/admin payload separation
- image upload validation and storage
- report and moderation thresholds
- contact method masking
- location precision and map links
- status transitions and reopen behavior
- future AI feature extraction

## Current Known Gaps

The MVP is not production-hardened yet. Known gaps include:

- no production rate limiting
- no integrated image content moderation
- local filesystem upload storage
- SQLite database for local MVP
- public reverse geocoding fallback not suitable for high traffic

These are tracked in `ROADMAP.md`.
