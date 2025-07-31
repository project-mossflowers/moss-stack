# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack application called "Moss Stack" - a modern web application template with FastAPI backend and React frontend, featuring authentication, dashboard functionality, and CRUD operations.

**Architecture:**
- **Backend**: Python FastAPI with SQLModel, PostgreSQL, Alembic migrations, JWT authentication
- **Frontend**: React with TypeScript, TanStack Router, TanStack Query, Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with async SQLAlchemy (asyncpg driver)
- **Deployment**: Docker Compose with multi-stage builds

## Project Structure

This is a monorepo with clear separation between frontend and backend:

```
moss-stack/
├── backend/          # FastAPI Python backend
│   ├── src/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Pydantic settings configuration
│   │   ├── database.py       # Database connection and session management
│   │   ├── core/
│   │   │   └── security.py   # JWT token handling and password hashing
│   │   ├── routes/           # API route modules by feature
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── users/        # User management endpoints
│   │   │   ├── items/        # Item CRUD endpoints
│   │   │   ├── private/      # Development-only endpoints
│   │   │   ├── deps.py       # FastAPI dependency injection
│   │   │   └── models.py     # Shared models
│   │   ├── migrations/       # Alembic database migration files
│   │   └── utils/           # Utility functions
│   ├── pyproject.toml       # Python dependencies (uv)
│   └── Dockerfile           # Multi-stage Docker build
├── frontend/         # React TypeScript frontend
│   ├── src/
│   │   ├── main.tsx         # React app entry point
│   │   ├── routes/          # File-based routing (TanStack Router)
│   │   │   ├── __root.tsx   # Root layout with providers
│   │   │   ├── _app/        # Authenticated routes
│   │   │   └── _auth/       # Authentication routes
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   └── layout/      # Layout components
│   │   ├── api/             # Auto-generated OpenAPI client
│   │   ├── hooks/           # Custom React hooks
│   │   ├── integrations/    # External service integrations
│   │   └── lib/             # Utility functions
│   ├── package.json         # Frontend dependencies (pnpm)
│   ├── Dockerfile           # Production build with Nginx
│   ├── Dockerfile.dev       # Development build
│   └── openapi-ts.config.ts # OpenAPI client generation config
├── scripts/          # Build and deployment scripts
│   ├── generate-client.sh   # Generate TypeScript API client
│   ├── dev-deploy.sh        # Development deployment
│   └── prod-deploy.sh       # Production deployment
├── docker-compose.yml       # Production deployment configuration
├── docker-compose.dev.yml   # Development deployment configuration
└── .env.example             # Environment variables template
```

## Development Commands

### Frontend (React + TypeScript)
```bash
cd frontend
pnpm install          # Install dependencies
pnpm dev              # Start development server on port 3000
pnpm build            # Build for production (includes TypeScript compilation)
pnpm test             # Run tests with Vitest
pnpm lint             # Run ESLint
pnpm format           # Run Prettier formatting
pnpm check            # Format with Prettier and fix linting issues
pnpm generate-client  # Generate OpenAPI client from backend
```

### Backend (FastAPI + Python)
```bash
cd backend
uv run fastapi dev src/main.py           # Start development server on port 8000
uv run alembic upgrade head              # Apply database migrations
uv run alembic revision --autogenerate -m "message"  # Create new migration
uv run ruff check                        # Lint code with Ruff
uv run ruff format                       # Format code with Ruff
```

### Full Stack Development
```bash
# Generate OpenAPI client (run from project root)
./scripts/generate-client.sh

# One-click development deployment (with hot reload)
./scripts/dev-deploy.sh                       

# One-click production deployment  
./scripts/prod-deploy.sh                      

# Manual Docker Compose commands
docker-compose -f docker-compose.dev.yml up --build  # Start development services
docker-compose -f docker-compose.dev.yml down        # Stop development services  
docker-compose up --build                            # Start production services
docker-compose down                                   # Stop production services
docker-compose logs -f                               # View logs
```

## Code Architecture

### Backend Structure
- **`src/main.py`**: FastAPI app entry point with CORS, Sentry, database initialization via lifespan events
- **`src/config.py`**: Pydantic settings with environment variable configuration and validation
- **`src/database.py`**: Async database connection using SQLModel and asyncpg
- **`src/routes/`**: API route modules organized by feature:
  - `auth/`: Authentication endpoints (login, token refresh)
  - `users/`: User management (registration, profile, admin operations)
  - `items/`: Item CRUD operations (create, read, update, delete)
  - `private/`: Development-only endpoints (enabled only in local environment)
  - `deps.py`: FastAPI dependency injection for database sessions and authentication
  - `root.py`: Main router that includes all feature routers
- **`src/core/security.py`**: JWT token creation/validation and password hashing with bcrypt
- **`src/migrations/`**: Alembic database migration files for schema versioning
- **`src/utils/`**: Utility functions for authentication and other common tasks

