#!/usr/bin/env node
/**
 * Smart dev launcher:
 * - Detect existing process on DEV_PORT (default 5173) and terminate cleanly
 * - Supports Windows (netstat + taskkill) and Unix (lsof + kill)
 * - Optional --no-kill to skip termination
 * - Retries port availability
 * - Starts `npm run dev` (vite dev)
 */
import { execSync, spawn } from 'node:child_process';
import os from 'node:os';
import process from 'node:process';

function getArgValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  return null;
}

const DEV_PORT = Number(getArgValue('--port') || process.env.DEV_PORT || 5173);
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 400;
const args = process.argv.slice(2);
const skipKill = args.includes('--no-kill');

function log(msg) { console.log(`[dev:smart] ${msg}`); }
function warn(msg) { console.warn(`[dev:smart][warn] ${msg}`); }
function error(msg) { console.error(`[dev:smart][error] ${msg}`); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function findPidsWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    out.split(/\r?\n/).forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    });
    return [...pids];
  } catch {
    return [];
  }
}

function findPidsUnix(port) {
  try {
    const out = execSync(`lsof -i :${port} -t`, { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function findPids(port) {
  return os.platform() === 'win32' ? findPidsWindows(port) : findPidsUnix(port);
}

function killPidWindows(pid) {
  try { execSync(`taskkill /PID ${pid} /F`); return true; } catch { return false; }
}
function killPidUnix(pid) {
  try { process.kill(Number(pid), 'SIGTERM'); return true; } catch { return false; }
}
function killPid(pid) { return os.platform() === 'win32' ? killPidWindows(pid) : killPidUnix(pid); }

async function ensurePortFree(port) {
  if (skipKill) { log(`Skipping kill step for port ${port}`); return; }
  const pids = findPids(port);
  if (pids.length === 0) { log(`Port ${port} already free.`); return; }
  log(`Found ${pids.length} process(es) on port ${port}: ${pids.join(', ')}`);
  for (const pid of pids) {
    const ok = killPid(pid);
    log(`${ok ? 'Killed' : 'Failed to kill'} PID ${pid}`);
  }
  // Wait for port to free
  for (let i = 0; i < MAX_RETRIES; i++) {
    if (findPids(port).length === 0) { log(`Port ${port} is now free.`); return; }
    await sleep(RETRY_DELAY_MS);
  }
  warn(`Port ${port} may still be in use. Continuing anyway.`);
}

async function main() {
  log(`Starting smart dev (port ${DEV_PORT})`);
  await ensurePortFree(DEV_PORT);

  // Basic environment diagnostics
  try {
    const nodeVersion = process.version;
    let bunVersion = null;
    try { bunVersion = execSync('bun --version', { encoding: 'utf8' }).trim(); } catch {}
    log(`Node: ${nodeVersion}${bunVersion ? ` | Bun: ${bunVersion}` : ''}`);
  } catch (e) {
    warn(`Unable to get runtime versions: ${e.message}`);
  }

  log('Launching vite dev...');
  let child;
  try {
    child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--port', String(DEV_PORT)], { stdio: 'inherit', env: process.env, shell: true });
  } catch (e) {
    warn(`npm spawn failed (${e.message}). Falling back to direct vite.`);
  }
  if (!child) {
    const viteCmd = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
    try {
      child = spawn(viteCmd, ['vite', 'dev', '--port', String(DEV_PORT)], { stdio: 'inherit', env: process.env, shell: true });
    } catch (e2) {
      warn(`npx vite failed (${e2.message}). Trying direct vite if in PATH.`);
      child = spawn('vite', ['dev', '--port', String(DEV_PORT)], { stdio: 'inherit', env: process.env, shell: true });
    }
  }
  child.on('exit', (code) => {
    if (code === 0) log('Dev server exited cleanly.');
    else error(`Dev server exited with code ${code}`);
  });
}

main().catch(e => { error(e.stack || e.message); process.exit(1); });
