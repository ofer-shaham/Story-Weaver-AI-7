#!/bin/bash

# Run the API server end-to-end tests using Playwright.
# Usage: ./run-e2e.sh

set -e

cd "$(dirname "$0")"

# Ensure environment variables are loaded
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "📦 Running E2E tests for @workspace/api-server..."
pnpm --filter @workspace/api-server run test:e2e
