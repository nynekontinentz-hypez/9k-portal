# NineKOS - MSP Client Portal

## What this app does

IT services client portal for NineKOS MSP. Admins manage clients, contracts, service tiers, and support tickets. Clients submit tickets; admins track and resolve them. Public pages show services and blog content.

## Stack

Express.js + PostgreSQL/Neon, deployed on Render.

## Directory map

- `server.js` — App entry. Wire middleware, mount routes, listen on PORT. Max 300 lines.
- `migrate.js` — Migration runner. Runs on every deploy via `npm run build`.
- `db/` — Database modules. One file per entity. All queries go here, never inline in routes.
- `routes/` — Express routers. One file per endpoint group. Mounted in server.js.
- `middleware/` — Shared Express middleware (auth, analytics tracking).
- `migrations/` — DB schema migrations (one file per change, timestamp-prefixed).
- `public/` — Static HTML/CSS/JS. Admin and client-facing pages.

## Database

| Table | What it stores |
|---|---|
| `admin_users` | Admin login credentials (email, bcrypt hash) |
| `admin_sessions` | Session store for express-session |
| `service_tiers` | MSP pricing plans (Essential $89, Professional $149, Enterprise $219 — per user/mo) |
| `clients` | MSP client businesses |
| `contracts` | Formal service agreements per client |
| `tickets` | Client support requests |
| `page_views` | Server-side page view tracking (path, referrer, ip_hash, ts) |
| `users` | Polsia sync table (stripe subscription, plan) |
| `_migrations` | Migration tracker |

## External integrations

- **OpenAI** — AI-powered features via `openai` npm package
- **Stripe** — Payment links for subscriptions (via platform)
- **Session store** — connect-pg-simple backed by PostgreSQL

## Recent changes

- 2026-05-01 — Updated service_tiers pricing to match 9ksystems.net exactly: $89/$149/$219 per user/mo with market rate savings text
- 2026-05-01 — Added /download-source endpoint (token-protected zip export of project source, excludes node_modules/.git/.env)
- 2026-05-01 — Added page view analytics (page_views table, tracking middleware, /admin/analytics)
- 2026-05-01 — Initial codebase extraction (routes → routes/, pool → db/)