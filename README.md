# Paykop Admin

Secure admin dashboard for Paykop, built with Next.js 16 and a BFF auth layer.

## Prerequisites

- Node.js 20+
- Paykop Go API running locally or in staging

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable                          | Scope       | Description                                     |
| --------------------------------- | ----------- | ----------------------------------------------- |
| `API_URL`                         | Server only | Go API base URL (e.g. `http://localhost:8080`)  |
| `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` | Client      | Comma-separated CDN hostnames for remote images |

Browser requests never call the Go API directly. All admin API traffic goes through `/api/proxy` with HttpOnly session cookies.

## Auth architecture

```text
Browser → /api/auth/* (OTP, session, logout)
Browser → /api/proxy/* → Go API (Bearer attached server-side)
Middleware → checks HttpOnly access/refresh cookies
```

Tokens are stored in HttpOnly cookies only — never in `localStorage`.

## RBAC roles

| Role      | Access                            |
| --------- | --------------------------------- |
| `admin`   | All dashboard routes              |
| `support` | `/tickets`, `/users`, `/kyc` only |

## Scripts

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | Start development server                    |
| `npm run build`    | Production build                            |
| `npm run start`    | Start production server                     |
| `npm run lint`     | ESLint                                      |
| `npm run test:e2e` | Playwright smoke + contract tests           |
| `npm run sync:all` | Backend ↔ web sync verification (see below) |

## Backend sync verification

Inventory and scripts live under [`docs/endpoint-inventory.md`](docs/endpoint-inventory.md) and [`scripts/sync/`](scripts/sync/).

| Command                     | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `npm run sync:deploy`       | Deployment checklist (env, routes, docs)              |
| `npm run sync:auth`         | Auth chain smoke against Go API                       |
| `npm run sync:schemas`      | Zod validation against fixture JSON                   |
| `npm run sync:schemas:live` | Fixtures + live API (needs `ADMIN_ACCESS_TOKEN`)      |
| `npm run sync:matrix`       | List GET endpoints in feature matrix (dry-run)        |
| `npm run sync:matrix:live`  | GET smoke against Go API (needs `ADMIN_ACCESS_TOKEN`) |
| `npm run sync:crosscheck`   | Compare inventory vs Go routes file                   |
| `npm run sync:all`          | Run deploy + auth + schemas + crosscheck              |

Set `API_URL` (default `http://localhost:8080`) and optionally `ADMIN_ACCESS_TOKEN` for live checks.

## Deploy checklist

- [ ] Set `API_URL` to production Go API
- [ ] HTTPS enabled (required for `Secure` cookies)
- [ ] Confirm Go exposes `/api/v1/admin/auth/logout` for server-side refresh revocation
- [ ] Set `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` to your CDN domains
- [ ] Run `npm run build` and `npm run test:e2e` before deploy

## CI

GitHub Actions runs `npm ci`, `npm run lint`, and `npm run build` on every push and pull request.
