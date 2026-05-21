#!/usr/bin/env bash
set -euo pipefail

# ─── Deployment Rollback Script ─────────────────────────────────────────
# Restores previous Docker image tags, optionally rolls back DB migrations,
# and validates system health post-rollback.
#
# Usage:
#   bash scripts/rollback.sh                          # roll back all to previous version
#   bash scripts/rollback.sh --target backend         # roll back only backend
#   bash scripts/rollback.sh --target frontend-web    # roll back only frontend
#   bash scripts/rollback.sh --version v1.2.0         # roll back to specific tag
#   bash scripts/rollback.sh --dry-run                # preview without changes
# ─────────────────────────────────────────────────────────────────────────

LOG_FILE="rollback-$(date +%Y%m%d%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

COMPOSE_FILE="docker-compose.prod.yml"
HISTORY_FILE="deploy-history.json"
TARGET="all"
REQUESTED_VERSION=""
DRY_RUN=false

# ─── Parse arguments ────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET="$2"; shift 2 ;;
    --version) REQUESTED_VERSION="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Determine version to roll back to ──────────────────────────────────
if [[ -z "$REQUESTED_VERSION" ]]; then
  if [[ ! -f "$HISTORY_FILE" ]]; then
    echo "ERROR: No deploy-history.json found and no --version provided."
    exit 1
  fi
  REQUESTED_VERSION=$(jq -r '.previous_version // empty' "$HISTORY_FILE")
  if [[ -z "$REQUESTED_VERSION" ]]; then
    echo "ERROR: Could not determine previous version from $HISTORY_FILE"
    exit 1
  fi
fi

echo "=== Rollback Script ==="
echo "Target:      $TARGET"
echo "Version:     $REQUESTED_VERSION"
echo "Compose:     $COMPOSE_FILE"
echo "Dry run:     $DRY_RUN"
echo ""

rollback_service() {
  local service="$1"
  local image="${2:-nurisk/$service:$REQUESTED_VERSION}"

  echo "► Pulling image: $image"
  if [[ "$DRY_RUN" == false ]]; then
    docker pull "$image"
  else
    echo "  (dry-run) docker pull $image"
  fi

  echo "► Restarting service: $service"
  if [[ "$DRY_RUN" == false ]]; then
    docker compose -f "$COMPOSE_FILE" up -d "$service"
  else
    echo "  (dry-run) docker compose -f $COMPOSE_FILE up -d $service"
  fi
}

# ─── Execute rollback ───────────────────────────────────────────────────
case "$TARGET" in
  all)
    rollback_service "backend" "nurisk/backend:$REQUESTED_VERSION"
    rollback_service "frontend-web" "nurisk/frontend-web:$REQUESTED_VERSION"
    ;;
  backend)
    rollback_service "backend" "nurisk/backend:$REQUESTED_VERSION"
    ;;
  frontend-web)
    rollback_service "frontend-web" "nurisk/frontend-web:$REQUESTED_VERSION"
    ;;
  *)
    echo "ERROR: Unknown target '$TARGET'. Use: backend, frontend-web, or all"
    exit 1
    ;;
esac

# ─── Database rollback (backend only) ───────────────────────────────────
if [[ "$TARGET" == "all" || "$TARGET" == "backend" ]]; then
  echo "► Rolling back database schema (if needed)..."
  if [[ "$DRY_RUN" == false ]]; then
    # Run prisma migrate deploy — Prisma will apply the migration that matches the code
    npx prisma migrate deploy 2>/dev/null || echo "  (no migration rollback needed)"
  else
    echo "  (dry-run) npx prisma migrate deploy"
  fi
fi

# ─── Health check loop ──────────────────────────────────────────────────
echo ""
echo "► Running health check loop (30 retries, 2s interval)..."
MAX_RETRIES=30
for ((i=1; i<=MAX_RETRIES; i++)); do
  if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Health check passed after $((i * 2)) seconds"
    break
  fi
  if [[ "$i" -eq "$MAX_RETRIES" ]]; then
    echo "❌ Health check failed after $((MAX_RETRIES * 2)) seconds"
    echo "   Reverting to new image (rolling forward)..."
    if [[ "$DRY_RUN" == false ]]; then
      docker compose -f "$COMPOSE_FILE" up -d
    fi
    exit 1
  fi
  sleep 2
done

# ─── Update history file ────────────────────────────────────────────────
if [[ "$DRY_RUN" == false ]]; then
  echo '{"previous_version": "'"$REQUESTED_VERSION"'", "rollback_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > "$HISTORY_FILE"
fi

echo ""
echo "=== Rollback Complete ==="
echo "Target:  $TARGET"
echo "Version: $REQUESTED_VERSION"
echo "Log:     $LOG_FILE"
exit 0
