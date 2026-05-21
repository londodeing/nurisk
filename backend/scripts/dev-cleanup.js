/**
 * Dev Cleanup — Anti Port Conflict System
 *
 * Pre-start script that detects and kills processes occupying the
 * configured PORT. Idempotent and cross-platform (Windows + Unix).
 *
 * Flow:
 *   1. Detect PID listening on PORT (netstat / lsof)
 *   2. Kill the process gracefully (taskkill / kill)
 *   3. If PID detection fails, fallback to killing by process name
 *   4. If all fails, try fallback ports (PORT+1, PORT+2, max 5)
 *   5. Output the final resolved port
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  require.resolve('dotenv', { paths: [path.resolve(__dirname, '..')] });
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} catch {
  try {
    require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
  } catch {
    // dotenv not available or .env missing — use defaults
  }
}

const PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_FALLBACK = 5;
const isWindows = process.platform === 'win32';

function log(msg) {
  console.log(`[dev-cleanup] ${msg}`);
}

function warn(msg) {
  console.warn(`[dev-cleanup] ${msg}`);
}

/**
 * Detect PID listening on a given TCP port.
 * Returns the PID or null.
 */
function getPidByPort(port) {
  if (isWindows) {
    try {
      const stdout = execSync(
        `netstat -ano | findstr ":${port} "`,
        { encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'ignore'] }
      );
      const lines = stdout.trim().split('\n').filter(l => l.includes('LISTENING'));
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(pid)) return pid;
      }
    } catch {
      // netstat failed or no match
    }
  } else {
    try {
      const stdout = execSync(
        `lsof -i :${port} -t`,
        { encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'ignore'] }
      );
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const pid = parseInt(line.trim(), 10);
        if (!isNaN(pid)) return pid;
      }
    } catch {
      // lsof failed or no match
    }
  }
  return null;
}

/**
 * Check if a port is free by attempting to bind.
 */
function isPortFree(port) {
  if (isWindows) {
    const pid = getPidByPort(port);
    return pid === null;
  }
  try {
    const pid = getPidByPort(port);
    return pid === null;
  } catch {
    return true;
  }
}

/**
 * Kill a process by PID.
 */
function killPid(pid) {
  try {
    if (isWindows) {
      execSync(`taskkill /F /PID ${pid}`, { timeout: 5000, stdio: ['pipe', 'pipe', 'ignore'] });
    } else {
      try {
        execSync(`kill -15 ${pid}`, { timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] });
        execSync(`kill -0 ${pid}`, { timeout: 2000, stdio: ['pipe', 'pipe', 'ignore'] });
        execSync(`kill -9 ${pid}`, { timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] });
      } catch {
        execSync(`kill -9 ${pid}`, { timeout: 3000, stdio: ['pipe', 'pipe', 'ignore'] });
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fallback: find and kill node/nodemon/ts-node processes by name.
 * On Windows uses taskkill with process name filter.
 * On Unix uses pkill with command pattern.
 */
function killByName() {
  if (isWindows) {
    try {
      execSync(`taskkill /F /IM node.exe /T`, { timeout: 5000, stdio: ['pipe', 'pipe', 'ignore'] });
      return true;
    } catch {
      return false;
    }
  } else {
    try {
      execSync(`pkill -f "ts-node|nodemon|node.*src/main"`, { timeout: 5000, stdio: ['pipe', 'pipe', 'ignore'] });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Main cleanup flow.
 */
function cleanup() {
  let resolvedPort = PORT;
  let freed = false;

  // --- Phase 1: Try to free the configured PORT ---
  log(`Checking port ${PORT}...`);

  if (isPortFree(PORT)) {
    log(`Port ${PORT} is free.`);
    freed = true;
  } else {
    const pid = getPidByPort(PORT);
    if (pid) {
      log(`Port ${PORT} is in use by PID ${pid}. Attempting to kill...`);
      if (killPid(pid)) {
        log(`Killed PID ${pid}.`);
        freed = true;
      } else {
        warn(`Failed to kill PID ${pid}. Trying fallback by process name...`);
        if (killByName()) {
          log(`Fallback kill by name succeeded.`);
          freed = true;
        } else {
          warn(`Fallback kill by name failed.`);
        }
      }
    } else {
      warn(`Could not identify process on port ${PORT}. Trying fallback by process name...`);
      if (killByName()) {
        log(`Fallback kill by name succeeded.`);
        freed = true;
      } else {
        warn(`Fallback kill by name failed.`);
      }
    }
  }

  // --- Phase 2: If port still occupied, try fallback ports ---
  if (!freed || !isPortFree(PORT)) {
    for (let fallback = 1; fallback <= MAX_FALLBACK; fallback++) {
      const candidate = PORT + fallback;
      if (isPortFree(candidate)) {
        resolvedPort = candidate;
        freed = true;
        log(`Using fallback port ${resolvedPort} (original ${PORT} is occupied).`);
        break;
      }
    }
  }

  if (!freed) {
    warn(`Could not free port ${PORT} or any fallback port (${PORT+1}–${PORT+MAX_FALLBACK}).`);
    warn('Please manually kill the process or change PORT in .env');
    resolvedPort = PORT;
  }

  // Output the resolved port so the bootstrap can consume it
  if (resolvedPort !== PORT) {
    process.env.PORT = String(resolvedPort);
    log(`Set PORT=${resolvedPort}`);
  }

  log(`Done. Resolved port: ${resolvedPort}`);
}

cleanup();
