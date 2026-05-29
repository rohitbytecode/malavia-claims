import { app, BrowserWindow, dialog } from "electron";
import path from "node:path";
import fs from "node:fs";
import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProc: ChildProcess | null = null;

function getProjectRoot(): string {
  if (app.isPackaged) {
    return process.resourcesPath;
  }

  return path.resolve(__dirname, "..", "..");
}

function getBackendEntry(): string {
  return path.join(getProjectRoot(), "apps", "backend", "dist", "server.js");
}

function getFrontendIndex(): string {
  return path.join(getProjectRoot(), "apps", "frontend", "dist", "index.html");
}

function ensureFileExists(filePath: string, label: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found at: ${filePath}`);
  }
}

async function startBackendIfNeeded(): Promise<void> {
  const backendEntry = getBackendEntry();

  ensureFileExists(backendEntry, "Backend dist/server.js");

  const env = {
    ...process.env,
    PORT: process.env.PORT ?? "3443",
    MONGO_URI: process.env.MONGO_URI ?? "mongodb://localhost:27017/hicms",
  };

  backendProc = spawn(process.execPath, [backendEntry], {
    cwd: path.join(getProjectRoot(), "apps", "backend"),
    env,
    stdio: "ignore",
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = getFrontendIndex();

  ensureFileExists(indexPath, "Frontend dist/index.html");

  win.loadFile(indexPath);

  return win;
}

app.whenReady().then(async () => {
  try {
    //await startBackendIfNeeded();
    createWindow();
  } catch (err) {
    console.error(err);

    dialog.showErrorBox(
      "Startup Error",
      err instanceof Error ? (err.stack ?? err.message) : String(err)
    );

    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProc) {
    backendProc.kill();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
