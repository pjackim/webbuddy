def main():
    import os
    import platform

    import uvicorn

    # On Windows, Uvicorn's reload watcher can sometimes ignore Ctrl+C in some shells.
    # Default to reload off on Windows, but allow override via env DEBUG_RELOAD=1.
    is_windows = platform.system() == "Windows"
    reload_flag = os.getenv("DEBUG_RELOAD", "0" if is_windows else "1") in {"1", "true", "True"}

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))

    print(
        f"Starting dev server on http://localhost:{port} (bound to {host})\n"
        f"- Reload: {'ON' if reload_flag else 'OFF'}"
        + (" (set DEBUG_RELOAD=1 to enable on Windows)" if is_windows and not reload_flag else "")
    )

    uvicorn.run(
        "web_buddy_backend.main:create_app",
        factory=True,
        host=host,
        port=port,
        reload=reload_flag,
    )
