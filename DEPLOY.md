# راهنمای استقرار روی dl193.ir

اپ دعوت به قرار روی **دامنهٔ اصلی `dl193.ir`** بالا می‌آید و جای فروشگاه
«تتو لندز» را روی این دامنه می‌گیرد.

> **فروشگاه پاک نمی‌شود.** فقط سایتش را از `sites-enabled` غیرفعال می‌کنی؛
> فایل کانفیگش در `sites-available` و سرویسش روی پورت ۳۰۰۰ دست‌نخورده
> می‌ماند. هر وقت خواستی برش گردانی، یک symlink و یک reload کافی است
> (بخش «برگرداندن فروشگاه» در انتها).

## وضعیت فعلی سرور

- `dl193.ir` پشت کلادفلر است و همین حالا **خطای ۵۲۵** می‌دهد: کلادفلر روی
  حالت Full است ولی دست‌دادن TLS با سرور شکست می‌خورد. این پیش از هر کاری
  باید حل شود، وگرنه اپ ما هم همان ۵۲۵ را می‌گیرد.
- IP مبدأ: `87.248.155.28` (از روی `date.dl193.ir` که مستقیم به همان سرور
  اشاره می‌کند).
- فروشگاه روی پورت ۳۰۰۰ اجرا می‌شود. اپ ما روی **۳۰۰۱** می‌نشیند تا تداخل
  نداشته باشند.

## پیش‌نیازها

- Node.js ۲۰ یا بالاتر (`node -v`)
- nginx
- دسترسی به پنل کلادفلر (برای حالت SSL)

## گام‌ها

### ۱. گرفتن کد

```bash
sudo mkdir -p /var/www/love-connect
sudo chown -R "$USER" /var/www/love-connect

git clone https://github.com/alirezzazm/love-connect- /var/www/love-connect
cd /var/www/love-connect
```

> اگر ترجیح می‌دهی دستی کاری نکنی، workflow گیت‌هاب همین کارها را خودش
> انجام می‌دهد. بخش «استقرار خودکار» در انتهای همین فایل.

### ۲. ساختن فایل تنظیمات

```bash
sudo cp deploy/love-connect.env.example /etc/love-connect.env
sudo nano /etc/love-connect.env
sudo chown root:root /etc/love-connect.env
sudo chmod 600 /etc/love-connect.env
```

- `AUTH_SECRET` را با `openssl rand -base64 32` بساز.
- `ADMIN_PASSWORD` را **تازه** بگذار.
- `NEXT_PUBLIC_SITE_URL` باید دقیقاً `https://dl193.ir` باشد. فقط برای لینک
  دعوت نیست؛ ریدایرکت‌های ورود به پنل هم از روی همین ساخته می‌شوند.

### ۳. نصب سرویس

مسیر node را اول چک کن — یونیت `/usr/bin/node` را صدا می‌زند:

```bash
which node        # اگر فرق داشت، ExecStart را در فایل service عوض کن
```

```bash
sudo mkdir -p /var/lib/love-connect
sudo cp deploy/love-connect.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### ۴. بیلد و راه‌اندازی سرویس

این را **قبل** از دست زدن به nginx انجام بده، تا وقتی دامنه را جابه‌جا
می‌کنی اپ از قبل بالا و آماده باشد:

```bash
sudo bash deploy/deploy.sh
sudo systemctl enable love-connect
curl -I http://127.0.0.1:3001/        # باید 200 بدهد
```

اگر اینجا ۲۰۰ نگرفتی، جلوتر نرو. `journalctl -u love-connect -n 50`.

### ۵. جابه‌جا کردن دامنه

اول ببین کدام فایل الان `dl193.ir` را در دست دارد:

```bash
grep -rl "dl193.ir" /etc/nginx/sites-enabled/
```

بعد آن را غیرفعال کن و مال ما را فعال کن:

```bash
sudo rm /etc/nginx/sites-enabled/<اسم-فایل-فروشگاه>     # فقط symlink
sudo cp deploy/nginx-love-connect.conf /etc/nginx/sites-available/love-connect
sudo ln -s /etc/nginx/sites-available/love-connect /etc/nginx/sites-enabled/

# map مربوط به وب‌سوکت. اگر از قبل چنین map ای روی سرور هست، این خط را رد کن.
sudo cp deploy/nginx-upgrade-map.conf /etc/nginx/conf.d/love-connect-upgrade-map.conf

