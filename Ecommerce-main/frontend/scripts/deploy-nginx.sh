#!/usr/bin/env bash
set -euo pipefail

# Build de producción
echo "[1/3] Building…"
npm run build

# Ruta destino del sitio (ajusta si quieres)
DEST=/var/www/so-frontend/dist
sudo mkdir -p "$DEST"
sudo rsync -a --delete dist/ "$DEST"/

echo "[2/3] Escribiendo bloque de servidor Nginx…"
read -r -d '' SERVER_BLOCK <<'NGINX'
server {
  listen 80;
  server_name _;
  root /var/www/so-frontend/dist;
  index index.html;
  location / {
    try_files $uri /index.html;
  }
}
NGINX

echo "$SERVER_BLOCK" | sudo tee /etc/nginx/sites-available/so-frontend >/dev/null
sudo ln -sf /etc/nginx/sites-available/so-frontend /etc/nginx/sites-enabled/so-frontend
sudo nginx -t
sudo systemctl reload nginx

echo "[3/3] Deploy OK"