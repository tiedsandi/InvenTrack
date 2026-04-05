# Deployment Guide - API untuk Production

## 1. Pre-Deployment Checklist

### 1.1 Security

- [ ] Update `.env` dengan konfigurasi production
- [ ] Set `APP_DEBUG=false`
- [ ] Set `APP_ENV=production`
- [ ] Ganti `APP_KEY` dengan key baru
- [ ] Aktifkan HTTPS
- [ ] Setup CORS dengan domain yang tepat
- [ ] Implement rate limiting
- [ ] Setup logging untuk production

### 1.2 Database

- [ ] Backup database
- [ ] Jalankan migrations terbaru
- [ ] Verify relasi antar tabel
- [ ] Setup database user dengan permission terbatas
- [ ] Optimize queries dengan indexing

### 1.3 Performance

- [ ] Enable caching
- [ ] Setup Redis untuk session & cache
- [ ] Optimize laravel untuk production
- [ ] Compress API responses
- [ ] Setup CDN jika diperlukan

---

## 2. Environment Configuration

### 2.1 Update `.env` untuk Production

```env
APP_NAME=InvenTrack
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://api.inventrack.com

DB_CONNECTION=pgsql
DB_HOST=your-db-host.com
DB_PORT=5432
DB_DATABASE=inventrack_prod
DB_USERNAME=inventrack_user
DB_PASSWORD=STRONG_PASSWORD_HERE

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=REDIS_PASSWORD
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=api.inventrack.com,inventrack.com
SANCTUM_ALLOWED_ORIGINS=https://inventrack.com,https://app.inventrack.com

LOG_CHANNEL=stack
LOG_LEVEL=warning
```

### 2.2 Update `bootstrap/app.php` untuk Production

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\TrustProxies::class,
        ]);

        $middleware->api(append: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Rate limiting
        $middleware->throttleApi('60,1');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 500);
            }
        });
    })->create();
```

---

## 3. Deployment Steps

### 3.1 Deploy ke VPS/Cloud Server

**Option 1: Manual Deployment**

```bash
# 1. SSH ke server
ssh user@your-server.com

# 2. Clone repository
cd /var/www
git clone https://github.com/tiedsandi/inventrack.git
cd inventrack

# 3. Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi production

# 4. Install dependencies
composer install --no-dev --optimize-autoloader

# 5. Generate key
php artisan key:generate

# 6. Run migrations
php artisan migrate --force

# 7. Optimize untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 8. Setup permissions
chown -R www-data:www-data /var/www/inventrack
chmod -R 755 /var/www/inventrack
chmod -R 777 /var/www/inventrack/storage
chmod -R 777 /var/www/inventrack/bootstrap/cache

# 9. Setup supervisor untuk queue workers
sudo systemctl restart supervisor
```

**Option 2: Deploy via GitHub Actions (CI/CD)**

**File: `.github/workflows/deploy.yml`**

```yaml
name: Deploy to Production

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v2

            - name: Deploy to server
              uses: appleboy/ssh-action@master
              with:
                  host: ${{ secrets.HOST }}
                  username: ${{ secrets.USERNAME }}
                  key: ${{ secrets.SSH_KEY }}
                  script: |
                      cd /var/www/inventrack
                      git pull origin main
                      composer install --no-dev --optimize-autoloader
                      php artisan migrate --force
                      php artisan config:cache
                      php artisan route:cache
                      php artisan view:cache
                      php artisan queue:restart
```

### 3.2 Deploy ke Docker

**Build & Deploy Steps:**

```bash
# 1. Build Docker image
docker build -t inventrack-api:latest .

# 2. Push ke registry
docker tag inventrack-api:latest your-registry/inventrack-api:latest
docker push your-registry/inventrack-api:latest

# 3. Pull & run di production server
docker pull your-registry/inventrack-api:latest
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force

# 5. Optimize
docker-compose -f docker-compose.prod.yml exec app php artisan config:cache
docker-compose -f docker-compose.prod.yml exec app php artisan route:cache
```

**File: `docker-compose.prod.yml`**

```yaml
version: "3.8"

services:
    app:
        image: your-registry/inventrack-api:latest
        container_name: inventrack_app_prod
        restart: always
        working_dir: /app
        environment:
            - APP_ENV=production
            - APP_DEBUG=false
        volumes:
            - ./storage:/app/storage
            - ./bootstrap/cache:/app/bootstrap/cache
        depends_on:
            - db
            - redis
        networks:
            - inventrack

    nginx:
        image: nginx:alpine
        container_name: inventrack_nginx_prod
        restart: always
        ports:
            - "443:443"
            - "80:80"
        volumes:
            - ./nginx.prod.conf:/etc/nginx/nginx.conf
            - /etc/letsencrypt:/etc/letsencrypt
        depends_on:
            - app
        networks:
            - inventrack

    db:
        image: postgres:15-alpine
        container_name: inventrack_db_prod
        restart: always
        environment:
            POSTGRES_DB: ${DB_DATABASE}
            POSTGRES_USER: ${DB_USERNAME}
            POSTGRES_PASSWORD: ${DB_PASSWORD}
        volumes:
            - db_data:/var/lib/postgresql/data
        networks:
            - inventrack

    redis:
        image: redis:7-alpine
        container_name: inventrack_redis_prod
        restart: always
        networks:
            - inventrack

