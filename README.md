# AQDesk

AQDesk is a university community platform for technical questions, collaborative projects, expert consultations, opportunities, events, podcasts, and newsletters.

The project has two applications:

- `client/` — React frontend
- `server/` — Laravel API

## Run locally

Requirements: PHP 8.3+, Composer, Node.js 22+, npm, and the PHP SQLite extension.

Start the backend first:

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

In a second terminal, start the frontend:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The API runs at `http://localhost:8000`.

For component-specific setup and test commands, see [client/README.md](client/README.md) and [server/README.md](server/README.md).
