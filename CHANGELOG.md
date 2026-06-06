# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog, and this project uses semantic versioning
once formal releases begin.

## Unreleased

### Added

- Added open-source maintenance files for contributing, conduct, security, issue
  templates, pull request review, and CI.
- Documented seeded demo credentials and added backend coverage for demo data.
- Added a real screenshot of the seeded task board to the README.

### Fixed

- Added a test-only Laravel app key so backend tests can run in clean checkouts.
- Fixed frontend lint and typecheck failures in the auth provider and task form.
- Fixed auth hydration mismatch by loading stored tokens only after mount.

### Security

- Updated frontend dependency guidance and audit checks for vulnerable packages.
