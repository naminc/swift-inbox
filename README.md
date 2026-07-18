# Swift Inbox

Swift Inbox is a fullstack temporary (disposable) email application. Visitors can generate short-lived inbox addresses, receive incoming mail through a Cloudflare Email Routing Worker, and read messages in a clean web UI. An admin dashboard lets operators manage domains, mailboxes, abuse/contact reports, application settings, and cleanup operations.

## Features

- Temporary email inboxes with configurable expiry and one-click renew
- Custom domains managed from the admin dashboard
- Cloudflare inbound email worker that forwards mail to the backend
- Admin dashboard (domains, mailboxes, abuse reports, settings, operations)
- Mailbox expiry with a soft-expire retention window (expired inboxes are hidden from the public but kept for admin review before permanent cleanup)
- Cleanup operations (scheduled background worker + manual purge)
- Maintenance mode to pause public write actions
- Contact / abuse report submissions
- Settings-managed site metadata (site name, title, hero text, SEO metadata)

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, React Router DOM, TanStack Query, Tailwind CSS
- **Backend:** Node.js, Express 5, TypeScript, Prisma ORM, Zod, Pino
- **Database:** MySQL
- **Inbound email:** Cloudflare Email Routing + Email Worker

## Project Structure

```text
swift-inbox/
├─ backend/          # Express + Prisma API, workers, inbound webhook
│  ├─ prisma/        # schema.prisma, migrations, seed.ts
│  └─ src/           # app.ts, routes, controllers, services, configs
├─ frontend/         # React + Vite single-page app
│  └─ src/           # pages, components, hooks, lib
└─ docs/             # cloudflare-email-worker.md and other docs
```

There is no root `package.json`. Each app is managed independently, so commands are run either from inside `backend/` and `frontend/`, or from the repo root using `npm --prefix backend ...` and `npm --prefix frontend ...`.

## Requirements

- **Node.js** (a current LTS release is recommended)
- **npm**
- **MySQL** server (a database must exist before running migrations)
- **Cloudflare account + domain** with Email Routing (only required for real inbound email)
- Optional: **PM2** or **aaPanel** for running the backend in production
- Optional: **Cloudflare Tunnel** (`cloudflared`) for testing inbound email locally

## Environment Variables

### Backend

The backend loads environment variables from the backend project root:

```text
backend/.env
```

Important notes:

- Copy `backend/.env.example` to `backend/.env` and fill in the values.
- Do **not** copy `.env` into `dist/`. The backend resolves its project root by walking up from the compiled files until it finds a `package.json`, then loads `.env` from there.
- When running under PM2 or aaPanel, set the process **working directory to `backend/`** so `.env` is found.
- Keep `backend/.env` out of version control.

Example (based on `backend/.env.example`):

```env
# Application environment: development | production | test
NODE_ENV=development

# HTTP port the server listens on
PORT=9000

# Log level for the pino logger: trace | debug | info | warn | error | fatal
LOG_LEVEL=info

# Allowed CORS origin (single origin). Set to your frontend URL.
CORS_ORIGIN=http://localhost:5173

# MySQL connection string: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=mysql://root:password@localhost:3306/swift_inbox

# Single admin account email
ADMIN_EMAIL=admin@example.com

# Admin password (minimum 8 characters; use a strong value in production)
ADMIN_PASSWORD=change_me_to_a_strong_admin_password

# Secret used to sign HMAC auth tokens (minimum 32 characters)
AUTH_SECRET=change_me_to_a_long_random_secret_at_least_32_chars

# Name of the httpOnly admin session cookie
AUTH_COOKIE_NAME=swift_inbox_admin

# Admin auth token lifetime in seconds (default 86400 = 24h)
AUTH_TOKEN_TTL_SECONDS=86400

# Interval in seconds between cleanup worker runs (default 600 = 10 min)
CLEANUP_INTERVAL_SECONDS=600

# Shared secret between the Cloudflare email worker and this backend (minimum 32 characters)
INBOUND_WEBHOOK_SECRET=change_me_to_a_long_random_secret_at_least_32_chars
```

Variable reference:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode: `development`, `production`, or `test`. |
| `PORT` | Port the API listens on (default `9000`). |
| `LOG_LEVEL` | Logging verbosity for the pino logger. |
| `CORS_ORIGIN` | Allowed frontend origin for CORS (single origin only). |
| `DATABASE_URL` | MySQL connection string used by Prisma. |
| `ADMIN_EMAIL` | Email for the single admin account. |
| `ADMIN_PASSWORD` | Admin password (min 8 chars). |
| `AUTH_SECRET` | Secret to sign admin session tokens (min 32 chars). |
| `AUTH_COOKIE_NAME` | Name of the httpOnly admin session cookie. |
| `AUTH_TOKEN_TTL_SECONDS` | Admin session token lifetime in seconds. |
| `CLEANUP_INTERVAL_SECONDS` | How often the cleanup worker runs. |
| `INBOUND_WEBHOOK_SECRET` | Shared secret to authenticate the Cloudflare inbound webhook (min 32 chars). |

To generate a strong secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend

Create the frontend env file:

```text
frontend/.env
```

