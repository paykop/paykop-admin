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

- [ ] OTP request / verify via `/sign-in`
- [ ] Session cookie gate (`/api/auth/session`)
- [ ] Proxy attaches Bearer; refresh on TOKEN_EXPIRED
- [ ] Logout clears cookies and revokes on Go

## Users (`/users`)

- [ ] List with role filter
- [ ] Detail modal
- [ ] Suspend / unsuspend
- [ ] Verify seller
- [ ] Edit name (`PUT .../:id`)
- [ ] Role change via `PATCH .../:id/role` (not PUT)
- [ ] Agent promote/demote only via `/agents`

## Tickets (`/tickets`)

- [ ] List + status filter + search `q`
- [ ] Detail + message thread
- [ ] Status PATCH
- [ ] Reply POST

## KYC (`/kyc`)

- [ ] Filter by status
- [ ] Approve / reject with reason
- [ ] Document URLs render safely

## Products (`/products`)

- [ ] Filter pending/approved/rejected/removed
- [ ] Approve/reject status
- [ ] Delete (admin)

## Categories / service categories

- [ ] Tree CRUD
- [ ] Image upload (presigned)
- [ ] 404 surfaces as explicit error (not silent empty)

## Banners (`/banners`)

- [ ] List includes inactive (`only_active=false`)
- [ ] Create / update / delete

## Agents / support / payments / commerce / subscriptions

- [ ] Agents: create, assign, revoke, demote
- [ ] Support staff: create, revoke
- [ ] Payments: list, refund, transaction report
- [ ] Commerce: settings + commission batches + mark paid
- [ ] Subscriptions: plans CRUD, history, reconciliation resolve

## Campaigns / blood / services / logs / overview / notifications

- [ ] Campaigns CRUD
- [ ] Blood requests + donors + matching
- [ ] Services moderation + pagination
- [ ] Audit logs read
- [ ] Overview dashboard + metrics
- [ ] Notifications poll / mark read

## Orphan routes resolved

- [x] Profile → `/settings`
- [x] ApiConsole + BackendProfile → `/devtools` (admin only)
- [x] Subscriptions store wired into `SubscriptionsTab`
