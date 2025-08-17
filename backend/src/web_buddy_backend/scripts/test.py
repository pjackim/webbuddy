def main(argv=None):
    import os
    import platform
    import signal
    import sys
    import threading

    import pytest

    # Detect Windows/WSL environments where CLI freezing issues are common
    is_windows_like = platform.system() in ("Windows",) or "microsoft" in platform.uname().release.lower()
    
    print("🧪 Running tests...")
    if is_windows_like:
        print("   ⚠️  Windows detected: Enhanced signal handling enabled")
        print("   ⚠️  If tests freeze, try Ctrl+Break or close terminal")
    
    # Enhanced signal handling for Windows environments
    def signal_handler(sig, frame):
        print("\n🛑 Test run interrupted by user")
        if is_windows_like:
            # Force exit on Windows to prevent hanging
            os._exit(1)
        sys.exit(1)

    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, signal_handler)
    
    # Additional Windows-specific signal handling
    if is_windows_like and hasattr(signal, 'SIGBREAK'):
        signal.signal(signal.SIGBREAK, signal_handler)

    try:
        args = list(argv) if argv is not None else sys.argv[1:]
        
        # Add Windows-friendly pytest options
        if is_windows_like and not any('--tb=' in arg for arg in args):
            args.extend(['--tb=short'])  # Shorter tracebacks on Windows
        
        # Disable color output on Windows to prevent terminal issues
        if is_windows_like and not any('--color=' in arg for arg in args):
            args.extend(['--color=no'])
        
        return pytest.main(args)
    except KeyboardInterrupt:
        print("\n🛑 Tests stopped by user")
        if is_windows_like:
            os._exit(1)
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        if is_windows_like:
            os._exit(1)
        sys.exit(1)
