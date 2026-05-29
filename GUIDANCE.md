# Setup Guide (Windows Host-Only Electron + Nightly Google Drive Backups)

This guide covers:

1. Building and running the Windows **.exe** (Electron)
2. Hosting configuration for **major smooth updates**
3. Setting up **nightly Google Drive backups** (MongoDB + uploads) via Windows Task Scheduler

---

## 0) Assumptions / Model (Host-only)

**Recommended model A (already implemented):**

- Install/run the Electron desktop app only on the **host** hospital server PC (Windows).
- The Electron app starts the backend locally and embeds the UI.

Other hospital PCs access the system via the same host (LAN).  
(If you instead want model B: every PC runs its own .exe, say so; the wiring changes.)

---

## 1) Prerequisites on the Host Windows Machine

### 1.1 Install Node + pnpm

- Install **Node.js LTS**
- Enable **corepack** (or install pnpm normally)
- From repo root:
  - `pnpm -v` (should work)

### 1.2 Ensure MongoDB tools are available

The backup script uses `mongodump`.

- Install **MongoDB Database Tools**
- Confirm from a terminal:
  - `mongodump --version`

### 1.3 Ensure rclone is available

- Install **rclone**
- Confirm:
  - `rclone version`

### 1.4 Ensure `tar` exists on Windows

Most Windows setups with tools installed already have tar.
Confirm:

- `tar --version`

If `tar` is not available:

- Install a tar that supports `-czf` (common options are Git for Windows utilities)

---

## 2) Prepare Environment Variables for Backend (Run time)

The Electron main process currently starts backend with:

- `PORT` default: `3443`
- `MONGO_URI` default: `mongodb://localhost:27017/hicms`

For a production hospital install, you should set environment variables on the host:

- `MONGO_URI`
- (optional) `PORT`

### How to set system environment variables

- Windows: System Properties → Environment Variables
- Add/Edit:
  - `MONGO_URI=...`
  - `PORT=3443` (if you want a different port)

---

## 3) Build the Desktop App (.exe)

### 3.1 Install dependencies (repo root)

From repo root:

- `pnpm install`

### 3.2 Build backend + frontend

From repo root:

- `pnpm turbo run build --filter=backend`
- `pnpm turbo run build --filter=frontend`

### 3.3 Package Electron for Windows

From repo root:

- `pnpm -C apps/desktop package`

This should create an NSIS installer / EXE artifacts under the Electron package output (electron-builder default output under `apps/desktop/dist/`).

---

## 4) Configure Auto-Updates (Electron Major Updates “Smoothly”)

The Electron package uses **electron-updater** with a **generic provider URL** placeholder.

### 4.1 Set your internal update host

Open:

- `apps/desktop/package.json`

Change:

- `build.publish[0].url` from:
  - `https://YOUR-INTERNAL-UPDATE-HOST/desktop/`
    to your real endpoint, for example:
- `https://updates.yourhospital.local/desktop/`

### 4.2 Hosting requirement

Your update host must serve files in a format electron-updater expects:

- Typically electron-builder produces update artifacts (build pipeline will generate them)
- Hospital IT (or your internal devops) must host those artifacts at the publish URL

**Important:** For “major updates smooth”, you must keep:

- consistent appId (`com.claimmanagement.desktop`)
- correct publish channel (if you later add channel configs)
- consistent versioning in `apps/desktop/package.json`

---

## 5) Nightly Google Drive Backup Setup (Task Scheduler)

Backup script location:

- `apps/desktop/scripts/backup-to-gdrive.ps1`

Task scheduler setup script:

- `apps/desktop/scripts/setup-backup-task.ps1`

Backup behavior:

- Creates timestamped archives:
  - MongoDB dump → `mongodb_YYYY-MM-DD_HH-mm-ss.tar.gz`
  - uploads backup → `uploads_YYYY-MM-DD_HH-mm-ss.tar.gz`
- Uploads both archives to Google Drive via **rclone**
- Deletes local `.tar.gz` archives older than `RETENTION_DAYS` (default 7)

### 5.1 Configure rclone Google Drive remote

Run:

- `rclone config`

Create a remote like:

- `gdrive:claim-management`

### 5.2 Set environment variables for the scheduled job

Set system/user environment variables (recommended: SYSTEM so Task runs as SYSTEM):

Required:

- `BACKUP_ROOT` (example) `C:\Backups\claim-system`
- `MONGO_URI` (example) `mongodb://localhost:27017/hicms`
- `RCLONE_REMOTE` (example) `gdrive:claim-management`
- `RETENTION_DAYS` (optional) default 7

Optional:

- `UPLOADS_DIR`
  - If your backend uploads directory differs, set it.

⚠️ Note: If `UPLOADS_DIR` is not set, the script currently uses a placeholder path:

- `apps/backend/uploads` (placeholder).  
  You should confirm the real uploads folder path in your backend runtime.

---

### 5.3 Install/Create the scheduled task

Open PowerShell **as Administrator** and run:

- `cd apps\desktop\scripts`
- `powershell -ExecutionPolicy Bypass -File .\setup-backup-task.ps1`

This creates/updates:

- Task Name: `ClaimSystemBackupToGoogleDrive`
- Trigger: **Daily at 01:00 AM**
- Action: runs `backup-to-gdrive.ps1`

---

## 6) Manual test (recommended before relying on the nightly job)

### 6.1 Test backup script immediately

In PowerShell as the same user/service context that Task Scheduler uses (ideally SYSTEM):

- `powershell -ExecutionPolicy Bypass -File .\backup-to-gdrive.ps1`

Check:

- Backup archives appear locally in `BACKUP_ROOT`
- Files appear in your Google Drive remote
- No retention deletion occurs immediately (unless older than retention window)

---

## 7) Checklist for First Hospital Deployment

- [ ] Build backend + frontend successfully
- [ ] `pnpm -C apps/desktop package` creates Windows artifacts
- [ ] Update URL in `apps/desktop/package.json` is correct
- [ ] MongoDB backups: `mongodump` works
- [ ] rclone configured & can upload
- [ ] Task Scheduler created successfully
- [ ] Manual backup test passes
- [ ] Observe logs / confirm Google Drive receives files

---

## Files you will use most

- Desktop app:
  - `apps/desktop/src/main.ts`
  - `apps/desktop/package.json`
- Backup:
  - `apps/desktop/scripts/backup-to-gdrive.ps1`
  - `apps/desktop/scripts/setup-backup-task.ps1`
