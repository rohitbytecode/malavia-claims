# TODO

## Electron Windows .exe (Desktop Shell)

- [x] Create new package: `apps/desktop/` using Electron + electron-builder
- [ ] Integrate auto-updates using `electron-updater` (channel + provider placeholder)
- [ ] Implement host-only runtime model:
  - [ ] Electron starts backend locally (spawn node) + waits for HTTPS readiness
  - [ ] Electron loads built frontend (embedded UI) and uses backend HTTPS at runtime
- [ ] Ensure production builds:
  - [ ] Build backend (`apps/backend`) -> dist
  - [ ] Build frontend (`apps/frontend`) -> dist
  - [ ] Build desktop app -> `.exe` installer

## Nightly Google Drive Backup (Windows)

- [x] Add Windows backup script(s) to:
  - [x] Dump MongoDB to timestamped archive
  - [x] Archive `uploads/`
  - [x] Upload both archives to Google Drive (rclone)
  - [x] Retention: keep last 7 days (matching existing bash scripts)
- [x] Add Windows Task Scheduler setup script (runs every night)
- [x] Document required setup:
  - [x] Google Drive auth / rclone remote config
  - [x] Required paths + environment variables
  - [ ] Service user permissions

## CI / Packaging / Release

- [ ] Add turbo pipeline tasks for desktop build
- [ ] Define release versioning strategy
- [ ] Add documentation in `README.md` for:
  - [ ] Installation
  - [ ] Update procedure
  - [ ] Backup setup