### Frontend Structure  
- **`src/main.tsx`**: React app entry point with TanStack Router setup and API client configuration
- **`src/routes/`**: File-based routing with TanStack Router:
  - `__root.tsx`: Root layout with providers and global components
  - `_app/`: Protected routes requiring authentication
  - `_auth/`: Public authentication routes (login, signup)
- **`src/components/`**: Reusable UI components:
  - `ui/`: shadcn/ui component library
  - `dashboard/`: Dashboard-specific components (charts, tables)
  - `layout/`: Layout components (sidebar, header, navigation)
- **`src/api/`**: Auto-generated OpenAPI client using `@hey-api/openapi-ts`
- **`src/hooks/`**: Custom React hooks:
  - `use-auth.tsx`: Authentication state management
  - `use-handle-error.tsx`: Centralized error handling
  - `use-mobile.tsx`: Mobile detection
- **`src/integrations/`**: External service integrations:
  - `openapi-client/config.ts`: Axios interceptors for JWT token handling
  - `tanstack-query/`: TanStack Query configuration and providers

### Key Integration Points
- **OpenAPI Code Generation**: 
  1. Backend FastAPI automatically generates OpenAPI schema
  2. `./scripts/generate-client.sh` extracts schema and generates TypeScript client
  3. Frontend uses generated client with TanStack Query for type-safe API calls
- **Authentication Flow**: 
  1. JWT tokens stored in localStorage
  2. Axios interceptors automatically add Bearer token to requests
  3. Token refresh and logout handled in `use-auth.tsx` hook
  4. Protected routes use authentication guards
- **Environment Configuration**: 
  - Backend reads from `.env` file via Pydantic settings
  - Frontend uses Vite environment variables (`VITE_API_URL`)
  - Docker Compose passes environment variables to containers

### Database Management
- **SQLModel**: Type-safe database models with Pydantic validation
- **Async Operations**: Full async/await support with asyncpg driver
- **Migrations**: Alembic handles schema versioning and migrations
- **Relationships**: Proper foreign key relationships (User -> Item)
- **Database Initialization**: Automatic table creation via FastAPI lifespan events

### Development Workflow
1. Make backend changes (models, routes, business logic)
2. Run `./scripts/generate-client.sh` to update frontend API client
3. Update frontend components to use new API endpoints
4. Create database migrations with `uv run alembic revision --autogenerate -m "description"`
5. Apply migrations with `uv run alembic upgrade head`

### Package Management
- **Frontend**: Uses `pnpm` with workspace configuration for efficient package management
- **Backend**: Uses `uv` for fast Python package management and virtual environments

### Docker Deployment
- **Multi-stage Builds**: Separate development and production stages in Dockerfiles
- **Development Configuration** (`docker-compose.dev.yml`):
  - Hot reload with volume mounts for source code
  - Development server with debugging enabled
  - Selective volume mounting to avoid node_modules conflicts
- **Production Configuration** (`docker-compose.yml`):
  - Optimized builds with Nginx serving static frontend assets
  - Production FastAPI server with proper logging
  - Health checks for all services
- **Services**:
  - `db`: PostgreSQL 17 with persistent volume
  - `backend`: FastAPI with automatic migrations and superuser creation
  - `frontend`: React (dev server) or Nginx (production)

### Key Files to Understand
- **`backend/src/routes/models.py`**: Shared models and schemas
- **`backend/src/routes/{users,items}/models.py`**: Feature-specific SQLModel definitions
- **`frontend/src/routes/__root.tsx`**: Root layout with navigation and global providers  
- **`frontend/src/hooks/use-auth.tsx`**: Complete authentication state management
- **`backend/src/routes/deps.py`**: FastAPI dependency injection patterns
- **`frontend/src/integrations/openapi-client/config.ts`**: API client configuration with auth

## Environment Setup

The application requires environment variables in a `.env` file at the project root.

### Development
Run `./scripts/dev-deploy.sh` to start development environment. The script will check for `.env` file and provide guidance if missing.

### Production
Copy `.env.example` to `.env` and update the values:

**Required Variables:**
- `PROJECT_NAME`: Application name (default: "Moss Stack")
- `SECRET_KEY`: Strong secret key for JWT tokens (change from "changethis")
- `POSTGRES_SERVER`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Database connection
- `FIRST_SUPERUSER`, `FIRST_SUPERUSER_PASSWORD`: Initial admin user credentials
- `BACKEND_CORS_ORIGINS`: Comma-separated list of allowed origins

**Optional Variables:**
- SMTP configuration for email functionality
- `SENTRY_DSN` for error monitoring
- `ENVIRONMENT`: "local", "staging", or "production"

### CRUD Implementation Example
The project includes a complete CRUD implementation for "Items" that demonstrates:
- **Create**: Dialog forms with validation using react-hook-form + Zod
- **Read**: Data tables with pagination, sorting, and filtering
- **Update**: Edit dialogs with pre-populated data
- **Delete**: Confirmation dialogs with proper error handling
- **State Management**: TanStack Query for caching and optimistic updates
- **Error Handling**: Consistent error patterns with toast notifications