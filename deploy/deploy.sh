#!/usr/bin/env bash
# Pozitif Lig - VPS deploy/güncelleme script'i
# Kullanım: ./deploy.sh   (ilk kurulumdan sonra güncellemeler için de aynı script kullanılır)
set -euo pipefail

REPO_URL="https://github.com/devrankacan/pozitiflig.git"
BRANCH="claude/pozitif-lig-website-9av9tk"
APP_DIR="/var/www/pozitiflig"
REPO_DIR="$APP_DIR/repo"
RELEASE_DIR="$APP_DIR/current"
SERVICE_NAME="pozitiflig"

echo "==> Kod indiriliyor/güncelleniyor ($BRANCH)"
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
else
  git -C "$REPO_DIR" fetch origin "$BRANCH"
  git -C "$REPO_DIR" checkout "$BRANCH"
  git -C "$REPO_DIR" reset --hard "origin/$BRANCH"
fi

cd "$REPO_DIR"

echo "==> Bağımlılıklar kuruluyor"
npm ci

echo "==> Build alınıyor"
npm run build

echo "==> Standalone çıktı hazırlanıyor"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
cp -r .next/standalone/. "$RELEASE_DIR/"
cp -r public "$RELEASE_DIR/public"
mkdir -p "$RELEASE_DIR/.next"
cp -r .next/static "$RELEASE_DIR/.next/static"

echo "==> Servis yeniden başlatılıyor"
sudo systemctl restart "$SERVICE_NAME"

sleep 2
if curl -fsS -o /dev/null "http://127.0.0.1:3410/"; then
  echo "==> Servis ayakta (http://127.0.0.1:3410/ -> 200)"
else
  echo "==> UYARI: servis 3410 portunda yanıt vermiyor, 'sudo systemctl status $SERVICE_NAME' ile kontrol et"
fi

echo "==> Tamamlandı: https://pozitiflig.taslak.site"
