#!/usr/bin/env node
/**
 * Comprehensive CI/CD Pipeline Script
 * Runs the complete frontend validation and build process
 */
import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

function log(msg) { console.log(`[ci-pipeline] ${msg}`); }
function error(msg) { console.error(`[ci-pipeline][error] ${msg}`); }
function success(msg) { console.log(`[ci-pipeline][success] ${msg}`); }

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const skipTests = args.includes('--skip-tests');
const skipLint = args.includes('--skip-lint');
const environment = args.find(arg => arg.startsWith('--env='))?.replace('--env=', '') || 'production';

// Detect package manager
function detectPackageManager() {
  if (existsSync('bun.lockb')) return 'bun';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  return 'npm';
}

const pm = detectPackageManager();

function runCommand(command, description, options = {}) {
  log(`Running: ${description}`);\n  try {\n    const result = execSync(command, {\n      encoding: 'utf8',\n      stdio: verbose ? 'inherit' : 'pipe',\n      ...options\n    });\n    \n    if (!verbose && result) {\n      console.log(result);\n    }\n    \n    success(`Completed: ${description}`);\n    return result;\n  } catch (error) {\n    console.error(`Failed: ${description}`);\n    if (error.stdout) console.log(error.stdout);\n    if (error.stderr) console.error(error.stderr);\n    process.exit(1);\n  }\n}\n\nasync function main() {\n  const startTime = Date.now();\n  \n  log(`Starting CI pipeline for environment: ${environment}`);\n  log(`Package manager: ${pm}`);\n  log(`Node version: ${process.version}`);\n  \n  // Step 1: Clean previous builds\n  runCommand(`${pm} run clean`, 'Clean previous builds');\n  \n  // Step 2: Install dependencies (with frozen lockfile for CI)\n  const installCmd = pm === 'npm' \n    ? `${pm} ci` \n    : `${pm} install --frozen-lockfile`;\n  runCommand(installCmd, 'Install dependencies');\n  \n  // Step 3: Type checking\n  runCommand(`${pm} run check`, 'Type checking');\n  \n  // Step 4: Linting (unless skipped)\n  if (!skipLint) {\n    runCommand(`${pm} run lint`, 'Code linting');\n  } else {\n    log('Skipping linting step');\n  }\n  \n  // Step 5: Testing (unless skipped)\n  if (!skipTests) {\n    runCommand(`${pm} run test:ci`, 'Running tests');\n    \n    // Generate coverage report for CI\n    if (process.env.CI) {\n      runCommand(`${pm} run test:coverage`, 'Generate coverage report');\n    }\n  } else {\n    log('Skipping tests step');\n  }\n  \n  // Step 6: Build for specified environment\n  const buildCmd = environment === 'production' \n    ? `${pm} run build:prod`\n    : environment === 'staging'\n    ? `${pm} run build:staging`\n    : `${pm} run build`;\n  runCommand(buildCmd, `Building for ${environment}`);\n  \n  // Step 7: Verify build output\n  runCommand(`${pm} run build:verify`, 'Verify build output');\n  \n  const duration = ((Date.now() - startTime) / 1000).toFixed(2);\n  success(`CI pipeline completed successfully in ${duration}s`);\n  \n  // Output build artifacts info for CI systems\n  if (process.env.CI) {\n    console.log('::group::Build Artifacts');\n    try {\n      const buildSize = execSync('du -sh build/', { encoding: 'utf8' }).trim();\n      console.log(`Build size: ${buildSize}`);\n    } catch {\n      console.log('Build size: Unable to determine');\n    }\n    console.log('::endgroup::');\n  }\n}\n\nmain().catch(err => {\n  error(`Pipeline failed: ${err.message}`);\n  process.exit(1);\n});