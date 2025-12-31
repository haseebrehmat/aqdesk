# Docker development setup

The Docker stack runs four services:

- React/Vite frontend at <http://localhost:3000>
- Laravel API at <http://localhost:8080>
- Laravel database-backed queue worker
- MySQL 8.4 on the internal Docker network

Start the stack:

```bash
docker compose up --build -d
```

Follow startup logs:

```bash
docker compose logs -f backend worker frontend
```

Stop the stack while keeping database data:

```bash
docker compose down
```

To also remove the local Docker database volume:

```bash
docker compose down --volumes
```

The backend automatically waits for MySQL, runs migrations, seeds roles and
tags, creates the public storage link, and starts Laravel. The worker starts
after the API is healthy and continuously processes the database queue with
three attempts per job. Full demo seeders are not run because they create
accounts with known development passwords.

Docker Compose supplies `APP_URL`, `FRONTEND_URL`, `VITE_BACKEND_URL`, and
`VITE_API_PROXY_TARGET` directly to the containers, so Docker does not require
local `.env` files for these URLs.

For non-Docker local development, create untracked environment files from the
templates:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The templates assume Laravel runs at <http://localhost:8000> and Vite runs at
<http://localhost:3000>. Change both URL values together if either port or host
is different.
