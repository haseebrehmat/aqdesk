# Docker development setup

The Docker stack runs three services:

- React/Vite frontend at <http://localhost:3000>
- Laravel API at <http://localhost:8080>
- MySQL 8.4 on the internal Docker network

Start the stack:

```bash
docker compose up --build -d
```

Follow startup logs:

```bash
docker compose logs -f backend frontend
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
tags, creates the public storage link, and starts Laravel. Full demo seeders are
not run because they create accounts with known development passwords.
