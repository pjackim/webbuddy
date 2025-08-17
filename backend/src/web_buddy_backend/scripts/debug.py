def main():
    import os
    import platform
    import signal
    import sys

    import uvicorn

    # On Windows/WSL, Uvicorn's reload watcher can sometimes ignore Ctrl+C in some shells.
    # Default to reload off on Windows/WSL, but allow override via env DEBUG_RELOAD=1.
    is_windows_like = platform.system() in ("Windows",) or "microsoft" in platform.uname().release.lower()
    reload_flag = os.getenv("DEBUG_RELOAD", "0" if is_windows_like else "1") in {"1", "true", "True"}

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))

    print(
        f"Starting dev server on http://localhost:{port} (bound to {host})\n"
        f"- Reload: {'ON' if reload_flag else 'OFF'}"
        + (" (set DEBUG_RELOAD=1 to enable on Windows/WSL)" if is_windows_like and not reload_flag else "")
        + "\n- Press Ctrl+C to quit"
    )

    # Improved signal handling for better Ctrl+C responsiveness
    def signal_handler(sig, frame):
        print("\n🛑 Shutting down server...")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, signal_handler)

    try:
        uvicorn.run(
            "web_buddy_backend.main:create_app",
            factory=True,
            host=host,
            port=port,
            reload=reload_flag,
            access_log=True,
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
