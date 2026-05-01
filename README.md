# NineKOS — MSP Client Portal

IT services client portal for NineKOS. Admins manage clients, contracts, service tiers, and support tickets. Clients submit tickets via a public form; admins track and resolve them. Public-facing pages show service plans and blog content.

**Live:** https://ninekos.polsia.app

---

## Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Neon recommended for managed hosting)
- **Sessions:** PostgreSQL-backed via `connect-pg-simple`
- **Deployment:** Render (configured via `render.yaml`)

---

## Project Structure

```
server.js          App entry — middleware, route mounts, listen. Stay under 300 lines.
migrate.js         Migration runner — runs automatically on deploy (npm run build).
db/                Database layer. One file per entity. All queries go here.
  index.js         Pool singleton (the only place new Pool() is created).
  clients.js       Client CRUD queries.
  contracts.js     Contract queries.
  tickets.js       Support ticket queries.
  tiers.js         Service tier queries.
  admin-users.js   Admin user auth queries.
  page-views.js    Page view analytics queries.
  stats.js         Dashboard statistics queries.
routes/            Express routers. One file per endpoint group.
  pages.js         Public HTML page routes (/, /services, /blog/*, /submit-ticket).
  admin-auth.js    Admin login/logout (/admin/login, /admin/logout).
  admin.js         Admin dashboard HTML routes (/admin, /admin/clients, etc.).
  api/
    public.js      Public API endpoints (ticket submission, tiers).
    admin.js       Protected admin API endpoints (CRUD for clients, contracts, etc.).
middleware/
  auth.js          Session-based auth middleware (requireAdmin).
  analytics.js     Fire-and-forget page view tracking.
migrations/        Database schema migrations (timestamp-prefixed, run once each).
public/            Static HTML/CSS/JS served directly.
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `PORT` | No | Server port (default: 3000) |
| `SESSION_SECRET` | Recommended | Secret for signing session cookies. Auto-generated if missing (sessions invalidated on restart). |
| `NODE_ENV` | No | Set to `production` for secure cookies and cold-start prevention. |
| `OPENAI_API_KEY` | No | Required only if AI features are enabled. |

---

## Database

Migrations run automatically via `npm run build` (which calls `node migrate.js`). Tables:

| Table | What it stores |
|---|---|
| `admin_users` | Admin login credentials (email + bcrypt hash) |
| `admin_sessions` | Express session store (auto-created by connect-pg-simple) |
| `service_tiers` | MSP pricing plans — Essential ($499), Professional ($999), Enterprise ($1,999) |
| `clients` | MSP client businesses |
| `contracts` | Formal service agreements per client |
| `tickets` | Client support requests (open/in-progress/resolved) |
| `page_views` | Server-side analytics (path, referrer, hashed IP, timestamp) |
| `users` | Reserved for subscription sync (not used in standalone mode) |
| `_migrations` | Migration tracker — which migrations have been applied |

---

## Running Locally

### 1. Clone and install

```bash
git clone <your-repo-url>
cd ninekos
npm install
```

### 2. Create a PostgreSQL database

Use [Neon](https://neon.tech) (free tier works), Supabase, or a local Postgres instance.

### 3. Set environment variables

```bash
# Create a .env file (not committed — add to .gitignore)
DATABASE_URL=postgresql://user:password@host/dbname
SESSION_SECRET=your-random-secret-here
PORT=3000
```

Or export them in your shell:

```bash
export DATABASE_URL="postgresql://..."
export SESSION_SECRET="any-random-string"
```

### 4. Run migrations and start

```bash
npm run migrate      # Creates all tables and seeds service tiers
npm start            # Starts the server on PORT (default 3000)
```

For development with auto-restart:

```bash
npm run dev          # Uses node directly (add nodemon yourself if preferred)
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Admin Access

The admin portal is at `/admin/login`. To create your first admin account, insert a hashed password directly:

```bash
# Generate a bcrypt hash (Node.js one-liner)
node -e "const b=require('bcryptjs'); b.hash('yourpassword', 10).then(h => console.log(h))"

# Then insert into the database
psql $DATABASE_URL -c "INSERT INTO admin_users (email, password_hash) VALUES ('admin@yourdomain.com', '<hash-from-above>')"
```

---

## Deployment (Render)

The `render.yaml` configures automatic deployment:

- **Build command:** `npm install` (then `npm run build` runs migrations)
- **Start command:** `npm start`
- **Health check:** `/health`

Required environment variables to set in Render dashboard:
- `DATABASE_URL` — your Neon or other Postgres connection string
- `SESSION_SECRET` — a strong random string (generate with `openssl rand -hex 32`)
- `NODE_ENV=production`

Deploy on any push to `main`. Migrations run automatically before the server starts.

---

## Adding Migrations

Create a new file in `migrations/` with a timestamp prefix:

```js
// migrations/1746000000000_add_blog_posts.js
module.exports = {
  name: 'add_blog_posts',
  up: async (client) => {
    await client.query(`
      CREATE TABLE blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) NOT NULL UNIQUE,
        content TEXT,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  }
};
```

The runner applies each migration exactly once, tracked in `_migrations`.

---

## Architecture Rules

- **`server.js` stays under 300 lines** — wiring only, no business logic.
- **All DB queries live in `db/`** — never `pool.query()` in routes or middleware.
- **All DDL lives in `migrations/`** — never in runtime files.
- **Routes are `express.Router()` modules** — mounted in `server.js`.
- **New tables = new migration file** — never modify an existing migration.
