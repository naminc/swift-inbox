# Swift Inbox — Deployment Guide

## Prerequisites

- Node.js >= 20
- MySQL 8.0+
- A reverse proxy (Nginx, Caddy, or a cloud load balancer)
- A Cloudflare account with Email Routing configured (for inbound emails)

## Environment Variables

Copy and configure the env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

See `backend/.env.example` for per-variable documentation. At minimum you need:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string |
| `CORS_ORIGIN` | Yes | Production frontend URL |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Strong password for admin |
| `AUTH_SECRET` | Yes | Random 32+ char secret for HMAC tokens |
| `INBOUND_WEBHOOK_SECRET` | Yes | Shared secret with Cloudflare worker |
| `VITE_API_URL` | Yes | Backend URL for frontend build |

## Backend Deployment

### 1. Install dependencies

```bash
cd backend
npm ci --omit=dev
```

### 2. Run database migrations

```bash
npm run db:migrate
```

### 3. Seed initial data (first deploy only)

```bash
npm run db:seed
```

This creates default settings and a placeholder domain. Replace `example.com` with your real domain in the admin panel.

### 4. Build

```bash
npm run build
```

This runs `prisma generate` + TypeScript compilation automatically.

### 5. Start

```bash
npm start
```

The server listens on `PORT` (default 9000). Place behind a reverse proxy that terminates TLS.

## Frontend Deployment

### 1. Build

```bash
cd frontend
VITE_API_URL=https://api.yourdomain.com npm run build
```

The build will **fail** if `VITE_API_URL` is not set.

### 2. Serve

Serve the `frontend/dist/` directory as static files. Any path that doesn't match a file should fall through to `index.html` (SPA routing).

Example Nginx config:

```nginx
server {
    listen 443 ssl;
    server_name inbox.yourdomain.com;

    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Docker (Optional)

### Dockerfile for backend

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
EXPOSE 9000
CMD ["node", "dist/server.js"]
```

### docker-compose.yml

```yaml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: swift_inbox
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    env_file: ./backend/.env
    depends_on:
      - db
    ports:
      - "9000:9000"
    command: >
      sh -c "npx prisma migrate deploy && node dist/server.js"

volumes:
  db_data:
```

## Post-Deploy Checklist

1. Run migrations: `npm run db:migrate`
2. Seed database (first time): `npm run db:seed`
3. Replace the seeded `example.com` domain with your real domain(s) via admin panel
4. Configure Cloudflare Email Routing worker (see `docs/cloudflare-email-worker.md`)
5. Verify health: `curl https://api.yourdomain.com/api/health`
6. Log in to admin panel and configure settings
