#!/bin/bash

# Production deployment script
set -e

echo "Starting Moss Stack in production mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with production values."
    echo "Required variables: SECRET_KEY, POSTGRES_PASSWORD, etc."
    exit 1
fi

# Check if required environment variables are set
required_vars=(
    "PROJECT_NAME"
    "SECRET_KEY"
    "POSTGRES_SERVER"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "FIRST_SUPERUSER"
    "FIRST_SUPERUSER_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] && ! grep -q "^${var}=" .env; then
        echo "❌ Error: Required environment variable $var is not set in .env file"
        exit 1
    fi
done

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down

# Set production environment variables
export BUILD_TARGET=production
export NODE_ENV=production
export ENVIRONMENT=production

# Build and start production services
echo "Building and starting production services..."
docker-compose up --build -d

echo ""
echo "🚀 Production environment is ready!"
echo ""
echo "Services:"
echo "  📱 Frontend:  http://localhost:3000"
echo "  🔧 Backend:   http://localhost:8000"
echo "  🗄️  Database:  localhost:5432"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f"