def main():
    """Diagnose common development environment issues."""
    import os
    import platform
    import socket
    import sys
    from pathlib import Path

    print("🩺 Web Buddy Backend Environment Diagnostics")
    print("=" * 50)

    # System information
    print(f"📊 Platform: {platform.system()} {platform.release()}")
    print(f"🐍 Python: {sys.version}")
    print(f"📁 Working Directory: {Path.cwd()}")

    # Windows detection
    is_windows_like = platform.system() in ("Windows",) or "microsoft" in platform.uname().release.lower()
    if is_windows_like:
        print("🪟 Windows/WSL detected")
        print("   ℹ️  Common issues on Windows:")
        print("   - Ctrl+C may not work (try Ctrl+Break)")
        print("   - Firewall may block 0.0.0.0 binding")
        print("   - Terminal color issues possible")

    # Check environment variables
    print("\n🔧 Environment Variables:")
    env_vars = ["HOST", "PORT", "DEBUG_RELOAD", "PYTHONUNBUFFERED", "PYTHONDONTWRITEBYTECODE"]
    for var in env_vars:
        value = os.getenv(var, "Not set")
        print(f"   {var}: {value}")

    # Check port availability
    print("\n🔌 Port Check:")
    test_ports = [8000, 8001, 8080]
    for port in test_ports:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                result = s.connect_ex(('127.0.0.1', port))
                if result == 0:
                    print(f"   Port {port}: ❌ In use")
                else:
                    print(f"   Port {port}: ✅ Available")
        except Exception as e:
            print(f"   Port {port}: ⚠️  Error checking ({e})")

    # Check directory structure
    print("\n📂 Directory Structure:")
    expected_dirs = [
        "src/web_buddy_backend",
        "src/web_buddy_backend/scripts",
        "src/web_buddy_backend/api",
        "tests",
    ]
    for dir_path in expected_dirs:
        full_path = Path(dir_path)
        if full_path.exists():
            print(f"   {dir_path}: ✅ Exists")
        else:
            print(f"   {dir_path}: ❌ Missing")

    # Check virtual environment
    print("\n🔄 Virtual Environment:")
    venv_path = Path(".venv")
    if venv_path.exists():
        print("   .venv: ✅ Exists")
        # Check for key packages
        try:
            import uvicorn
            print(f"   uvicorn: ✅ {uvicorn.__version__}")
        except ImportError:
            print("   uvicorn: ❌ Not installed")

        try:
            import fastapi
            print(f"   fastapi: ✅ {fastapi.__version__}")
        except ImportError:
            print("   fastapi: ❌ Not installed")
    else:
        print("   .venv: ❌ Missing (run 'uv sync' to create)")

    # Recommendations
    print("\n💡 Recommendations:")
    if is_windows_like:
        print("   - Set DEBUG_RELOAD=0 to disable auto-reload on Windows")
        print("   - Use HOST=127.0.0.1 instead of 0.0.0.0 if having binding issues")
        print("   - Consider using Windows Terminal for better experience")

    print("   - Use 'uv run debug' to start development server")
    print("   - Use 'uv run test' to run tests")
    print("   - Check firewall settings if server is not accessible")

    print("\n✅ Diagnostics complete!")
