FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Development stage
FROM base AS dev

# Copy source code
COPY . .

# Create scripts directory and prestart script
RUN mkdir -p scripts
RUN echo '#!/bin/bash\nset -e\necho "Running database migrations..."\nuv run alembic upgrade head\necho "Creating initial superuser..."\nuv run python -c "from src.main import create_first_superuser; create_first_superuser()"' > scripts/prestart.sh
RUN chmod +x scripts/prestart.sh

# Expose port
EXPOSE 8000

# Start development server with hot reload
CMD ["uv", "run", "fastapi", "dev", "src/main.py", "--host", "0.0.0.0", "--port", "8000"]

# Production stage
FROM base AS production

# Copy source code
COPY . .

# Create scripts directory and prestart script
RUN mkdir -p scripts
RUN echo '#!/bin/bash\nset -e\necho "Running database migrations..."\nuv run alembic upgrade head\necho "Creating initial superuser..."\nuv run python -c "from src.main import create_first_superuser; create_first_superuser()"' > scripts/prestart.sh
RUN chmod +x scripts/prestart.sh

# Expose port
EXPOSE 8000

# Start the production server
CMD ["uv", "run", "fastapi", "run", "src/main.py", "--host", "0.0.0.0", "--port", "8000"]