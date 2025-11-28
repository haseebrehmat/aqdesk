#!/bin/sh
set -eu

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
until php -r '
try {
    new PDO(
        "mysql:host=" . getenv("DB_HOST") . ";port=" . getenv("DB_PORT") . ";dbname=" . getenv("DB_DATABASE"),
        getenv("DB_USERNAME"),
        getenv("DB_PASSWORD")
    );
} catch (Throwable $exception) {
    exit(1);
}
'; do
    sleep 2
done

php artisan config:clear
php artisan migrate --force
php artisan db:seed --class='Database\Seeders\RoleSeeder' --force
php artisan db:seed --class='Database\Seeders\TagSeeder' --force
php artisan storage:link || true

exec php artisan serve --host=0.0.0.0 --port=8000
