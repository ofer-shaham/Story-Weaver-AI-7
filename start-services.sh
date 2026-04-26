#!/bin/bash

# Story-Weaver-AI Project Startup Script
# This script starts all services using Docker Compose in daemon mode
# Usage: ./start-services.sh [--build]  # Use --build to force rebuild

set -e  # Exit on any error

# Create logs directory if it doesn't exist
mkdir -p logs

# Log file
LOG_FILE="logs/startup-$(date +%Y%m%d-%H%M%S).log"

# Redirect all output to log file as well
exec > >(tee -a "$LOG_FILE") 2>&1

# Function to log messages
log() {
    echo "$@"
}

log "🚀 Starting Story-Weaver-AI services..."
log "📝 Log file: $LOG_FILE"

# Change to the script's directory (project root)
cd "$(dirname "$0")"

# Check for build flag
BUILD_FLAG=""
if [ "$1" = "--build" ]; then
    BUILD_FLAG="--build"
    log "🔨 Force rebuild enabled"
fi

# Start services in daemon mode
log "📦 Starting services (will build only if needed)..."
docker compose up -d $BUILD_FLAG

# Wait a moment for services to initialize
log "⏳ Waiting for services to initialize..."
sleep 10

# Check service status
log "📊 Checking service status..."
docker compose ps

# Verify services are healthy
log "🔍 Verifying services..."

# Check if database is healthy
if docker compose exec -T db pg_isready -U story -d story_together >/dev/null 2>&1; then
    log "✅ Database: Healthy"
else
    log "❌ Database: Not ready"
fi

# Check if API is responding
if curl -s --max-time 5 http://localhost:8080/api/docs >/dev/null 2>&1; then
    log "✅ API Server: Running (http://localhost:8080)"
else
    log "❌ API Server: Not responding"
fi

# Check if app is responding
if curl -s --max-time 5 http://localhost:5173 >/dev/null 2>&1; then
    log "✅ Frontend App: Running (http://localhost:5173)"
else
    log "❌ Frontend App: Not responding"
fi

log ""
log "🎉 Services started successfully!"
log ""
log "Access points:"
log "  • API Documentation: http://localhost:8080/api/docs"
log "  • Story Weaver App:   http://localhost:5173"
log ""
log "Commands:"
log "  • View logs: docker compose logs -f"
log "  • Stop services: docker compose down"
log "  • Restart services: docker compose restart"
log "  • Force rebuild: ./start-services.sh --build"
log ""
log "📝 Startup log saved to: $LOG_FILE"