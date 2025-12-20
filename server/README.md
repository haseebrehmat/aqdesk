# AQDesk Server

The AQDesk server is a Laravel API that handles authentication, community content, projects, consultations, opportunities, events, newsletters, and background jobs.

## Setup

Requirements: PHP 8.3+, Composer, and the PHP SQLite extension.

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

The API is available at `http://localhost:8000`.

Run the queue worker in another terminal when testing newsletters or other queued jobs:

```bash
php artisan queue:work
```

## Demo accounts

After seeding, you can sign in with:

- Administrator: `admin@aqdesk.site` / `AdminPassword123!`
- Expert: `abdullah.qamar@aqdesk.site` / `ExpertPassword123!`
- Student: `student@vu.edu.pk` / `StudentPassword123!`

These accounts are for local development only.

## Tests

```bash
composer test
```
