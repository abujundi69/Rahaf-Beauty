#!/bin/bash
# Run this from the Rahaf-Beauty/ directory
# Requires: ssh, scp, tar — use WSL or Git Bash on Windows
set -e

SERVER="zad@194.163.168.159"
REMOTE_DIR="/home/zad/rahaf-beauty"
ARCHIVE="/tmp/rahaf-deploy.tar.gz"

echo "========================================="
echo "  RAHAF BEAUTY — Deployment"
echo "========================================="

# ── Step 1: Package (exclude heavy/generated folders) ─────────────────────────
echo ""
echo "[1/4] Packaging project files..."
tar \
  --exclude='./FrontEnd/node_modules' \
  --exclude='./FrontEnd/dist' \
  --exclude='./RahafBeauty/*/bin' \
  --exclude='./RahafBeauty/*/obj' \
  --exclude='./.git' \
  -czf "$ARCHIVE" \
  ./RahafBeauty \
  ./FrontEnd \
  ./nginx \
  ./docker-compose.yml \
  ./.env

echo "    → Archive: $ARCHIVE ($(du -sh "$ARCHIVE" | cut -f1))"

# ── Step 2: Transfer ──────────────────────────────────────────────────────────
echo ""
echo "[2/4] Transferring to $SERVER..."
ssh "$SERVER" "mkdir -p $REMOTE_DIR"
scp "$ARCHIVE" "$SERVER:/tmp/rahaf-deploy.tar.gz"

# ── Step 3: Extract on server ─────────────────────────────────────────────────
echo ""
echo "[3/4] Extracting on server..."
ssh "$SERVER" "
  tar -xzf /tmp/rahaf-deploy.tar.gz -C $REMOTE_DIR
  rm /tmp/rahaf-deploy.tar.gz
  echo '    Extraction complete'
"

# ── Step 4: Build images & start containers ───────────────────────────────────
echo ""
echo "[4/4] Building images and starting containers..."
ssh "$SERVER" "
  cd $REMOTE_DIR
  docker compose build --no-cache
  docker compose up -d
  docker compose ps
"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "========================================="
echo "  Deployment complete!"
echo ""
echo "  Site  → https://rahafbeauty.com"
echo "  API   → https://api.rahafbeauty.com"
echo "========================================="

rm -f "$ARCHIVE"
