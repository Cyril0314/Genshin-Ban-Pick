#!/usr/bin/env bash
# Sync the EC2 *docker* Postgres (production) → the local docker-compose postgres container.
#
# The EC2 genshin stack is normally left `down`, so this script will bring the
# remote `postgres` service up on demand (backend is NOT started — no migrations
# run), dump from inside the container over SSH, restore into the local docker
# DB, then put the remote stack back the way it was found.
#
# Why dump *inside* the container instead of over an SSH tunnel: the container's
# `postgres` superuser is reachable via `docker exec` with no password (local
# socket), so we avoid both a second SSH tunnel and prod-credential handling.
#
# Usage: ./scripts/sync-ec2-db-to-docker.sh
#
# Override defaults via env if needed:
#   EC2_HOST=ec2-user@1.2.3.4 EC2_SSH_KEY=~/keys/foo.pem \
#   EC2_POSTGRES_STOP=no ./scripts/sync-ec2-db-to-docker.sh

set -euo pipefail

# --- EC2 (source) config ---
EC2_SSH_KEY="${EC2_SSH_KEY:-$HOME/Desktop/ec2_keys/aws-discord-bot-farmer-licence-key.pem}"
EC2_HOST="${EC2_HOST:-ec2-user@98.86.73.53}"
EC2_PROJECT_DIR="${EC2_PROJECT_DIR:-~/Genshin-Ban-Pick/Genshin-Ban-Pick}"
EC2_DB_CONTAINER="${EC2_DB_CONTAINER:-genshin-banpick-db}"
EC2_DB_SERVICE="${EC2_DB_SERVICE:-postgres}"
EC2_DB_USER="${EC2_DB_USER:-postgres}"
EC2_DB_NAME="${EC2_DB_NAME:-genshin_banpick}"

# After dumping, stop the remote postgres if THIS script started it:
#   auto (default) — stop only if we brought it up; leave it if it was already running
#   yes            — always stop after
#   no             — always leave running
EC2_POSTGRES_STOP="${EC2_POSTGRES_STOP:-auto}"

# --- Local (target) config ---
DOCKER_DB_CONTAINER="${DOCKER_DB_CONTAINER:-genshin-banpick-db}"
DOCKER_BACKEND_SERVICE="${DOCKER_BACKEND_SERVICE:-backend}"
DOCKER_BACKEND_CONTAINER="${DOCKER_BACKEND_CONTAINER:-genshin-banpick-backend}"
DOCKER_DB_USER="${DOCKER_DB_USER:-postgres}"
DOCKER_DB_NAME="${DOCKER_DB_NAME:-genshin_banpick}"

DUMP_FILE="/tmp/${EC2_DB_NAME}_ec2_$(date +%Y%m%d_%H%M%S).backup"

SSH=(ssh -i "$EC2_SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$EC2_HOST")

# remote-compose <args...> — run `docker compose` in the project dir (v2 plugin, no sudo)
remote_compose() {
    "${SSH[@]}" "cd $EC2_PROJECT_DIR && docker compose $*"
}

STARTED_BY_US=0

cleanup() {
    # Stop the remote postgres if we were the ones who started it (policy permitting).
    if [[ "$STARTED_BY_US" == "1" ]]; then
        case "$EC2_POSTGRES_STOP" in
            no)
                echo "🟢 Leaving EC2 ${EC2_DB_SERVICE} running (EC2_POSTGRES_STOP=no)" ;;
            *)
                echo "⏹  Stopping EC2 ${EC2_DB_SERVICE} (restoring prior state)"
                remote_compose stop "$EC2_DB_SERVICE" >/dev/null 2>&1 || true ;;
        esac
    fi
}
trap cleanup EXIT

# --- Pre-flight ---
if [[ ! -r "$EC2_SSH_KEY" ]]; then
    echo "❌ SSH key not readable at $EC2_SSH_KEY"
    echo "   Override: EC2_SSH_KEY=/path/to/key.pem ./scripts/sync-ec2-db-to-docker.sh"
    exit 1
fi

if ! "${SSH[@]}" true 2>/dev/null; then
    echo "❌ Cannot SSH to $EC2_HOST"
    exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${DOCKER_DB_CONTAINER}$"; then
    echo "❌ Local docker DB container '${DOCKER_DB_CONTAINER}' is not running"
    echo "   Start it first: docker compose up -d ${DOCKER_BACKEND_SERVICE}"
    exit 1
fi

# --- Ensure remote postgres is up ---
if "${SSH[@]}" "docker ps --format '{{.Names}}' | grep -q '^${EC2_DB_CONTAINER}\$'" 2>/dev/null; then
    echo "🟢 EC2 ${EC2_DB_SERVICE} already running — leaving it as is"
else
    echo "🟡 EC2 ${EC2_DB_SERVICE} is down — bringing it up (backend untouched, no migrations)"
    remote_compose up -d "$EC2_DB_SERVICE"
    STARTED_BY_US=1
    echo "⏳ Waiting for EC2 ${EC2_DB_CONTAINER} to accept connections"
    if ! "${SSH[@]}" "for i in \$(seq 1 30); do docker exec ${EC2_DB_CONTAINER} pg_isready -U ${EC2_DB_USER} -d ${EC2_DB_NAME} >/dev/null 2>&1 && exit 0; sleep 1; done; exit 1"; then
        echo "❌ EC2 ${EC2_DB_CONTAINER} did not become ready in time"
        exit 1
    fi
fi

# --- Dump from inside the EC2 container, stream over SSH ---
echo "📦 Dumping EC2 ${EC2_DB_CONTAINER}:${EC2_DB_NAME} → ${DUMP_FILE}"
"${SSH[@]}" "docker exec ${EC2_DB_CONTAINER} pg_dump -U ${EC2_DB_USER} -d ${EC2_DB_NAME} -F c --no-owner --no-acl" > "$DUMP_FILE"
DUMP_SIZE=$(wc -c < "$DUMP_FILE")
if [[ "$DUMP_SIZE" -lt 1024 ]]; then
    echo "❌ Dump looks empty (${DUMP_SIZE} bytes) — aborting before touching local DB"
    exit 1
fi
echo "   $(ls -lh "$DUMP_FILE" | awk '{print $5}')"

# --- Restore into local docker ---
# Only touch the local backend if it was already running as a docker container.
# When the backend is run via `npm run dev` (native tsx) there is no container to
# stop, and we must NOT `start` one afterwards — that would grab port 3000 and
# collide with the dev server. DROP ... WITH (FORCE) clears connections either way.
LOCAL_BACKEND_WAS_RUNNING=0
if docker ps --format '{{.Names}}' | grep -q "^${DOCKER_BACKEND_CONTAINER}$"; then
    LOCAL_BACKEND_WAS_RUNNING=1
    echo "⏸  Stopping local backend container (release DB connections)"
    docker compose stop "$DOCKER_BACKEND_SERVICE" >/dev/null 2>&1 || true
else
    echo "ℹ️  Local docker backend not running — DROP ... WITH FORCE will clear connections"
fi

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

if [[ "$LOCAL_BACKEND_WAS_RUNNING" == "1" ]]; then
    echo "▶️  Restarting local backend container"
    docker compose start "$DOCKER_BACKEND_SERVICE" >/dev/null 2>&1 || true
fi

echo "✅ Done. Backup retained at $DUMP_FILE"
# (cleanup trap stops the remote postgres if we started it)
