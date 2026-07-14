import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const backendCwd = path.join(rootDir, "backend");

console.log("\x1b[35m%s\x1b[0m", "=========================================================");
console.log("\x1b[36m%s\x1b[0m", " 🚀 DEVPILOT AI CONCURRENT WORKSPACE LAUNCHER");
console.log("\x1b[35m%s\x1b[0m", "=========================================================");

// Detect local python virtual environment path
let pythonCmd = "python";
const localVenvWin = path.join(backendCwd, ".venv", "Scripts", "python.exe");
const localVenvUnix = path.join(backendCwd, ".venv", "bin", "python");
const altVenvWin = path.join(backendCwd, "venv", "Scripts", "python.exe");
const altVenvUnix = path.join(backendCwd, "venv", "bin", "python");

if (fs.existsSync(localVenvWin)) {
  pythonCmd = localVenvWin;
  console.log(
    "\x1b[32m%s\x1b[0m",
    "[Launcher] Using virtual environment: backend/.venv/Scripts/python",
  );
} else if (fs.existsSync(localVenvUnix)) {
  pythonCmd = localVenvUnix;
  console.log(
    "\x1b[32m%s\x1b[0m",
    "[Launcher] Using virtual environment: backend/.venv/bin/python",
  );
} else if (fs.existsSync(altVenvWin)) {
  pythonCmd = altVenvWin;
  console.log(
    "\x1b[32m%s\x1b[0m",
    "[Launcher] Using virtual environment: backend/venv/Scripts/python",
  );
} else if (fs.existsSync(altVenvUnix)) {
  pythonCmd = altVenvUnix;
  console.log("\x1b[32m%s\x1b[0m", "[Launcher] Using virtual environment: backend/venv/bin/python");
} else {
  console.log(
    "\x1b[33m%s\x1b[0m",
    "[Launcher] No virtual environment folders detected, opting to use global python launcher...",
  );
}

// Spawn Frontend
console.log("\x1b[34m%s\x1b[0m", "[Launcher] Initializing Vite Frontend server...");
const frontend = spawn("npx", ["vite", "dev"], {
  cwd: rootDir,
  shell: true,
  stdio: "inherit",
});

// Spawn Backend
console.log("\x1b[32m%s\x1b[0m", "[Launcher] Initializing FastAPI Backend server...");
const backend = spawn(pythonCmd, ["-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"], {
  cwd: backendCwd,
  shell: true,
  stdio: "inherit",
});

backend.on("error", (err) => {
  console.log("\x1b[31m%s\x1b[0m", `[Launcher] Backend failed to start: ${err.message}`);
  console.log(
    "\x1b[33m%s\x1b[0m",
    "💡 Tip: Ensure Python 3 is installed, in your PATH, and virtual environment dependencies have been resolved inside the 'backend' folder.",
  );
});

frontend.on("close", (code) => {
  console.log(`[Frontend] Process exited, code: ${code}`);
  backend.kill();
  process.exit(code || 0);
});

backend.on("close", (code) => {
  console.log(`[Backend] Process exited, code: ${code}`);
  frontend.kill();
  process.exit(code || 0);
});

process.on("SIGINT", () => {
  console.log("\n[Launcher] Shutting down workspace servers cleanly...");
  frontend.kill("SIGINT");
  backend.kill("SIGINT");
  process.exit(0);
});