volumes:
    db_data:
        driver: local

networks:
    inventrack:
        driver: bridge
```

---

## 4. SSL/HTTPS Setup

### 4.1 Using Let's Encrypt

```bash
# 1. Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Generate certificate
sudo certbot certonly --standalone -d api.inventrack.com

# 3. Configure Nginx dengan SSL
# Update nginx.conf untuk SSL
```

### 4.2 Update Nginx untuk HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name api.inventrack.com;

    ssl_certificate /etc/letsencrypt/live/api.inventrack.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.inventrack.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/inventrack/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Redirect HTTP ke HTTPS
server {
    listen 80;
    server_name api.inventrack.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 5. Monitoring & Logging

### 5.1 Setup Logging

```env
LOG_CHANNEL=single
LOG_DAILY_DAYS=14
LOG_LEVEL=warning
```

### 5.2 Monitor dengan Tools

```bash
# Setup monitoring dengan Supervisor
sudo nano /etc/supervisor/conf.d/inventrack-worker.conf
```

**File: `/etc/supervisor/conf.d/inventrack-worker.conf`**

```ini
[program:inventrack-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/inventrack/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
stderr_logfile=/var/www/inventrack/storage/logs/worker.log
stdout_logfile=/var/www/inventrack/storage/logs/worker.log
numprocs=2
```

### 5.3 Setup Cloud Monitoring

Gunakan layanan seperti:

- **Sentry** - Error tracking
- **DataDog** - APM & monitoring
- **New Relic** - Performance monitoring
- **Elastic Stack** - Log aggregation

---

## 6. Backup & Recovery

### 6.1 Database Backup

```bash
# Daily backup script
sudo nano /usr/local/bin/backup-inventrack.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/backups/inventrack"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="inventrack_prod"
DB_USER="inventrack_user"

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/inventrack

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR s3://inventrack-backups/prod-backups/ --recursive
```

### 6.2 Automate Backups dengan Cron

```bash
# Edit crontab
crontab -e

# Tambahkan:
0 2 * * * /usr/local/bin/backup-inventrack.sh
```

---

## 7. Performance Optimization

### 7.1 Enable Caching

```php
// app/Providers/AppServiceProvider.php
public function boot()
{
    // Cache configuration
    Cache::store('redis')->remember('products', 3600, function () {
        return Product::all();
    });

    // Cache routes
    Route::middleware('cache:3600')->group(function () {
        Route::get('/api/products', [ProductController::class, 'index']);
    });
}
```

### 7.2 Optimize Queries

```php
// Use eager loading
Product::with('category', 'salesOrderDetails')->get();

// Use select untuk mengurangi columns
Product::select('id', 'name', 'price')->get();

// Pagination
Product::paginate(15);
```

### 7.3 Enable Query Caching

```env
QUERY_CACHE_DRIVER=redis
QUERY_CACHE_TTL=3600
```

---

## 8. Rollback Plan

Jika terjadi error di production:

```bash
# 1. Rollback ke commit sebelumnya
git revert HEAD

# 2. Rollback database migrations
php artisan migrate:rollback

# 3. Restart aplikasi
php artisan restart
supervisor restart inventrack-worker
```

---

## 9. Post-Deployment Testing

### 9.1 Smoke Tests

```bash
# Test health endpoint
curl https://api.inventrack.com/up

# Test login
curl -X POST https://api.inventrack.com/api/login \
  -d '{"email":"admin@inventrack.com","password":"admin123"}'

# Test API endpoint
curl -H "Authorization: Bearer TOKEN" \
  https://api.inventrack.com/api/products
```

### 9.2 Load Testing

```bash
# Load test dengan Apache Bench
ab -n 1000 -c 100 https://api.inventrack.com/api/products

# Dengan authentication
ab -C "Authorization: Bearer TOKEN" \
  -n 1000 -c 100 https://api.inventrack.com/api/products
```

---

## Checklist Deployment

- [ ] Semua tests lokal passed
- [ ] .env dikonfigurasi untuk production
- [ ] Database backup dibuat
- [ ] SSL certificate sudah aktif
- [ ] CORS dikonfigurasi dengan benar
- [ ] Rate limiting diaktifkan
- [ ] Logging dikonfigurasi
- [ ] Monitoring tools sudah setup
- [ ] Backup automation aktif
- [ ] CI/CD pipeline berjalan
- [ ] Health checks berjalan
- [ ] Error handling bekerja
- [ ] Performance optimal (< 200ms response time)
- [ ] Security checks passed

---

**API ready untuk production! 🚀**
