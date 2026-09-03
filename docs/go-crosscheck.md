# Go API cross-check notes

Web inventory lives in [`scripts/sync/endpoint-inventory.ts`](../scripts/sync/endpoint-inventory.ts).

## How to run

```bash
# Web-only inventory dump (no Go repo required)
npm run sync:crosscheck

# Against a Go routes source file
GO_ROUTES_FILE=/path/to/paykop-api/internal/router/routes.go npm run sync:crosscheck
```

## Status definitions

| Status | Meaning |
|--------|---------|
| synced | Service + schema + UI |
| service-only | Service exists; UI uses alternate path (e.g. PATCH categories) |
| pending-verify | Wired in web; confirm Go deploy (categories may 404) |
| backend-only | Go route with no web client |
| web-only | Web client with no matching Go route |

## Known pending-verify domains

- Product categories (`/api/v1/admin/categories`)
- Service categories (`/api/v1/admin/service-categories`)

Stores now surface a clear 404 error instead of silent empty lists.

## Banner list note

Admin banner list reads `GET /api/v1/banners?only_active=false` (public path). Mutations use `/api/v1/admin/banners`. Confirm Go returns inactive banners for authenticated admins on the public list endpoint.
