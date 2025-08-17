# FastAPI production image using uv + uvicorn
FROM python:3.12-slim
# System dependencies for runtime libraries
RUN apt-get update && apt-get install -y --no-install-recommends libmagic1 && rm -rf /var/lib/apt/lists/*

# Install uv (package manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy lockfile and pyproject first for better caching
COPY uv.lock /app/uv.lock
COPY pyproject.toml /app/pyproject.toml

# Install dependencies (no project install yet)
RUN uv sync --frozen --no-install-project

# Copy the full project
COPY . /app

# Sync the project environment with editable install
RUN uv sync --frozen

EXPOSE 8000
ENV HOST=0.0.0.0 PORT=8000

# Use uv to run uvicorn in factory mode
CMD ["uv", "run", "uvicorn", "web_buddy_backend.main:create_app", "--host", "0.0.0.0", "--port", "8000", "--factory"]
