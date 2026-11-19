# Production-like image of MySpeedPuzzling for the worker-vs-classic benchmark.
# Build context = a copy of ~/www/speedpuzzling.cz (rate limits lifted, see README.md)
FROM ghcr.io/myspeedpuzzling/web-base-php85:main
WORKDIR /app
COPY . /app
RUN rm -f /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini* \
 && printf 'APP_ENV=prod\nAPP_DEBUG=0\nAPP_SECRET=benchmark-not-secret\nSENTRY_DSN=\n' > .env.local \
 && COMPOSER_ALLOW_SUPERUSER=1 composer dump-autoload --no-dev --classmap-authoritative --no-interaction && ls vendor/autoload_runtime.php \
 && APP_ENV=prod php bin/console cache:clear --no-warmup && APP_ENV=prod php bin/console cache:warmup
ENV APP_ENV=prod \
    APP_DEBUG=0 \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0 \
    SERVER_NAME=:8080 \
    SKIP_DATABASE_MIGRATIONS=true \
    FRANKENPHP_WATCH=0
