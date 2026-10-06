# Feature matrix — UI ↔ backend sync checklist

Run live smoke with:

```bash
ADMIN_ACCESS_TOKEN=<token> API_URL=http://localhost:8080 npm run sync:matrix:live
```

Dry-run (lists GET endpoints without calling Go):

```bash
npm run sync:matrix
```

## Auth

- [x] OTP request / verify via `/sign-in`
- [x] Session cookie gate (`/api/auth/session`)
- [x] Proxy attaches Bearer; refresh on TOKEN_EXPIRED
- [x] Logout clears cookies and revokes on Go

## Users (`/users`)

- [x] List with role filter
- [x] Detail modal
- [x] Suspend / unsuspend
- [x] Verify seller
- [x] Edit name (`PUT .../:id`)
- [x] Role change via `PATCH .../:id/role` (not PUT)
- [x] Agent promote/demote only via `/agents`

## Tickets (`/tickets`)

- [x] List + status filter + search `q`
- [x] Detail + message thread
- [x] Status PATCH
- [x] Reply POST

## KYC (`/kyc`)

- [x] Filter by status
- [x] Approve / reject with reason
- [x] Document URLs render safely

## Products (`/products`)

- [x] Filter live / rejected / removed (listings publish live — no approval queue)
- [x] Takedown / restore via status (`rejected`, `removed`, `approved`)
- [x] Delete (admin)

## Categories / service categories

- [x] Tree CRUD
- [x] Image upload (presigned)
- [x] 404 surfaces as explicit error (not silent empty)

## Banners (`/banners`)

- [x] List includes inactive (`only_active=false`)
- [x] Create / update / delete

## Agents / support / payments / commerce / subscriptions

- [x] Agents: create, assign, revoke, demote (no trial grants — paid + Commission plans only)
- [x] Support staff: create, revoke
- [x] Payments: list, refund, transaction report
- [x] Commerce: settings + commission batches + mark paid
- [x] Subscriptions: plans CRUD, history, reconciliation resolve

## Campaigns / blood / services / logs / overview / notifications

- [x] Campaigns CRUD
- [x] Blood requests + donors + matching
- [x] Services moderation (takedown / restore — live on create)
- [x] Audit logs read
- [x] Overview dashboard + metrics
- [x] Notifications poll / mark read

## Organizations / donations / payouts

- [x] Organizations list + KYC patch
- [x] Donation ledger + cash reconcile confirm
- [x] Payout preview → run → approve

## Orphan routes resolved

- [x] Profile → `/settings`
- [x] ApiConsole + BackendProfile → `/devtools` (admin only)
- [x] Subscriptions store wired into `SubscriptionsTab`

Verified against backend web sync implementation (see `paykop-backend/docs/BACKEND_WEB_SYNC_GAP_LOG.md`).
