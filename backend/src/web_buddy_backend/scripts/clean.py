from __future__ import annotations

import argparse
import os
import shutil
import stat
import sys
from collections.abc import Iterable
from pathlib import Path

PRUNE_DIRS = {".git", ".hg", ".svn", ".idea", ".vscode"}
TARGET_DIRS = {
    "__pycache__",
    "build",
    "dist",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
    ".tox",
    "htmlcov",
    ".benchmarks",
}
TARGET_FILE_EXTS = {".pyc", ".pyo"}
TARGET_FILE_NAMES = {".coverage", "coverage.xml", ".DS_Store", "Thumbs.db"}


def find_project_root(start: Path) -> Path:
    for p in (start, *start.parents):
        if (p / "pyproject.toml").exists():
            return p
    return start


def on_rm_error(func, path, exc_info):
    try:
        os.chmod(path, stat.S_IWRITE)
        func(path)
    except Exception:
        pass  # swallow to continue cleaning


def safe_rmtree(path: Path) -> None:
    try:
        shutil.rmtree(path, onerror=on_rm_error)
    except FileNotFoundError:
        pass
    except Exception:
        pass


def safe_unlink(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except PermissionError:
        try:
            os.chmod(path, stat.S_IWRITE)
            path.unlink(missing_ok=True)
        except Exception:
            pass
    except Exception:
        pass


def collect_targets(root: Path) -> tuple[list[Path], list[Path]]:
    dirs_to_remove: list[Path] = []
    files_to_remove: list[Path] = []

    for dirpath, dirnames, filenames in os.walk(root, topdown=True):
        # Prune directories we won't traverse into
        for d in list(dirnames):
            # Remove and mark targets
            if (
                d in TARGET_DIRS
                or d.endswith(".egg-info")
                or d == "web_buddy_backend.egg-info"
            ):
                dirs_to_remove.append(Path(dirpath) / d)
                dirnames.remove(d)
            elif d in PRUNE_DIRS:
                dirnames.remove(d)

        # File targets in this directory
        for fname in filenames:
            p = Path(dirpath) / fname
            if p.suffix in TARGET_FILE_EXTS or fname in TARGET_FILE_NAMES:
                files_to_remove.append(p)

    return dirs_to_remove, files_to_remove


def iter_print(items: Iterable[Path], prefix: str) -> None:
    for p in items:
        print(f"{prefix}: {p}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="clean", description="Clean Python build and cache artifacts."
    )
    parser.add_argument(
        "-n", "--dry-run", action="store_true", help="Show what would be removed"
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument(
        "--root",
        type=str,
        help="Directory to clean (defaults to project root discovered via pyproject.toml)",
    )
    args = parser.parse_args(argv)

    start = Path(args.root).resolve() if args.root else Path(__file__).resolve().parent
    root = find_project_root(start)

    dirs, files = collect_targets(root)

    if args.dry_run or args.verbose:
        iter_print(dirs, "DIR would remove" if args.dry_run else "DIR removing")
        iter_print(files, "FILE would remove" if args.dry_run else "FILE removing")

    if not dirs and not files:
        print(f"No artifacts found under {root}")
        return 0

    if not args.dry_run:
        for d in dirs:
            safe_rmtree(d)
        for f in files:
            safe_unlink(f)

    print(
        f"{'Would remove' if args.dry_run else 'Removed'} "
        f"{len(dirs)} director{'y' if len(dirs) == 1 else 'ies'} and "
        f"{len(files)} file{'s' if len(files) != 1 else ''} under {root}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
