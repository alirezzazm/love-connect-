#!/usr/bin/env bash
# استقرار/به‌روزرسانی روی سرور. روی خودِ سرور اجرا می‌شود.
#
#   sudo bash deploy/deploy.sh
#
# بار اول باید /etc/love-connect.env را ساخته باشی (از روی
# deploy/love-connect.env.example) و nginx و systemd را نصب کرده باشی.

set -euo pipefail

APP_DIR="/var/www/love-connect"
DATA_DIR="/var/lib/love-connect"
ENV_FILE="/etc/love-connect.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "خطا: $ENV_FILE پیدا نشد. اول از روی deploy/love-connect.env.example بسازش." >&2
  exit 1
fi

echo "==> نصب وابستگی‌ها"
cd "$APP_DIR"
npm ci --omit=dev --no-audit --no-fund || npm install --no-audit --no-fund

echo "==> ساخت دیتابیس و کلاینت Prisma"
mkdir -p "$DATA_DIR"
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a
npx prisma generate
npx prisma db push

echo "==> بیلد"
npm run build

echo "==> جابه‌جایی فایل‌های استاتیک به خروجی standalone"
# خروجی standalone این دو را خودش کپی نمی‌کند
cp -r .next/static .next/standalone/.next/static
[[ -d public ]] && cp -r public .next/standalone/public

echo "==> تنظیم مالکیت"
chown -R www-data:www-data "$APP_DIR" "$DATA_DIR"
chmod 640 "$DATA_DIR"/app.db 2>/dev/null || true

echo "==> ری‌استارت سرویس"
systemctl restart love-connect
sleep 2
systemctl --no-pager --lines=10 status love-connect

echo
echo "==> تست سلامت"
curl -fsS -o /dev/null -w "صفحهٔ اصلی: HTTP %{http_code}\n" http://127.0.0.1:3001/
echo "تمام."
