# Security Policy

## Supported versions

This repository currently supports the `main` branch only.

## Reporting a vulnerability

Please do not open a public issue for sensitive security reports.

Email the maintainer using the public contact method listed on the GitHub
profile, or open a private GitHub security advisory if repository permissions
allow it. Include:

- A short description of the issue.
- Steps to reproduce it.
- The potential impact.
- Any suggested mitigation.

The maintainer will acknowledge valid reports as soon as possible and coordinate
a fix before public disclosure.

## Secrets and test data

Never commit `.env` files, API keys, database dumps, access tokens, or private
certificates. Use `.env.example` for safe placeholders.
