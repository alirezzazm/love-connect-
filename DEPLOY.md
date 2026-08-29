# راهنمای استقرار روی dl193.ir

اپ دعوت به قرار روی **دامنهٔ اصلی `dl193.ir`** بالا می‌آید و جای فروشگاه
«تتو لندز» را روی این دامنه می‌گیرد.

> **فروشگاه پاک نمی‌شود.** فقط سایتش را از `sites-enabled` غیرفعال می‌کنی؛
> فایل کانفیگش در `sites-available` و سرویسش روی پورت ۳۰۰۰ دست‌نخورده
> می‌ماند. هر وقت خواستی برش گردانی، یک symlink و یک reload کافی است
> (بخش «برگرداندن فروشگاه» در انتها).

## وضعیت واقعی سرور

> این بخش پس از استقرار واقعی روی سرور بازنویسی شد. نسخهٔ قبلی چند فرض
> نادرست داشت که در عمل غلط از آب درآمدند.

- IP مبدأ: `87.248.155.28`. سرور **IPv6 عمومی ندارد** و IPv6 خروجی هم کار
  نمی‌کند — این نکته در بخش SSL مهم می‌شود.
- ssh روی پورت **۹۰۱۱** است، نه ۲۲. برای workflow گیت‌هاب باید سکرت
  `DEPLOY_PORT` را روی `9011` بگذاری.
- **فروشگاه روی `dl193.ir` نیست.** روی `tattoolandz.ir` است، با گواهی
  Let's Encrypt جدا، و backend اش روی پورت **۳۲۰۰** (نه ۳۰۰۰). یعنی هیچ
  دامنه‌ای از فروشگاه گرفته نمی‌شود و لازم نیست symlink اش برداشته شود.
  گزینهٔ `switch_nginx` در workflow چیزی برای غیرفعال کردن پیدا نمی‌کند و
  فقط سایت ما را اضافه می‌کند.
- اپ ما روی **۳۰۰۱** می‌نشیند (آزاد بود).
- **علت خطای ۵۲۵ این بود:** فایل `/etc/nginx/conf.d/00-default-deny.conf`
  یک `default_server` دارد که هر hostname ناشناخته را می‌گیرد و روی HTTPS
  با `ssl_reject_handshake on` عمداً دست‌دادن TLS را رد می‌کند. چون هیچ
  بلوکی `dl193.ir` را ادعا نمی‌کرد، درخواست‌های کلادفلر همان‌جا رد می‌شدند.
  به محض اینکه یک بلوک با `server_name dl193.ir` اضافه شد، مشکل حل شد —
  ربطی به خرابیِ گواهی نداشت.

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
grep -Rl "dl193.ir" /etc/nginx/sites-enabled/
```

> `-R` باشد نه `-r`: محتویات `sites-enabled` همه symlink است و `grep -r`
> در پیمایش بازگشتی از symlink رد می‌شود، پس با `-r` خروجی همیشه خالی است.

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

> ### ⚠️ Let's Encrypt روی این دامنه کار نمی‌کند
>
> امتحان شد و دوبار شکست خورد. علتش این است: `dl193.ir` پشت کلادفلر
> پروکسی می‌شود، Let's Encrypt چالش را از چند نقطهٔ مختلف — از جمله
> **IPv6** — بررسی می‌کند، و این سرور IPv6 ندارد. آن درخواست‌ها به
> کلادفلر می‌رسند ولی کلادفلر نمی‌تواند مبدأ را بگیرد و **۵۲۲** برمی‌گرداند،
> پس اعتبارسنجی رد می‌شود:
>
> ```
> Detail: 2606:4700:3034::6815:4ed2: Invalid response from
>         http://dl193.ir/.well-known/acme-challenge/... : 522
> ```
>
> (`tattoolandz.ir` گواهی Let's Encrypt دارد چون پروکسی نیست و اعتبارسنجی
> مستقیم روی IPv4 به سرور می‌رسد.)
>
> راه‌های کارآمد: گواهی Origin کلادفلر (گزینهٔ ب)، یا موقتاً ابر آن رکورد
> را در کلادفلر خاکستری کن (DNS only)، `certbot` را بزن، بعد دوباره
> نارنجی‌اش کن.
>
> **الان روی سرور چه چیزی نصب است:** یک گواهی self-signed ده‌ساله در
> `/etc/ssl/cloudflare/dl193.ir.pem`. کلادفلر روی حالت **Full** آن را
> می‌پذیرد و سایت کار می‌کند. برای رفتن به **Full (strict)** همان دو فایل
> را با گواهی Origin جایگزین کن و `systemctl reload nginx` بزن — مسیرها
> عوض نمی‌شوند.

**الف) سریع‌ترین راه — کلادفلر روی Flexible**
در پنل کلادفلر: SSL/TLS → Overview → **Flexible**. کلادفلر با HTTP به سرور
وصل می‌شود و بلوک ۸۰ کافی است. سایت بلافاصله بالا می‌آید. عیبش این است که
ترافیک کلادفلر تا سرور رمزنگاری نشده می‌ماند.

**ب) درست‌ترین راه — گواهی Origin روی سرور و کلادفلر روی Full (strict)**

در پنل کلادفلر: SSL/TLS → Origin Server → **Create Certificate**. دو متن
می‌دهد؛ روی سرور بگذارشان:

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/dl193.ir.pem    # ← Origin Certificate
sudo nano /etc/ssl/cloudflare/dl193.ir.key    # ← Private Key
sudo chmod 600 /etc/ssl/cloudflare/dl193.ir.key
sudo chown root:root /etc/ssl/cloudflare/*
```

> کلید خصوصی فقط همان یک بار در پنل نشان داده می‌شود. اگر صفحه را ببندی
> باید گواهی تازه بسازی.

بعد بلوک HTTPS را فعال کن:

```bash
sudo cp deploy/nginx-love-connect-ssl.conf /etc/nginx/sites-available/love-connect-ssl
sudo ln -s /etc/nginx/sites-available/love-connect-ssl /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

و در کلادفلر SSL/TLS → Overview → **Full (strict)**.

> بلوک ۴۴۳ عمداً در فایل جداست. nginx اگر `ssl_certificate` به فایلی اشاره
> کند که وجود ندارد، حتی `nginx -t` را هم رد می‌کند و کل وب‌سرور بالا
> نمی‌آید. با جدا بودن، سایت می‌تواند روی HTTP بالا بماند تا گواهی برسد.
> workflow خودکار هم همین کار را می‌کند: بلوک ۴۴۳ را **فقط وقتی** نصب
> می‌کند که هر دو فایل گواهی روی دیسک باشند، وگرنه با یک هشدار از کنارش
> رد می‌شود و HTTP را سرو می‌کند.

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

> بار اول `git` به‌عنوان root با خطای «dubious ownership» جلوی `git pull`
> را می‌گیرد، چون `deploy.sh` مالکیت پوشه را به `www-data` می‌دهد. یک‌بار
> این را بزن و برای همیشه حل می‌شود:
>
> ```bash
> git config --global --add safe.directory /var/www/love-connect
> ```

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
