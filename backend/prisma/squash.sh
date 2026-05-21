#!/usr/bin/env bash
set -euo pipefail

# ── NURisk Prisma Migration Squash Script ──────────────────────────
# Consolidates pre-release migrations into a single baseline migration.
# Usage: ./squash.sh [dev|staging|prod] [name]
#
# Examples:
#   ./squash.sh dev init                # Squash all migrations into one named "init"
#   ./squash.sh staging baseline-v1     # Squash staging migrations into "baseline-v1"
#   ./squash.sh prod baseline-v1        # Squash prod migrations into "baseline-v1"
# ────────────────────────────────────────────────────────────────────

ENV=${1:-dev}
NAME=${2:-squashed-baseline}

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

# ── Pre-flight checks ──────────────────────────────────────────────
if ! command -v npx &> /dev/null; then
  echo "Error: npx not found. Ensure Node.js is installed."
  exit 1
fi

if [ ! -f "schema.prisma" ]; then
  echo "Error: Run this script from the prisma/ directory."
  exit 1
fi

# ── Warning ────────────────────────────────────────────────────────
MIGRATIONS_DIR="migrations"
MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -maxdepth 1 -type d ! -name "$MIGRATIONS_DIR" ! -name "migration_lock.toml" 2>/dev/null | wc -l)

echo "========================================================"
echo "  Prisma Migration Squash"
echo "  Environment: [$ENV]"
echo "  Squash name: [$NAME]"
echo "  Migrations to consolidate: $MIGRATION_COUNT"
echo "========================================================"
echo ""
echo "⚠  WARNING: This will consolidate all existing migrations"
echo "   into a single migration file. This operation is"
echo "   DESTRUCTIVE and should only be done:"
echo "   - Before the first production release"
echo "   - When all target databases have been migrated"
echo "   - After coordinating with the entire team"
echo ""
read -rp "Are you sure you want to squash? (y/N) " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "✖ Squash aborted."
  exit 0
fi

# ── Run squash ─────────────────────────────────────────────────────
echo ""
echo "► Running prisma migrate squash..."
DATABASE_DIRECT_URL=$(db_url) npx prisma migrate squash --name "$NAME"

if [ $? -ne 0 ]; then
  echo "✖ Squash failed. Check the error above."
  exit 1
fi

echo ""
echo "✔ Squash complete! New baseline migration created: $NAME"
echo ""
echo "Next steps:"
echo "  1. Review the generated migration SQL in:"
echo "     $MIGRATIONS_DIR/*_${NAME}/migration.sql"
echo "  2. Run './migrate.sh $ENV deploy' to apply to $ENV"
echo "  3. Run './migrate.sh $ENV status' to verify"
echo "  4. Commit the squashed migration to version control"
echo ""
echo "To rollback if needed:"
echo "  npx prisma migrate resolve --rolled-back <migration_name>"
