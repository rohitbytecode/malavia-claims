# Desktop Shell (Electron Windows)

## Build

From repo root:

- `pnpm install`
- `pnpm -C apps/desktop package`

## Runtime

This desktop shell is designed for **host-only deployment**:

- The Electron app runs on the host machine.
- It starts the backend locally and embeds the frontend UI.

## Auto-update

Auto-update is configured via `electron-updater` using a **generic provider** URL.
Update the `publish.provider.url` in `apps/desktop/package.json` to your internal update host.

## Backup to Google Drive (nightly)

PowerShell scripts are included to:

- create nightly archives (MongoDB dump + uploads backup)
- upload archives to Google Drive using `rclone`
- register the job in **Windows Task Scheduler**

See:

- `apps/desktop/scripts/backup-to-gdrive.ps1`
- `apps/desktop/scripts/setup-backup-task.ps1`

### Required setup

1. Install/verify:
   - `mongodump` (MongoDB Database Tools)
   - `tar` (built-in Windows tar is OK in most cases)
   - `rclone` configured for Google Drive
2. Configure environment variables for the machine/service running the Task Scheduler job:
   - `BACKUP_ROOT` (e.g. `C:\Backups\claim-system`)
   - `MONGO_URI` (e.g. `mongodb://localhost:27017/hicms`)
   - `RCLONE_REMOTE` (e.g. `gdrive:claim-management`)
   - `RETENTION_DAYS` (defaults to `7`)
   - `UPLOADS_DIR` (optional; if omitted, script uses a placeholder backend uploads path)
3. Run (as Administrator):
   - `powershell -ExecutionPolicy Bypass -File .\setup-backup-task.ps1`

Retention is implemented to delete local `.tar.gz` archives older than the retention window (default: last 7 days).
