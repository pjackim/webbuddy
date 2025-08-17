def main():
    import os
    import platform
    import signal
    import sys
    import threading

    import uvicorn

    # Detect Windows/WSL environments where CLI freezing issues are common
    is_windows_like = platform.system() in ("Windows",) or "microsoft" in platform.uname().release.lower()

    # On Windows/WSL, disable reload by default to prevent Ctrl+C issues
    reload_flag = os.getenv("DEBUG_RELOAD", "0" if is_windows_like else "1") in {"1", "true", "True"}

    # Use localhost by default on Windows to avoid firewall issues and accessibility problems
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))

    print("🚀 Starting Web Buddy dev server...")
    print(f"   📍 URL: http://localhost:{port}")
    print(f"   🔗 Host: {host}")
    print(f"   🔄 Reload: {'ON' if reload_flag else 'OFF'}")

    if is_windows_like:
        if not reload_flag:
            print("   ℹ️  Auto-reload disabled on Windows/WSL (set DEBUG_RELOAD=1 to enable)")
        print("   ⚠️  On Windows: Use Ctrl+Break or close terminal if Ctrl+C doesn't work")

    print("   🛑 Press Ctrl+C to quit\n")

    # Enhanced signal handling with forced shutdown for Windows
    shutdown_event = threading.Event()

    def signal_handler(sig, frame):
        print("\n🛑 Shutting down server...")
        shutdown_event.set()
        # On Windows, be more aggressive about shutdown
        if is_windows_like:
            threading.Timer(2.0, lambda: os._exit(0)).start()
        sys.exit(0)

    def force_shutdown_monitor():
        """Monitor for shutdown events and force exit if needed (Windows workaround)"""
        if shutdown_event.wait(5):  # Wait up to 5 seconds for graceful shutdown
            return
        print("⚠️  Forcing shutdown due to timeout...")
        os._exit(1)

    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, signal_handler)

    # Additional Windows-specific signal handling
    if is_windows_like and hasattr(signal, 'SIGBREAK'):
        signal.signal(signal.SIGBREAK, signal_handler)

    try:
        # Start shutdown monitor thread for Windows
        if is_windows_like:
            monitor_thread = threading.Thread(target=force_shutdown_monitor, daemon=True)
            monitor_thread.start()

        uvicorn.run(
            "web_buddy_backend.main:create_app",
            factory=True,
            host=host,
            port=port,
            reload=reload_flag,
            access_log=True,
            # Additional Windows-friendly settings
            use_colors=not is_windows_like,  # Disable colors on Windows to prevent terminal issues
            loop="asyncio" if is_windows_like else "auto",  # Use asyncio loop on Windows
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        shutdown_event.set()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        shutdown_event.set()
        sys.exit(1)
