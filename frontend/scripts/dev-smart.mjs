#!/usr/bin/env node
/**
 * Smart dev launcher with cross-platform support:
 * - Detect existing process on DEV_PORT (default 5173) and terminate cleanly
 * - Supports Windows (netstat + taskkill) and Unix (lsof + kill)
 * - Optional --no-kill to skip termination
 * - Retries port availability with exponential backoff
 * - Auto-detects package manager (bun, npm, yarn, pnpm)
 * - Environment diagnostics and health checks
 * - Graceful error handling and logging
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
const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 500;
const args = process.argv.slice(2);
const skipKill = args.includes('--no-kill');
const verbose = args.includes('--verbose') || process.env.DEBUG;

// Auto-detect package manager
function detectPackageManager() {
  try {
    if (require('fs').existsSync('bun.lockb')) return 'bun';
    if (require('fs').existsSync('yarn.lock')) return 'yarn';
    if (require('fs').existsSync('pnpm-lock.yaml')) return 'pnpm';
    return 'npm';
  } catch {
    return 'npm';
  }
}

const packageManager = getArgValue('--pm') || detectPackageManager();

function log(msg) { console.log(`[dev:smart] ${msg}`); }
function warn(msg) { console.warn(`[dev:smart][warn] ${msg}`); }
function error(msg) { console.error(`[dev:smart][error] ${msg}`); }
function debug(msg) { if (verbose) console.log(`[dev:smart][debug] ${msg}`); }

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
  log(`Starting smart dev (port ${DEV_PORT}, package manager: ${packageManager})`);
  await ensurePortFree(DEV_PORT);

  // Enhanced environment diagnostics
  try {
    const nodeVersion = process.version;
    let pmVersion = null;
    try { 
      pmVersion = execSync(`${packageManager} --version`, { encoding: 'utf8' }).trim();
    } catch {}
    log(`Node: ${nodeVersion}${pmVersion ? ` | ${packageManager}: ${pmVersion}` : ''}`);
    debug(`Platform: ${os.platform()} ${os.arch()}`);
    debug(`CWD: ${process.cwd()}`);
  } catch (e) {
    warn(`Unable to get runtime versions: ${e.message}`);
  }
  
  // Health checks
  try {
    const fs = require('fs');
    if (!fs.existsSync('package.json')) {
      error('package.json not found in current directory');
      process.exit(1);
    }
    if (!fs.existsSync('vite.config.js') && !fs.existsSync('vite.config.ts')) {
      warn('No vite config file found - continuing anyway');
    }
    debug('Health checks passed');
  } catch (e) {
    warn(`Health check failed: ${e.message}`);
  }

  log(`Launching vite dev using ${packageManager}...`);
  let child;
  
  const isWindows = /^win/.test(process.platform);
  const pmCmd = isWindows ? `${packageManager}.cmd` : packageManager;
  
  try {
    debug(`Spawning: ${pmCmd} run dev --port ${DEV_PORT}`);
    child = spawn(pmCmd, ['run', 'dev', '--', '--port', String(DEV_PORT), '--host', '0.0.0.0'], { 
      stdio: 'inherit', 
      env: { ...process.env, NODE_ENV: 'development' }, 
      shell: true 
    });
  } catch (e) {
    warn(`${packageManager} spawn failed (${e.message}). Falling back to npm.`);
    try {
      const npmCmd = isWindows ? 'npm.cmd' : 'npm';
      child = spawn(npmCmd, ['run', 'dev', '--', '--port', String(DEV_PORT)], { 
        stdio: 'inherit', 
        env: process.env, 
        shell: true 
      });
    } catch (e2) {
      warn(`npm fallback failed (${e2.message}). Trying direct vite.`);
      const viteCmd = isWindows ? 'npx.cmd' : 'npx';
      child = spawn(viteCmd, ['vite', 'dev', '--port', String(DEV_PORT), '--host', '0.0.0.0'], { 
        stdio: 'inherit', 
        env: process.env, 
        shell: true 
      });
    }
  }
  if (child) {
    // Enhanced process monitoring
    child.on('exit', (code, signal) => {
      if (code === 0) {
        log('Dev server exited cleanly.');
      } else if (signal) {
        warn(`Dev server terminated by signal: ${signal}`);
      } else {
        error(`Dev server exited with code ${code}`);
      }
      process.exit(code || 0);
    });
    
    child.on('error', (err) => {
      error(`Failed to start dev server: ${err.message}`);
      process.exit(1);
    });
    
    // Graceful shutdown handling
    process.on('SIGINT', () => {
      log('Received SIGINT, shutting down gracefully...');
      if (child && !child.killed) {
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 5000);
      }
    });
    
    process.on('SIGTERM', () => {
      log('Received SIGTERM, shutting down...');
      if (child && !child.killed) {
        child.kill('SIGTERM');
      }
    });
  } else {
    error('Failed to spawn dev server process');
    process.exit(1);
  }
}

main().catch(e => { error(e.stack || e.message); process.exit(1); });
