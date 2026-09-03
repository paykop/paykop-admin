# Paykop Admin — Endpoint Inventory

Source of truth for backend ↔ web sync. Machine-readable copy: [`scripts/sync/endpoint-inventory.ts`](../scripts/sync/endpoint-inventory.ts).

**Total endpoints:** 73  
**Last updated:** sync implementation

## Status legend

| Status | Meaning |
|--------|---------|
| `synced` | Service + schema + UI wired |
| `service-only` | Service exists; UI uses alternate method or not yet exposed |
| `pending-verify` | Wired in web; needs live Go API confirmation (may 404) |
| `backend-only` | Go exposes route; web has no client |
| `web-only` | Web calls route Go does not expose |

## Auth

| Method | Path | Service | UI | Status |
|--------|------|---------|-----|--------|
| POST | `/api/v1/admin/auth/otp/request` | `requestAdminOtp` | `/sign-in` | synced |
| POST | `/api/v1/admin/auth/otp/verify` | `verifyAdminOtp` | `/sign-in` | synced |
| GET | `/api/auth/session` | `resolveSessionStatus` | global | synced |
| POST | `/api/v1/admin/auth/refresh` | server refresh | proxy | synced |
| POST | `/api/v1/admin/auth/logout` | `logoutAdmin` | sidebar | synced |

## Users & profile

| Method | Path | Service | UI | Status |
|--------|------|---------|-----|--------|
| GET | `/api/v1/auth/me` | `fetchUserProfile` | global | synced |
| PATCH | `/api/v1/users/me` | `updateUserProfile` | `/settings` | synced |
| GET | `/api/v1/users/me/permissions` | `fetchUserPermissions` | `/devtools` | synced |
| GET | `/api/v1/admin/users` | `fetchUsers` | `/users` | synced |
| GET | `/api/v1/admin/users/:id` | `getUser` | `/users` | synced |
| PUT | `/api/v1/admin/users/:id` | `updateUser` | `/users` | synced |
| PATCH | `/api/v1/admin/users/:id/role` | `updateUserRole` | `/users` | synced |
| PUT | `/api/v1/admin/users/:id/suspend` | `suspendUser` | `/users` | synced |
| PUT | `/api/v1/admin/users/:id/verify` | `verifyUser` | `/users` | synced |

## Dashboard & health

| Method | Path | Service | UI | Status |
|--------|------|---------|-----|--------|
| GET | `/api/v1/admin/dashboard` | `fetchDashboardStats` | `/` | synced |
| GET | `/api/v1/admin/metrics` | `fetchAdminMetrics` | `/` | synced |
| GET | `/health` | `fetchServerHealth` | `/devtools` | synced |

## All other domains

See [`scripts/sync/endpoint-inventory.ts`](../scripts/sync/endpoint-inventory.ts) for the complete list covering tickets, KYC, products, categories, banners, agents, support, payments, commerce, subscriptions, campaigns, blood, service categories, services, logs, notifications, and upload.

## Verification commands

```bash
npm run sync:auth      # Auth chain smoke test
npm run sync:schemas   # Zod fixture + live validation
npm run sync:matrix    # Per-domain GET smoke against Go API
npm run sync:crosscheck # Compare inventory vs Go routes file
npm run sync:deploy    # Deployment checklist
npm run sync:all       # Run all sync scripts
```

Set `API_URL` and optionally `ADMIN_ACCESS_TOKEN` for live checks against the Go API.
