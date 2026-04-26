#!/bin/bash

# Story-Weaver-AI Troubleshooting Script
# This script performs detailed diagnostics and logs results

set -e  # Exit on any error

# Create logs directory if it doesn't exist
mkdir -p logs

# Log file
LOG_FILE="logs/troubleshoot-$(date +%Y%m%d-%H%M%S).log"

echo "🔍 Starting Story-Weaver-AI troubleshooting..."
echo "📝 Logging to: $LOG_FILE"

# Function to log and echo
log() {
    echo "$@" | tee -a "$LOG_FILE"
}

# Redirect all output to log file as well
exec > >(tee -a "$LOG_FILE") 2>&1

log "🔍 Starting Story-Weaver-AI troubleshooting..."
log "📝 Log file: $LOG_FILE"
log "📅 Timestamp: $(date)"
log ""

# Change to the script's directory (project root)
cd "$(dirname "$0")"

log "=== SYSTEM INFORMATION ==="
log "Current directory: $(pwd)"
log "Docker version: $(docker --version 2>/dev/null || echo 'Docker not found')"
log "Docker Compose version: $(docker compose version 2>/dev/null || echo 'Docker Compose not found')"
log ""

log "=== DOCKER COMPOSE STATUS ==="
docker compose ps
log ""

log "=== CONTAINER HEALTH CHECKS ==="
log "Database health:"
if docker compose exec -T db pg_isready -U story -d story_together >/dev/null 2>&1; then
    log "✅ Database: Healthy"
else
    log "❌ Database: Not ready"
fi

log "API connectivity:"
if curl -s --max-time 5 http://localhost:8080/api/docs >/dev/null 2>&1; then
    log "✅ API Server: Responding on port 8080"
else
    log "❌ API Server: Not responding on port 8080"
fi

log "Frontend connectivity:"
if curl -s --max-time 5 http://localhost:5173 >/dev/null 2>&1; then
    log "✅ Frontend App: Responding on port 5173"
else
    log "❌ Frontend App: Not responding on port 5173"
fi
log ""

log "=== CONTAINER LOGS ==="
log "Database logs (last 20 lines):"
docker compose logs --tail=20 db
log ""

log "API logs (last 30 lines):"
docker compose logs --tail=30 api
log ""

log "Frontend logs (last 20 lines):"
docker compose logs --tail=20 app
log ""

log "=== CONTAINER PROCESS CHECKS ==="
log "Database processes:"
docker compose exec -T db ps aux 2>/dev/null || log "Could not check database processes"
log ""

log "API processes:"
docker compose exec -T api ps aux 2>/dev/null || log "Could not check API processes"
log ""

log "Frontend processes:"
docker compose exec -T app ps aux 2>/dev/null || log "Could not check frontend processes"
log ""

log "=== NETWORKING CHECKS ==="
log "Port 8080 (API):"
netstat -tlnp 2>/dev/null | grep :8080 || ss -tlnp | grep :8080 || log "Port 8080 not found in listening sockets"
log ""

log "Port 5173 (Frontend):"
netstat -tlnp 2>/dev/null | grep :5173 || ss -tlnp | grep :5173 || log "Port 5173 not found in listening sockets"
log ""

log "Port 5432 (Database):"
netstat -tlnp 2>/dev/null | grep :5432 || ss -tlnp | grep :5432 || log "Port 5432 not found in listening sockets"
log ""

log "=== API SERVER DIAGNOSTICS ==="
log "Testing API endpoints:"
# Test basic connectivity
curl -v --max-time 10 http://localhost:8080/api/docs 2>&1 | head -20
log ""

# Test health endpoint if it exists
curl -v --max-time 5 http://localhost:8080/health 2>&1 | head -10
log ""

log "=== FILE SYSTEM CHECKS ==="
log "API server directory contents:"
docker compose exec -T api ls -la /app/artifacts/api-server 2>/dev/null || log "Could not list API directory"
log ""

log "API dist directory:"
docker compose exec -T api ls -la /app/artifacts/api-server/dist 2>/dev/null || log "Could not list dist directory"
log ""

log "Node modules check:"
docker compose exec -T api ls -la /app/node_modules 2>/dev/null | head -5 || log "Could not check node_modules"
log ""

log "=== RECOMMENDATIONS ==="
if ! curl -s --max-time 5 http://localhost:8080/api/docs >/dev/null 2>&1; then
    log "❌ API Server Issues Detected:"
    log "  1. Check API container logs above for build/startup errors"
    log "  2. Try: docker compose restart api"
    log "  3. Try: ./start-services.sh --build"
    log "  4. Check: docker compose exec api pnpm --filter @workspace/api-server run dev"
else
    log "✅ All services appear to be running correctly"
fi

log ""
log "📝 Troubleshooting log saved to: $LOG_FILE"
log "🔍 Analysis complete at: $(date)"