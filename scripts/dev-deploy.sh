#!/bin/bash

# Development deployment script
set -e

echo "Starting Moss Stack in development mode..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "You need to create a .env file in the root directory."
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Build and start development services
echo "Building and starting development services..."
docker-compose -f docker-compose.dev.yml up --build -d

echo ""
echo "🚀 Development environment is ready!"
echo ""
echo "Services:"
echo "  📱 Frontend:  http://localhost:3000"
echo "  🔧 Backend:   http://localhost:8000"
echo "  🗄️  Database:  localhost:5432"
echo ""
echo "Default credentials:"
echo "  Email: admin@example.com"
echo "  Password: changethis"
echo ""
echo "To stop: docker-compose -f docker-compose.dev.yml down"
echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f"