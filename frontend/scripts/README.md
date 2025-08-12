# Frontend Scripts Documentation

This directory contains professional build and deployment scripts for the WebBuddy frontend.

## Available Scripts

### Development Scripts
- `dev-smart.mjs` - Intelligent development server with port management and cross-platform support
- `build-verify.mjs` - Comprehensive build validation and size analysis
- `ci-pipeline.mjs` - Complete CI/CD pipeline for automated builds

## Script Features

### dev-smart.mjs
- **Cross-platform compatibility**: Works on Windows, macOS, and Linux
- **Smart port management**: Automatically kills processes on port 5173
- **Package manager detection**: Auto-detects bun, npm, yarn, or pnpm
- **Graceful shutdown**: Handles SIGINT/SIGTERM signals properly
- **Environment diagnostics**: Shows runtime versions and health checks
- **Verbose debugging**: Use `--verbose` flag for detailed output

Usage:
```bash
npm run dev:smart                    # Standard usage
npm run dev:smart -- --verbose      # With detailed logging
npm run dev:smart -- --no-kill      # Skip port cleanup
npm run dev:smart -- --port 3000    # Custom port
```

### build-verify.mjs
- **Build validation**: Ensures all critical files are present
- **Size analysis**: Calculates and reports total build size
- **Production checks**: Validates production-specific requirements
- **Asset verification**: Confirms proper asset generation
- **Detailed reporting**: Shows file sizes and structure

Features:
- Validates critical SvelteKit files
- Checks for source maps in production
- Reports build size with warnings for large bundles
- Cross-platform file system operations

### ci-pipeline.mjs
- **Complete CI/CD workflow**: Clean, install, test, lint, build, verify
- **Environment-specific builds**: Supports development, staging, production
- **Flexible execution**: Optional test/lint skipping for development
- **CI integration**: GitHub Actions compatible output
- **Performance monitoring**: Reports pipeline execution time

Usage:
```bash
npm run ci                           # Full pipeline (production)
npm run ci:quick                     # Fast pipeline (development)
npm run ci:full                      # Full pipeline with coverage
node scripts/ci-pipeline.mjs --env=staging --verbose
```

## Environment Configuration

### Build Environments
- **Development** (`.env.local`): Full debugging, development API endpoints
- **Staging** (`.env.staging`): Production-like with debug tools enabled
- **Production** (`.env.production`): Optimized for deployment

### Environment Variables
All environments support:
- `VITE_API_BASE_URL` - Backend API endpoint
- `VITE_WS_URL` - WebSocket connection URL
- `VITE_ENABLE_DEBUG` - Debug mode toggle
- `VITE_BUILD_VERSION` - Build version identifier
- `VITE_BUILD_TIMESTAMP` - Automatically injected during build

## Package Manager Support

Scripts automatically detect and use the appropriate package manager:

1. **Bun** (preferred) - Detected by `bun.lockb`
2. **Yarn** - Detected by `yarn.lock`
3. **PNPM** - Detected by `pnpm-lock.yaml`
4. **NPM** - Default fallback

## Cross-Platform Compatibility

All scripts are designed for cross-platform use:

- **Windows**: Uses `.cmd` extensions and `taskkill` for process management
- **macOS/Linux**: Uses standard Unix commands and signals
- **WSL**: Fully compatible with Windows Subsystem for Linux

## VSCode Integration

Scripts integrate with VSCode tasks (`.vscode/tasks.json`):

- Uses `${config:webbuddy.packageManager}` variable for package manager selection
- Proper problem matchers for TypeScript and ESLint errors
- Background task support for development servers
- Sequential task dependencies for complex workflows

## Error Handling

All scripts implement robust error handling:

- **Graceful failures**: Clean error messages and proper exit codes
- **Retry logic**: Automatic retries for network-dependent operations
- **Validation**: Pre-flight checks for required files and dependencies
- **Logging**: Structured logging with severity levels

## Performance Optimization

Scripts are optimized for developer experience:

- **Parallel execution**: Independent tasks run concurrently where possible
- **Incremental builds**: Only rebuild what's changed
- **Caching**: Leverage package manager and build tool caches
- **Fast feedback**: Quick error reporting and validation

## CI/CD Integration

Scripts are designed for continuous integration:

- **GitHub Actions**: Compatible output formatting and exit codes
- **Docker**: Works in containerized environments
- **Artifacts**: Proper build artifact generation and reporting
- **Caching**: Supports CI cache strategies for faster builds

## Troubleshooting

### Common Issues

1. **Port already in use**: Use `--no-kill` flag or check for other processes
2. **Package manager not found**: Ensure your preferred PM is installed globally
3. **Permission denied**: Scripts should be executable (use `chmod +x`)
4. **Environment variables**: Check `.env.*` files for proper configuration

### Debug Mode

Enable verbose logging:
```bash
DEBUG=1 npm run dev:smart
npm run dev:smart -- --verbose
```

### Manual Execution

Scripts can be run directly:
```bash
node scripts/dev-smart.mjs --verbose --port 3000
node scripts/build-verify.mjs
node scripts/ci-pipeline.mjs --env=staging --skip-tests
```

## Best Practices

1. **Use environment-specific builds** for different deployment targets
2. **Run full CI pipeline** before important commits or releases  
3. **Monitor build sizes** to prevent bundle bloat
4. **Test cross-platform compatibility** when modifying scripts
5. **Keep dependencies updated** for security and performance