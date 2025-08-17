.PHONY: install
install: ## Install the virtual environment and install the pre-commit hooks
	@echo "🚀 Creating virtual environment using uv"
	@uv sync
	@uv run pre-commit install

.PHONY: check
check: ## Run code quality tools.
	@echo "🚀 Checking lock file consistency with 'pyproject.toml'"
	@uv lock --locked
	@echo "🚀 Linting code: Running pre-commit"
	@uv run pre-commit run -a
	@echo "🚀 Static type checking: Running mypy"
	@uv run mypy
	@echo "🚀 Checking for obsolete dependencies: Running deptry"
	@uv run deptry src

.PHONY: test
test: ## Test the code with pytest
	@echo "🚀 Testing code: Running pytest"
	@uv run python -m pytest --cov --cov-config=pyproject.toml --cov-report=xml

.PHONY: build
build: clean-build ## Build wheel file
	@echo "🚀 Creating wheel file"
	@uvx --from build pyproject-build --installer uv

.PHONY: clean-build
clean-build: ## Clean build artifacts
	@echo "🚀 Removing build artifacts"
	@uv run python -c "import shutil; import os; shutil.rmtree('dist') if os.path.exists('dist') else None"

.PHONY: docs-test
docs-test: ## Test if documentation can be built without warnings or errors
	@uv run mkdocs build -s

.PHONY: docs
docs: ## Build and serve the documentation
	@uv run mkdocs serve

.PHONY: help
help:
	@uv run python -c "import re; \
	[[print(f'\033[36m{m[0]:<20}\033[0m {m[1]}') for m in re.findall(r'^([a-zA-Z_-]+):.*?## (.*)$$', open(makefile).read(), re.M)] for makefile in ('$(MAKEFILE_LIST)').strip().split()]"

.DEFAULT_GOAL := help


# ----- FastAPI app controls (mapped from legacy backend scripts) -----

.PHONY: start
start: ## Run FastAPI via uvicorn (factory pattern)
	@uv run uvicorn web_buddy_backend.main:create_app --factory --host 0.0.0.0 --port 8000

.PHONY: lint
lint: ## Lint using project script (ruff/pre-commit as configured)
	@uv run lint

.PHONY: format
format: ## Format using project script
	@uv run format

.PHONY: debug
debug: ## Run debug helper
	@uv run debug

.PHONY: scripts-test
scripts-test: ## Run tests via legacy script wrapper
	@uv run test

.PHONY: scripts-build
scripts-build: ## Build via legacy script wrapper
	@uv run build

.PHONY: scripts-clean
scripts-clean: ## Clean via legacy script wrapper
	@uv run clean