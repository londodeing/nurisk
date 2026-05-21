#!/usr/bin/env bash
set -euo pipefail

# ── NURisk Squash Test Script ──────────────────────────────────────
# Tests that squashed migrations deploy cleanly on a fresh database.
# Usage: ./test-squash.sh [dev|staging|prod]
#
# Prerequisites:
#   - A running PostgreSQL instance with DATABASE_DIRECT_URL set
#   - The target database is a disposable test/staging database
# ────────────────────────────────────────────────────────────────────

ENV=${1:-dev}

echo "========================================================"
echo "  Squash Test - Clean Database Deployment"
echo "  Environment: [$ENV]"
echo "========================================================"

# ── Helper: resolve env file ───────────────────────────────────────
env_file() {
  case "$ENV" in
    dev)     echo ".env" ;;
    staging) echo ".env.staging" ;;
    prod)    echo ".env.production" ;;
    *)       echo "Unknown environment: $ENV"; exit 1 ;;
  esac
}

db_url() {
  local file
  file=$(env_file)
  if [ -f "$file" ]; then
    grep -E '^DATABASE_DIRECT_URL=' "$file" | cut -d= -f2-
  else
    echo "Error: $file not found" >&2
    exit 1
  fi
}

if [ ! -f "schema.prisma" ]; then
  echo "Error: Run this script from the prisma/ directory."
  exit 1
fi

# ── Step 1: Reset database (destructive!) ──────────────────────────
echo ""
echo "STEP 1/3: Resetting database to clean state..."
echo "⚠  WARNING: This will DESTROY all data in the target database!"
read -rp "Continue? (y/N) " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "✖ Test aborted."
  exit 0
fi

DATABASE_DIRECT_URL=$(db_url) npx prisma migrate reset --force --skip-generate
echo "✔ Database reset complete."

# ── Step 2: Deploy migrations ─────────────────────────────────────
echo ""
echo "STEP 2/3: Deploying migrations with prisma migrate deploy..."
DATABASE_DIRECT_URL=$(db_url) npx prisma migrate deploy
echo "✔ Migrations deployed successfully."

# ── Step 3: Verify status ──────────────────────────────────────────
echo ""
echo "STEP 3/3: Verifying migration status..."
DATABASE_DIRECT_URL=$(db_url) npx prisma migrate status

echo ""
echo "========================================================"
echo "  Squash test complete!"
echo "  All migrations deployed successfully to clean database."
echo "========================================================"
echo ""
echo "To tear down the test database:"
echo "  DATABASE_DIRECT_URL=\$(db_url) npx prisma migrate reset --force"
