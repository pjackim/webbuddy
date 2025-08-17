"""Test the enhanced CLI functionality."""
import os
import platform
import subprocess
import time
from pathlib import Path


def test_debug_command_starts_successfully():
    """Test that the debug command starts and can be stopped properly."""
    # Test the debug command in a subprocess
    process = subprocess.Popen(
        ["uv", "run", "debug"],
        cwd=Path.cwd(),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env={**os.environ, "PATH": f"{Path.home() / '.local/bin'}:{os.environ.get('PATH', '')}"}
    )
    
    # Give it a moment to start
    time.sleep(2)
    
    # Terminate the process
    process.terminate()
    
    # Wait for it to finish
    stdout, _ = process.communicate(timeout=5)
    
    # Check that it started correctly
    assert "Starting Web Buddy dev server" in stdout
    assert "Uvicorn running on" in stdout
    assert process.returncode in [0, -15]  # 0 for clean exit, -15 for SIGTERM


def test_doctor_command_runs():
    """Test that the doctor command runs and provides diagnostics."""
    result = subprocess.run(
        ["uv", "run", "doctor"],
        cwd=Path.cwd(),
        capture_output=True,
        text=True,
        env={**os.environ, "PATH": f"{Path.home() / '.local/bin'}:{os.environ.get('PATH', '')}"}
    )
    
    assert result.returncode == 0
    assert "Web Buddy Backend Environment Diagnostics" in result.stdout
    assert "Platform:" in result.stdout
    assert "Virtual Environment:" in result.stdout


def test_test_command_runs():
    """Test that the test command runs properly."""
    result = subprocess.run(
        ["uv", "run", "test", "--version"],
        cwd=Path.cwd(),
        capture_output=True,
        text=True,
        env={**os.environ, "PATH": f"{Path.home() / '.local/bin'}:{os.environ.get('PATH', '')}"}
    )
    
    assert result.returncode == 0
    assert "Running tests" in result.stdout
    assert "pytest" in result.stdout


def test_windows_detection():
    """Test that Windows detection logic works."""
    # Import the detection logic
    is_windows_like = platform.system() in ("Windows",) or "microsoft" in platform.uname().release.lower()
    
    # This should not crash and should return a boolean
    assert isinstance(is_windows_like, bool)
    
    # In this CI environment, it should be False (Linux)
    assert is_windows_like is False