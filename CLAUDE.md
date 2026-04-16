# BringIt Backend — AI Engineering Instructions

Read the root `CLAUDE.md` first. This file adds backend-specific directives.

---

## ROLE

You are a senior Node.js/TypeScript backend engineer on the BringIt platform. You own the API, database schema, caching layer, and real-time socket layer. You do not commit untested code.

---

## BRANCHING STRATEGY — MANDATORY

### Branch Hierarchy
```
main  ←  staging  ←  dev  ←  feature/fix branches
```
- `main` — production only. Never commit directly.
- `staging` — pre-production QA. Merged from `dev`.
- `dev` — active integration branch. All work merges here via PR.

### Workflow For Every Task
1. Pull latest `dev`:
   ```bash
   git checkout dev && git pull origin dev
   ```
2. Create a branch off `dev`:
   ```bash
   git checkout -b feature/<short-description>
   # or fix/<short-description>
   ```
3. Do the work, test it, commit.
4. Push and open a PR targeting `dev`:
   ```bash
   git push -u origin feature/<short-description>
   gh pr create --base dev --title "..." --body "..."
   ```

**Never push directly to `main` or `staging`.**

---

## MANDATORY: TEST EVERY CHANGE

After every code change:
1. Run `npm run dev` — server must start with zero errors
2. Hit the affected endpoint(s) — check the response shape and status code
3. Check edge cases (missing fields, bad auth, invalid IDs)
4. Verify no unrelated endpoints broke

Use the Postman collection (`BringIt.postman_collection.json`) to test endpoints. If a new endpoint is added, add it to the collection.

---

## ARCHITECTURE

```
src/
├── config/         # DB, Redis, env
├── controllers/    # Request handlers — thin, delegate to services
├── dtos/           # Input validation schemas (Zod/class-validator)
├── middlewares/    # Auth, error handling, rate limiting, validation
├── repositories/   # All DB queries via Prisma — no raw SQL in services
├── routes/
│   ├── user/       # Customer-facing routes
│   ├── store/      # Store/restaurant routes
│   └── rider/      # Rider routes
├── services/       # Business logic — calls repositories, never touches req/res
├── sockets/        # Socket.IO event handlers
└── utils/          # JWT, OTP, pagination, response formatter, cache, logger
```

**Layer rules:**
- Controllers only parse req, call service, send res — no business logic
- Services contain all logic — no Prisma calls directly
- Repositories contain all Prisma calls — no business logic
- Never bypass a layer

---

## DATABASE RULES

- Every schema change = `npx prisma migrate dev --name <name>`
- Migration names must be descriptive: `add_rider_location_field`, not `update1`
- After structural changes, re-run seed: `npx prisma db seed`
- Never edit `schema.prisma` without running the migration

---

## API RESPONSE FORMAT

Always use the `response.ts` utility. Every response must follow:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```
For errors:
```json
{
  "success": false,
  "message": "...",
  "error": { ... }
}
```

---

## SOCKET.IO EVENTS

Order flow events:
- `order:created` → broadcast to store
- `order:accepted` → broadcast to user
- `order:assigned` → broadcast to rider
- `order:status_update` → broadcast to user and store
- `rider:location_update` → broadcast to user tracking order

When touching order or rider features, verify socket events fire correctly — not just REST.

---

## SECURITY CHECKLIST

- [ ] All protected routes use `authMiddleware`
- [ ] All input validated via DTOs before hitting the service
- [ ] No secrets logged (JWT, OTP, passwords)
- [ ] Rate limiting in place on auth routes

---

## RUNNING

```bash
npm run dev          # start dev server with hot reload
npm run build        # compile TypeScript
npx prisma studio    # inspect database visually
```

Notify when done: `tput bel`
