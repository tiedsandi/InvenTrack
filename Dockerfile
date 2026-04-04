# =============================================================
# Stage 1: Node.js — install deps & build frontend assets
# =============================================================
FROM node:20-alpine AS node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY vite.config.js ./
COPY resources ./resources

RUN npm run build

# =============================================================
# Stage 2: PHP-FPM — production server
# =============================================================
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libpq-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Copy compiled frontend assets from Node stage
COPY --from=node /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/storage
