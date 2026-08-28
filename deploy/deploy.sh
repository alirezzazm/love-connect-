#!/usr/bin/env bash
# استقرار/به‌روزرسانی روی سرور. روی خودِ سرور اجرا می‌شود.
#
#   sudo bash deploy/deploy.sh
#
# بار اول باید /etc/love-connect.env را ساخته باشی (از روی
# deploy/love-connect.env.example) و nginx و systemd را نصب کرده باشی.
#
# مسیرها با متغیر محیطی قابل تغییرند تا اسکریپت بدون دست زدن به سیستم
# قابل آزمایش باشد:
#   APP_DIR=/tmp/x DATA_DIR=/tmp/y ENV_FILE=/tmp/z SKIP_SYSTEMD=1 bash deploy/deploy.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/love-connect}"
DATA_DIR="${DATA_DIR:-/var/lib/love-connect}"
ENV_FILE="${ENV_FILE:-/etc/love-connect.env}"
SERVICE="${SERVICE:-love-connect}"
APP_USER="${APP_USER:-www-data}"
SKIP_SYSTEMD="${SKIP_SYSTEMD:-0}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "خطا: $ENV_FILE پیدا نشد. اول از روی deploy/love-connect.env.example بسازش." >&2
  exit 1
fi

cd "$APP_DIR"

echo "==> خواندن تنظیمات"
# NEXT_PUBLIC_SITE_URL در زمان بیلد داخل باندل مرورگر جاسازی می‌شود،
# پس باید پیش از npm run build خوانده شده باشد.
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

echo "==> نصب وابستگی‌ها"
# عمداً وابستگی‌های dev هم نصب می‌شوند: بیلد به typescript، tailwindcss،
# @tailwindcss/postcss و CLI پریزما نیاز دارد. با --omit=dev بیلد روی
# globals.css می‌شکند. زمان اجرا اینها لازم نیستند، چون خروجی standalone
# نسخهٔ لازم خودش را جدا دارد.
npm ci --no-audit --no-fund || npm install --no-audit --no-fund

echo "==> کلاینت پریزما و دیتابیس"
mkdir -p "$DATA_DIR"
npx prisma generate
npx prisma db push

echo "==> بیلد"
npm run build

echo "==> جابه‌جایی فایل‌های استاتیک به خروجی standalone"
# خروجی standalone این دو را خودش کپی نمی‌کند. پاک کردن مقصد لازم است،
# وگرنه اجرای دوباره پوشه را تودرتو می‌سازد (.next/static/static).
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static
[[ -d public ]] && cp -r public .next/standalone/public

if [[ "$SKIP_SYSTEMD" == "1" ]]; then
  echo "==> از systemd صرف‌نظر شد (SKIP_SYSTEMD=1)"
  echo "تمام."
  exit 0
fi

echo "==> تنظیم مالکیت"
chown -R "$APP_USER:$APP_USER" "$APP_DIR" "$DATA_DIR"
chmod 640 "$DATA_DIR"/app.db 2>/dev/null || true

echo "==> ری‌استارت سرویس"
systemctl restart "$SERVICE"
sleep 2
systemctl --no-pager --lines=10 status "$SERVICE"

echo
echo "==> تست سلامت"
PORT="${PORT:-3001}"
curl -fsS -o /dev/null -w "صفحهٔ اصلی: HTTP %{http_code}\n" "http://127.0.0.1:${PORT}/"
echo "تمام."
