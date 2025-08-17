# web-buddy-backend

[![Release](https://img.shields.io/github/v/release/mort-sh/web-buddy-backend)](https://img.shields.io/github/v/release/mort-sh/web-buddy-backend)
[![Build status](https://img.shields.io/github/actions/workflow/status/mort-sh/web-buddy-backend/main.yml?branch=main)](https://github.com/mort-sh/web-buddy-backend/actions/workflows/main.yml?query=branch%3Amain)
[![codecov](https://codecov.io/gh/mort-sh/web-buddy-backend/branch/main/graph/badge.svg)](https://codecov.io/gh/mort-sh/web-buddy-backend)
[![Commit activity](https://img.shields.io/github/commit-activity/m/mort-sh/web-buddy-backend)](https://img.shields.io/github/commit-activity/m/mort-sh/web-buddy-backend)
[![License](https://img.shields.io/github/license/mort-sh/web-buddy-backend)](https://img.shields.io/github/license/mort-sh/web-buddy-backend)

This is a template repository for Python projects that use uv for their dependency management.

- **Github repository**: <https://github.com/mort-sh/web-buddy-backend/>
- **Documentation** <https://mort-sh.github.io/web-buddy-backend/>

## Getting started with your project

### 1. Create a New Repository

First, create a repository on GitHub with the same name as this project, and then run the following commands:

```bash
git init -b main
git add .
git commit -m "init commit"
git remote add origin git@github.com:mort-sh/web-buddy-backend.git
git push -u origin main
```

### 2. Set Up Your Development Environment

Then, install the environment and the pre-commit hooks with

```bash
make install
```

This will also generate your `uv.lock` file

### 3. Run the pre-commit hooks

Initially, the CI/CD pipeline might be failing due to formatting issues. To resolve those run:

```bash
uv run pre-commit run -a
```

### 4. Commit the changes

Lastly, commit the changes made by the two steps above to your repository.

```bash
git add .
git commit -m 'Fix formatting issues'
git push origin main
```

You are now ready to start development on your project!
The CI/CD pipeline will be triggered when you open a pull request, merge to main, or when you create a new release.

To finalize the set-up for publishing to PyPI, see [here](https://fpgmaas.github.io/cookiecutter-uv/features/publishing/#set-up-for-pypi).
For activating the automatic documentation with MkDocs, see [here](https://fpgmaas.github.io/cookiecutter-uv/features/mkdocs/#enabling-the-documentation-on-github).
To enable the code coverage reports, see [here](https://fpgmaas.github.io/cookiecutter-uv/features/codecov/).

## Releasing a new version



---

Repository initiated with [fpgmaas/cookiecutter-uv](https://github.com/fpgmaas/cookiecutter-uv).

## Running the API locally

- Start (no reload):

	```powershell
	uv run start
	```

- Debug (auto-reload):

	```powershell
	# On Windows, reload is off by default to keep Ctrl+C working; enable with an env var if needed
	$env:DEBUG_RELOAD = "1"; uv run debug
	```

The server binds to `127.0.0.1:8000` by default. Visit http://localhost:8000/docs.

If Ctrl+C doesn’t stop the dev server on Windows PowerShell, prefer the non-reload mode (`uv run start`), or close the terminal. You can also set `DEBUG_RELOAD=0` to disable reload.
