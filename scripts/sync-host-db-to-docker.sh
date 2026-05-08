#!/usr/bin/env bash
# Dump host Postgres DB → restore into the docker-compose postgres container.
# Useful when bootstrapping a docker env from existing local data.
#
# Usage: ./scripts/sync-host-db-to-docker.sh
#
# Override defaults via env if needed:
#   HOST_DB_USER=cyril HOST_DB_NAME=genshin_banpick \
#   DOCKER_DB_CONTAINER=genshin-banpick-db DOCKER_DB_NAME=genshin_banpick \
#   ./scripts/sync-host-db-to-docker.sh

set -euo pipefail

# --- Config (override via env) ---
HOST_DB_HOST="${HOST_DB_HOST:-localhost}"
HOST_DB_PORT="${HOST_DB_PORT:-5432}"
HOST_DB_USER="${HOST_DB_USER:-cyril}"
HOST_DB_NAME="${HOST_DB_NAME:-genshin_banpick}"

DOCKER_DB_CONTAINER="${DOCKER_DB_CONTAINER:-genshin-banpick-db}"
DOCKER_BACKEND_SERVICE="${DOCKER_BACKEND_SERVICE:-backend}"
DOCKER_DB_USER="${DOCKER_DB_USER:-postgres}"
DOCKER_DB_NAME="${DOCKER_DB_NAME:-genshin_banpick}"

# Use PG15 client to dump (forward-compat with PG14 host server)
PG_DUMP="${PG_DUMP:-/opt/homebrew/opt/postgresql@15/bin/pg_dump}"

DUMP_FILE="/tmp/${HOST_DB_NAME}_$(date +%Y%m%d_%H%M%S).backup"

# --- Pre-flight ---
if [[ ! -x "$PG_DUMP" ]]; then
    echo "❌ pg_dump not found at $PG_DUMP"
    echo "   Install postgresql@15: brew install postgresql@15"
    echo "   Or override: PG_DUMP=/path/to/pg_dump ./scripts/sync-host-db-to-docker.sh"
    exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${DOCKER_DB_CONTAINER}$"; then
    echo "❌ Docker DB container '${DOCKER_DB_CONTAINER}' is not running"
    echo "   Start it first: docker compose up -d ${DOCKER_BACKEND_SERVICE}"
    exit 1
fi

# --- Run ---
echo "📦 Dumping ${HOST_DB_USER}@${HOST_DB_HOST}:${HOST_DB_PORT}/${HOST_DB_NAME} → ${DUMP_FILE}"
"$PG_DUMP" \
    -h "$HOST_DB_HOST" -p "$HOST_DB_PORT" \
    -U "$HOST_DB_USER" -d "$HOST_DB_NAME" \
    -F c --no-owner --no-acl \
    -f "$DUMP_FILE"
echo "   $(ls -lh "$DUMP_FILE" | awk '{print $5}')"

echo "⏸  Stopping backend (release DB connections)"
docker compose stop "$DOCKER_BACKEND_SERVICE"

echo "🗑  Dropping & recreating ${DOCKER_DB_NAME} in ${DOCKER_DB_CONTAINER}"
docker exec "$DOCKER_DB_CONTAINER" psql -U "$DOCKER_DB_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS \"${DOCKER_DB_NAME}\" WITH (FORCE);" \
    -c "CREATE DATABASE \"${DOCKER_DB_NAME}\";" >/dev/null

echo "📥 Copying dump into container"
docker cp "$DUMP_FILE" "${DOCKER_DB_CONTAINER}:${DUMP_FILE}"

echo "♻️  Restoring"
docker exec "$DOCKER_DB_CONTAINER" pg_restore \
    -U "$DOCKER_DB_USER" -d "$DOCKER_DB_NAME" \
    --no-owner --no-acl \
    "$DUMP_FILE"

echo "▶️  Starting backend"
docker compose start "$DOCKER_BACKEND_SERVICE"

echo "✅ Done. Backup retained at $DUMP_FILE"
