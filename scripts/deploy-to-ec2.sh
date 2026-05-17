#!/usr/bin/env bash
# Build docker image on Mac, ship to EC2, deploy via docker compose.
# 用本機算力 build (Mac CPU 強)，避免 EC2 t2.micro 在 build 階段 OOM。
#
# Usage:
#   EC2_HOST=ec2-user@52.206.9.18 ./scripts/deploy-to-ec2.sh
#
# Env overrides:
#   IMAGE_NAME       — docker image tag (default: genshin-banpick:latest)
#   EC2_HOST         — ssh target, e.g. ec2-user@1.2.3.4 (REQUIRED)
#   EC2_KEY          — private key path
#   EC2_PROJECT_DIR  — repo path on EC2 (where docker-compose.yml lives)
#   PLATFORM         — target arch for build (default: linux/amd64)

set -euo pipefail

# --- Config ---
# 對齊 docker compose 自動生成的 image name (project-service:latest)
# 這樣 EC2 上的 docker-compose.yml 不需要寫 `image:` 也能找到
IMAGE_NAME="${IMAGE_NAME:-genshin-ban-pick-backend:latest}"
EC2_HOST="${EC2_HOST:?❌ EC2_HOST not set; e.g. EC2_HOST=ec2-user@98.86.73.53 $0}"
EC2_KEY="${EC2_KEY:-$HOME/Desktop/ec2_keys/aws-discord-bot-farmer-licence-key.pem}"
EC2_PROJECT_DIR="${EC2_PROJECT_DIR:-~/Genshin-Ban-Pick/Genshin-Ban-Pick}"
PLATFORM="${PLATFORM:-linux/amd64}"

TAR_NAME="$(basename ${IMAGE_NAME%:*})-$(date +%Y%m%d_%H%M%S).tgz"
LOCAL_TAR="/tmp/$TAR_NAME"

# --- Pre-flight ---
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker daemon not running. Start Docker Desktop first."
    exit 1
fi

if [[ ! -f "$EC2_KEY" ]]; then
    echo "❌ SSH key not found: $EC2_KEY"
    exit 1
fi

if ! ssh -i "$EC2_KEY" -o ConnectTimeout=5 -o BatchMode=yes "$EC2_HOST" 'echo ok' >/dev/null 2>&1; then
    echo "❌ Cannot SSH to $EC2_HOST"
    echo "   Check IP / key / network / EC2 instance state"
    exit 1
fi

# --- Build (cd 到 repo root，Dockerfile 在那) ---
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "📦 Building $IMAGE_NAME for $PLATFORM"
docker buildx build --platform "$PLATFORM" -t "$IMAGE_NAME" --load .

# --- Save ---
echo ""
echo "💾 Saving → $LOCAL_TAR"
docker save "$IMAGE_NAME" | gzip > "$LOCAL_TAR"
LOCAL_SIZE=$(ls -lh "$LOCAL_TAR" | awk '{print $5}')
echo "   $LOCAL_SIZE"

# --- Ship ---
echo ""
echo "📤 SCP → $EC2_HOST:~/$TAR_NAME"
scp -i "$EC2_KEY" "$LOCAL_TAR" "${EC2_HOST}:~/$TAR_NAME"

# --- Deploy on EC2 ---
echo ""
echo "🚀 Loading + restarting on EC2"
ssh -i "$EC2_KEY" "$EC2_HOST" bash <<EOF
    set -e
    cd $EC2_PROJECT_DIR
    echo '   [load image]'
    gunzip -c ~/$TAR_NAME | docker load
    echo '   [recreate backend]'
    docker compose up -d --no-build backend
    echo '   [cleanup tar on ec2]'
    rm ~/$TAR_NAME
    echo '   [status]'
    docker compose ps
EOF

# --- Local cleanup ---
echo ""
echo "🧹 Removing local tar"
rm "$LOCAL_TAR"

echo ""
echo "✅ Deployed $IMAGE_NAME → $EC2_HOST"
