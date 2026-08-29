# راهنمای استقرار روی سرور dl193.ir

> **هشدار:** `dl193.ir` همین حالا فروشگاه «تتو لندز» را سرو می‌کند (Next.js پشت
> Cloudflare، روی پورت ۳۰۰۰). این راهنما اپ دعوت را روی **زیردامنهٔ**
> `date.dl193.ir` و **پورت ۳۰۰۱** بالا می‌آورد تا به فروشگاه دست نخورد.
> اگر می‌خواهی جای دیگری بنشیند، `server_name` در فایل nginx و
> `NEXT_PUBLIC_SITE_URL` را عوض کن.

## پیش‌نیازها روی سرور

- Node.js ۲۰ یا بالاتر (`node -v`)
- nginx
- در Cloudflare یک رکورد `A` برای `date` به IP همان سرور (پروکسی روشن، ابر نارنجی)

## گام‌ها

### ۱. گرفتن کد

```bash
sudo mkdir -p /var/www/love-connect
sudo chown -R "$USER" /var/www/love-connect
git clone <آدرس-ریپو> /var/www/love-connect
cd /var/www/love-connect
```

### ۲. ساختن فایل تنظیمات

```bash
sudo cp deploy/love-connect.env.example /etc/love-connect.env
sudo nano /etc/love-connect.env      # مقادیر را پر کن
sudo chown root:root /etc/love-connect.env
sudo chmod 600 /etc/love-connect.env
```

`AUTH_SECRET` را با `openssl rand -base64 32` بساز. رمز ادمین را **تازه** بگذار،
نه همانی که در محیط توسعه بوده.

### ۳. نصب سرویس و nginx

اول مسیر node را چک کن — یونیت پیش‌فرض `/usr/bin/node` را صدا می‌زند و روی
سرورهایی که node با nvm نصب شده مسیر فرق دارد:

```bash
which node        # اگر /usr/bin/node نبود، ExecStart را در فایل service عوض کن
```


```bash
sudo mkdir -p /var/lib/love-connect
sudo cp deploy/love-connect.service /etc/systemd/system/
sudo systemctl daemon-reload

sudo cp deploy/nginx-love-connect.conf /etc/nginx/sites-available/love-connect
sudo ln -s /etc/nginx/sites-available/love-connect /etc/nginx/sites-enabled/

# map مربوط به وب‌سوکت. اگر روی این سرور از قبل چنین map ای هست (مثلاً برای
# فروشگاه)، این خط را رد کن — nginx از تعریف تکراری خطا می‌گیرد.
sudo cp deploy/nginx-upgrade-map.conf /etc/nginx/conf.d/love-connect-upgrade-map.conf

sudo nginx -t && sudo systemctl reload nginx
```

### ۴. بیلد و راه‌اندازی

```bash
sudo bash deploy/deploy.sh
sudo systemctl enable love-connect
```

### ۵. بررسی

```bash
curl -I http://127.0.0.1:3001/          # باید 200 بدهد
curl -I https://date.dl193.ir/          # از بیرون
journalctl -u love-connect -f           # لاگ زنده
```

بعد برو به `https://date.dl193.ir/admin`، وارد شو و اولین دعوت را بساز.

## به‌روزرسانی بعدی

```bash
cd /var/www/love-connect
git pull
sudo bash deploy/deploy.sh
```

## نکته‌های مهم

**دیتابیس.** فایل SQLite در `/var/lib/love-connect/app.db` می‌ماند، بیرون از
پوشهٔ کد، تا `git pull` و بیلد دوباره پاکش نکند. برای پشتیبان:

```bash
sudo sqlite3 /var/lib/love-connect/app.db ".backup /root/love-connect-$(date +%F).db"
```

**`NEXT_PUBLIC_SITE_URL` را حتماً درست بگذار.** فقط برای ساختن لینک دعوت نیست؛
ریدایرکت‌های ورود به پنل هم از روی همین ساخته می‌شوند. اگر خالی یا اشتباه باشد،
اپ به هدرهای `X-Forwarded-*` برمی‌گردد و اگر آن‌ها هم نباشند کاربر بعد از ورود به
آدرس داخلی سرور (`127.0.0.1:3001`) پرت می‌شود.

**کوکی و HTTPS.** در حالت production کوکی نشست فقط روی HTTPS فرستاده می‌شود.
چون Cloudflare جلوی سایت است، مرورگر HTTPS می‌بیند و مشکلی نیست — ولی حالت SSL
در Cloudflare باید **Full** باشد، نه Flexible، وگرنه ممکن است حلقهٔ ریدایرکت
بخوری.

**سرویس بالا نمی‌آید؟** اول `journalctl -u love-connect -n 50` را ببین.
دو علت رایج: مسیر اشتباه node در `ExecStart`، و نبودن `.next/standalone/server.js`
(که `deploy.sh` خودش قبلش گیر می‌دهد).

**IPv6.** خط `listen [::]:80;` در کانفیگ nginx به‌صورت پیش‌فرض کامنت است. اگر
سرورت IPv6 دارد بازش کن؛ اگر ندارد و بازش کنی، nginx با
«Address family not supported by protocol» بالا نمی‌آید.

**پورت.** اگر ۳۰۰۱ روی سرور اشغال است (`sudo ss -tlnp | grep 3001`)، هم در
`deploy/love-connect.service` و هم در `deploy/nginx-love-connect.conf` عوضش کن.

**اگر خواستی روی همان `dl193.ir` و زیر یک مسیر باشد** (مثلاً `dl193.ir/date`)،
به `basePath: "/date"` در `next.config.ts` نیاز داری و باید در nginx فروشگاه یک
`location /date/` اضافه شود. زیردامنه ساده‌تر و کم‌ریسک‌تر است.