Contents (based on `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:9000
```

`VITE_API_URL` points the frontend at the backend API. **A production build requires `VITE_API_URL` to be set.**

## Database Setup

The MySQL database referenced by `DATABASE_URL` must exist before running migrations. Then, from the backend folder:

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

For local development you can use interactive migrations instead of `migrate deploy`:

```powershell
npx prisma migrate dev
```

Notes:

- `npx prisma generate` regenerates the Prisma client.
- `npx prisma migrate deploy` applies existing migrations (use in production/CI).
- `npm run db:seed` upserts default application settings and, if no domains exist yet, creates a single default `example.com` domain. It does not create real secrets. Replace the example domain with your own from the admin dashboard.

## Backend Development

```powershell
cd backend
npm install
npm run dev
```

Default backend URL:

```text
http://localhost:9000
```

Health endpoint (also checks the database connection):

```text
GET /api/health
```

## Frontend Development

```powershell
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

## Admin Setup

- Admin credentials come from the backend `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- The admin session is a signed httpOnly cookie, so the backend must be reachable from the frontend and CORS must allow credentials from `CORS_ORIGIN`.

Login route:

```text
/admin/login
```

Admin dashboard routes:

```text
/admin/domains
/admin/mailboxes
/admin/abuse
/admin/settings
/admin/operations
```

## Cloudflare Email Routing Setup

Full details and the Worker source are in `docs/cloudflare-email-worker.md`. High-level steps:

1. Enable **Email Routing** for your domain in the Cloudflare dashboard.
2. Create and deploy an **Email Worker** using the code from `docs/cloudflare-email-worker.md`.
3. Configure the Worker variables/secrets:
   - `BACKEND_INBOUND_URL`
   - `INBOUND_WEBHOOK_SECRET` (must match the backend `INBOUND_WEBHOOK_SECRET`)
4. Create a routing rule (for example a catch-all) that sends incoming email to the Worker.
5. Make sure the backend endpoint `/api/inbound/cloudflare` is publicly reachable over HTTPS.
6. Test by sending an email to an active, non-expired mailbox address.

The Worker forwards mail to the backend inbound endpoint. Set:

```text
BACKEND_INBOUND_URL=https://your-backend-domain.com/api/inbound/cloudflare
```

For local testing, expose the backend with a public tunnel (for example Cloudflare Tunnel):

```powershell
cloudflared tunnel --url http://localhost:9000
```

Then set `BACKEND_INBOUND_URL` to the tunnel URL, for example:

```text
https://your-tunnel.trycloudflare.com/api/inbound/cloudflare
```

The Worker sends raw MIME to the backend, which parses it into a clean `subject`, `textBody`, and `htmlBody` before saving. Raw HTML is never rendered directly in the UI.

## Common Commands

Run from the repository root using `npm --prefix`:

```powershell
# Backend
npm --prefix backend run dev
npm --prefix backend run build
npm --prefix backend run start
npm --prefix backend run typecheck
npm --prefix backend run lint:check
npm --prefix backend run db:migrate
npm --prefix backend run db:seed

# Frontend
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run preview
npm --prefix frontend run lint
```

## Production Deployment Notes

### Backend

```powershell
cd backend
npm install
npm run build
npm run db:migrate
npm run start
```

Notes:

- Run all commands from the backend project root.
- Do **not** copy `.env` into `dist/`. Keep `backend/.env` at the backend root.
- Under PM2 or aaPanel, set the working directory to `backend/` so `.env` and the Prisma schema resolve correctly.
- The start command runs the compiled server:

```text
node dist/server.js
```

- `npm run start` sets `NODE_ENV=production` and runs the compiled server for you.
- Keep `backend/.env` outside git.

### Frontend

```powershell
cd frontend
npm install
$env:VITE_API_URL="https://your-backend-domain.com"
npm run build
```

Notes:

- The build output is written to `frontend/dist`.
- Any static host (for example Vercel) can serve `frontend/dist`.
- `frontend/vercel.json` provides an SPA fallback rewrite so client-side routes resolve to `index.html`.
- Make sure the backend `CORS_ORIGIN` matches the deployed frontend URL.

## Troubleshooting

### `VITE_API_URL must be set for production builds`

Set the frontend API URL before building:

```powershell
cd frontend
$env:VITE_API_URL="https://your-backend-domain.com"
npm run build
```

Or add `VITE_API_URL` to `frontend/.env`.

### Backend cannot find `.env`

Place the file at `backend/.env` and run the backend from the backend project root (or set the PM2/aaPanel working directory to `backend/`). Do not copy `.env` into `dist/`.

### Prisma cannot find the schema

Run Prisma commands from the `backend/` folder. The schema lives at `backend/prisma/schema.prisma`.

### CORS errors

Set the backend origin to your frontend URL:

```text
CORS_ORIGIN=http://localhost:5173
```

In production, set it to the deployed frontend URL. Only a single origin is supported.

### No emails received

Check:

- Cloudflare Email Routing rule is active and points to the Worker
- Worker variables `BACKEND_INBOUND_URL` and `INBOUND_WEBHOOK_SECRET` are set
- The backend `/api/inbound/cloudflare` endpoint is publicly reachable
- `INBOUND_WEBHOOK_SECRET` matches between the Worker and the backend
- The target mailbox exists and is not expired
- Maintenance mode is off

### Admin login fails

Check:

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`
- `AUTH_SECRET` is set (min 32 characters)
- CORS allows credentials from `CORS_ORIGIN` and the frontend uses the correct `VITE_API_URL`
- The session cookie is being set/sent (same-site/HTTPS considerations in production)

## Security Notes

- Never commit `.env` files.
- Rotate `AUTH_SECRET` and `INBOUND_WEBHOOK_SECRET` periodically and if leaked.
- Do not expose admin credentials.
- Raw HTML emails are not rendered directly.
- Expired public mailboxes do not expose their messages to public users.
- Use HTTPS in production.

## Verification Checklist

- [ ] Backend starts
- [ ] Frontend starts
- [ ] MySQL migrations applied
- [ ] Admin login works
- [ ] Domain added in admin
- [ ] Public mailbox can be created
- [ ] Cloudflare inbound email is received
- [ ] Cleanup operation works