sudo nginx -t && sudo systemctl reload nginx
```

### ۶. حل کردن مشکل SSL (خطای ۵۲۵)

یکی از این دو را انتخاب کن:

**الف) سریع‌ترین راه — کلادفلر روی Flexible**
در پنل کلادفلر: SSL/TLS → Overview → **Flexible**. کلادفلر با HTTP به سرور
وصل می‌شود و بلوک ۸۰ کافی است. سایت بلافاصله بالا می‌آید. عیبش این است که
ترافیک کلادفلر تا سرور رمزنگاری نشده می‌ماند.

**ب) درست‌ترین راه — گواهی روی سرور و کلادفلر روی Full**
در پنل کلادفلر: SSL/TLS → Origin Server → Create Certificate. فایل‌ها را
روی سرور بگذار، بلوک ۴۴۳ را در `deploy/nginx-love-connect.conf` باز کن،
مسیر گواهی را اصلاح کن و `nginx -t && systemctl reload nginx`.

> کوکی نشستِ پنل ادمین در حالت production فقط روی HTTPS فرستاده می‌شود.
> چون کلادفلر جلوی سایت است و مرورگر HTTPS می‌بیند، هر دو حالت کار می‌کنند.

### ۷. بررسی

```bash
curl -I https://dl193.ir/            # 200
curl -I https://dl193.ir/admin       # 307 به /admin/login
```

بعد برو به `https://dl193.ir/admin`، وارد شو و اولین دعوت را بساز.

## آدرس‌ها بعد از استقرار

| چه چیزی | آدرس |
| --- | --- |
| صفحهٔ معرفی | `https://dl193.ir/` |
| پنل ادمین | `https://dl193.ir/admin` |
| لینک دعوت | `https://dl193.ir/d/<کد>` |

## برگرداندن فروشگاه

```bash
sudo rm /etc/nginx/sites-enabled/love-connect
sudo ln -s /etc/nginx/sites-available/<اسم-فایل-فروشگاه> /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

دیتابیس و سرویس اپ دعوت دست‌نخورده می‌ماند؛ هر وقت خواستی دوباره برش
می‌گردانی.

## به‌روزرسانی بعدی

```bash
cd /var/www/love-connect
git pull
sudo bash deploy/deploy.sh
```

## استقرار خودکار (بدون ssh زدن دستی)

در ریپو یک workflow هست که کل استقرار را از طریق GitHub Actions انجام می‌دهد:
کد را می‌فرستد، بیلد می‌کند، سرویس را ری‌استارت می‌کند، سلامتش را تست می‌کند و
در صورت انتخاب، دامنه را هم جابه‌جا می‌کند.

یک‌بار این‌ها را انجام بده:

1. یک کلید استقرار بساز و روی سرور مجازش کن:

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/love-connect-deploy -N ""
   ssh-copy-id -i ~/.ssh/love-connect-deploy.pub <کاربر>@87.248.155.28
   ```

2. در گیت‌هاب → Settings → Secrets and variables → Actions سه سکرت بساز:
   `DEPLOY_HOST`، `DEPLOY_USER`، `DEPLOY_SSH_KEY` (محتوای کلید خصوصی).

3. `/etc/love-connect.env` را روی سرور بساز (گام ۲ بالا). رمزها هیچ‌وقت از
   گیت‌هاب فرستاده نمی‌شوند.

بعد از آن، هر بار: تب **Actions** → workflow را انتخاب کن → **Run workflow**.
بار اول هر دو گزینه را تیک بزن؛ دفعات بعد هیچ‌کدام لازم نیست.

کاربری که وارد می‌شود باید `sudo` بدون رمز داشته باشد، وگرنه اسکریپت وسط کار
منتظر رمز می‌ماند.

## نکته‌ها

**دیتابیس.** فایل SQLite در `/var/lib/love-connect/app.db` می‌ماند، بیرون از
پوشهٔ کد، تا بیلد دوباره پاکش نکند. پشتیبان:

```bash
sudo sqlite3 /var/lib/love-connect/app.db ".backup /root/love-connect-$(date +%F).db"
```

**IPv6.** خط `listen [::]:80;` پیش‌فرض کامنت است. اگر سرورت IPv6 دارد بازش
کن؛ اگر ندارد و بازش کنی، nginx با «Address family not supported by protocol»
بالا نمی‌آید.

**سرویس بالا نمی‌آید؟** اول `journalctl -u love-connect -n 50`. دو علت رایج:
مسیر اشتباه node در `ExecStart`، و نبودن `.next/standalone/server.js` (که
`deploy.sh` خودش قبلش گیر می‌دهد).

**پورت.** اگر ۳۰۰۱ اشغال است (`sudo ss -tlnp | grep 3001`)، هم در
`deploy/love-connect.service` و هم در `deploy/nginx-love-connect.conf` عوضش کن.
