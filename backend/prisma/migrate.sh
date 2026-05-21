#!/usr/bin/env bash
set -euo pipefail

# ── NURisk Prisma Migration Script ─────────────────────────────
# Usage: ./migrate.sh [dev|staging|prod] [command]
# Commands: deploy (default), status, reset, create
#
# Examples:
#   ./migrate.sh dev deploy          # Deploy migrations to dev
#   ./migrate.sh staging status       # Check migration status on staging
#   ./migrate.sh prod create MyMigration  # Create a new migration on prod
# ────────────────────────────────────────────────────────────────

ENV=${1:-dev}
CMD=${2:-deploy}
NAME=${3:-}

# ── Helper: resolve env file ───────────────────────────────────
env_file() {
  case "$ENV" in
    dev)     echo ".env" ;;
    staging) echo ".env.staging" ;;
    prod)    echo ".env.production" ;;
    *)       echo "Unknown environment: $ENV"; exit 1 ;;
  esac
}

# ── Helper: resolve database URL from env file ─────────────────
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

# ── Commands ───────────────────────────────────────────────────
case "$CMD" in
  deploy)
    echo "► Deploying migrations to [$ENV]..."
    DATABASE_DIRECT_URL=$(db_url) npx prisma migrate deploy
    echo "✔ Migrations deployed to $ENV"
    ;;

  status)
    echo "► Checking migration status on [$ENV]..."
    DATABASE_DIRECT_URL=$(db_url) npx prisma migrate status
    ;;

  reset)
    echo "⚠  Resetting database on [$ENV]..."
    read -rp "Are you sure? (y/N) " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
      DATABASE_DIRECT_URL=$(db_url) npx prisma migrate reset --force
      echo "✔ Database reset on $ENV"
    else
      echo "✖ Aborted"
    fi
    ;;

  create)
    if [ -z "$NAME" ]; then
      echo "Error: migration name required. Usage: ./migrate.sh $ENV create MigrationName"
      exit 1
    fi
    echo "► Creating migration [$NAME] on [$ENV]..."
    DATABASE_DIRECT_URL=$(db_url) npx prisma migrate dev --name "$NAME"
    echo "✔ Migration $NAME created"
    ;;

  *)
    echo "Usage: $0 [dev|staging|prod] [deploy|status|reset|create] [name]"
    exit 1
    ;;
esac
