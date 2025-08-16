#!/usr/bin/env node
/**
 * Build verification script
 * Validates build output and ensures deployment readiness
 */
import { execSync } from 'node:child_process';
import { existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function log(msg) { console.log(`[build-verify] ${msg}`); }
function error(msg) { console.error(`[build-verify][error] ${msg}`); }
function success(msg) { console.log(`[build-verify][success] ${msg}`); }

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function verifyBuild() {
  const buildDir = 'build';
  
  // Check if build directory exists
  if (!existsSync(buildDir)) {
    error(`Build directory '${buildDir}' not found`);
    process.exit(1);
  }

  log('Verifying build output...');

  // Critical files that should exist
  const criticalFiles = [
    'index.html',
    '_app/immutable/entry/app.*.js',
    '_app/version.json'
  ];

  let hasErrors = false;

  // Check for critical files (with glob patterns)
  for (const filePattern of criticalFiles) {
    if (filePattern.includes('*')) {
      // Handle glob patterns
      const [dir, pattern] = filePattern.split('/').slice(-2);
      const dirPath = join(buildDir, filePattern.replace('/' + dir + '/' + pattern, '/' + dir));
      
      if (existsSync(dirPath)) {
        const files = readdirSync(dirPath).filter(f => 
          new RegExp(pattern.replace('*', '.*')).test(f)
        );
        if (files.length === 0) {
          error(`No files matching pattern '${filePattern}' found`);
          hasErrors = true;
        } else {
          log(`Found ${files.length} files matching '${filePattern}'`);
        }
      } else {
        error(`Directory '${dirPath}' not found`);
        hasErrors = true;
      }
    } else {
      const filePath = join(buildDir, filePattern);
      if (!existsSync(filePath)) {
        error(`Critical file '${filePattern}' not found`);
        hasErrors = true;
      } else {
        const stats = statSync(filePath);
        log(`Found '${filePattern}' (${formatBytes(stats.size)})`);
      }
    }
  }

  // Calculate total build size
  function calculateDirSize(dir) {
    let totalSize = 0;
    const items = readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        totalSize += calculateDirSize(fullPath);
      } else {
        totalSize += statSync(fullPath).size;
      }
    }
    return totalSize;
  }

  const totalSize = calculateDirSize(buildDir);
  log(`Total build size: ${formatBytes(totalSize)}`);

  // Warn if build is too large (>5MB for SPA)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (totalSize > maxSize) {
    error(`Build size (${formatBytes(totalSize)}) exceeds recommended maximum (${formatBytes(maxSize)})`);
    log('Consider code splitting or asset optimization');
    // Don't fail for size warnings in development
    if (process.env.NODE_ENV === 'production') {
      hasErrors = true;
    }
  }

  // Additional checks for production builds
  if (process.env.NODE_ENV === 'production') {
    // Check for source maps (should not be in production)
    try {
      const result = execSync(`find ${buildDir} -name "*.js.map" | head -5`, { encoding: 'utf8' });
      if (result.trim()) {
        error('Source maps found in production build');
        console.log(result);
        hasErrors = true;
      }
    } catch {
      // find command not available, skip check
      log('Skipping source map check (find command not available)');
    }
  }

  if (hasErrors) {
    error('Build verification failed');
    process.exit(1);
  }

  success('Build verification passed');
  success(`Build ready for deployment (${formatBytes(totalSize)})`);
}

verifyBuild().catch(err => {
  error(`Verification failed: ${err.message}`);
  process.exit(1);
});