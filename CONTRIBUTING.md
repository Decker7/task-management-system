# Contributing

Thanks for helping improve Task Management System. This project is a small
full-stack reference app with a Laravel API and a Next.js frontend.

## Local setup

1. Install backend dependencies:

   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   ```

2. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

3. Run the checks before opening a pull request:

   ```bash
   cd ../backend
   php artisan test

   cd ../frontend
   npm run lint
   npm run build
   npm audit --audit-level=moderate
   ```

## Pull request guidelines

- Keep pull requests focused on one fix or improvement.
- Include tests when changing backend API behavior.
- Update documentation when setup, commands, routes, or user-facing behavior changes.
- Do not commit `.env`, credentials, database files, logs, or generated dependency folders.

## Issue guidelines

For bug reports, include:

- What you expected to happen.
- What actually happened.
- Steps to reproduce the issue.
- Relevant command output or screenshots, with secrets removed.
