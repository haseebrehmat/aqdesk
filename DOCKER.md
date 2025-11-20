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

## Google and GitHub sign-in

The backend loads optional OAuth credentials from the ignored `server/.env`
file. Copy the template, then set the credentials issued by each provider:

```bash
cp server/.env.example server/.env
```

For the local Docker stack, register these exact provider callback URLs:

- Google: `http://localhost:8080/api/auth/google/callback`
- GitHub: `http://localhost:8080/api/auth/github/callback`

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`,
`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_REDIRECT_URI` in
`server/.env`, then recreate the backend with `docker compose up -d backend`.
Only fully configured providers are shown on the sign-in page. Production
deployments must replace both callback URLs and `FRONTEND_URL` with HTTPS URLs
on the deployed domains.

For non-Docker local development, create untracked environment files from the
templates:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The templates assume Laravel runs at <http://localhost:8000> and Vite runs at
<http://localhost:3000>. Change both URL values together if either port or host
is different.

Run the public API performance gate after the stack is healthy:

```bash
node scripts/api-load-test.mjs
```

The default run sends 100 requests to each public collection endpoint with 10
concurrent clients and fails if any endpoint exceeds 500 ms at the 95th
percentile. Override `LOAD_TEST_REQUESTS`, `LOAD_TEST_CONCURRENCY`,
`LOAD_TEST_THRESHOLD_MS`, or `LOAD_TEST_BASE_URL` when testing another target.
