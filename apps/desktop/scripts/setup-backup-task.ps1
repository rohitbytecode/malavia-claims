# Usage (run as Administrator):
#   powershell -ExecutionPolicy Bypass -File .\setup-backup-task.ps1
#
# This creates a scheduled task that runs daily at 1:00 AM and calls:
#   backup-to-gdrive.ps1
#
# Recommended environment variables for the task:
#   BACKUP_ROOT, MONGO_URI, RCLONE_REMOTE, RETENTION_DAYS, UPLOADS_DIR(optional)
#
param(
  [string]$TaskName = "ClaimSystemBackupToGoogleDrive",
  [string]$Time = "01:00" # 24h
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backupScript = Join-Path $scriptDir "backup-to-gdrive.ps1"

if (!(Test-Path $backupScript)) {
  throw "backup-to-gdrive.ps1 not found at: $backupScript"
}

# Trigger: daily at specified time
$hour = $Time.Split(":")[0]
$minute = $Time.Split(":")[1]

# Build action
# We run powershell with env vars read from system/user environment.
# Hospitals can set these system-wide variables or update the task to include explicit -ArgumentList.
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$backupScript`""

# Trigger
$trigger = New-ScheduledTaskTrigger -Daily -At "$hour`:$minute"

# Principal (runs in background)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Check if exists
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($existing) {
  Write-Host "Updating existing scheduled task: $TaskName"
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Write-Host "Creating scheduled task: $TaskName at $Time"
Register-ScheduledTask -TaskName $TaskName -Trigger $trigger -Action $action -Principal $principal

Write-Host "Scheduled task created successfully."
