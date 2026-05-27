# 9K Solutions — MSP Product Suite

Three independent deliverables for a Managed Service Provider business:

## Contents

| Directory | Description |
|-----------|-------------|
| `portal-demo/` | Standalone MSP client portal with admin dashboard |
| `msp-dashboard/` | White-label PWA admin dashboard for MSPs |
| `msp-playbooks/` | Industry-specific sales playbooks (3 verticals) |

## Quick Start

### portal-demo

```bash
cd portal-demo
npm install
npm run seed
npm start
# → http://localhost:3000
# Login: admin@9ksystems.net / admin9kos
```

### msp-dashboard

```bash
cd msp-dashboard/api
npm install
node seed.js
node server.js
# → API on :3001, open admin/index.html in browser
# Login: admin / admin9kos
```

### msp-playbooks

Three markdown playbooks for dental, real estate, and professional services verticals.

## Docker

```bash
docker-compose up
```

Starts both portal-demo (port 3000) and msp-dashboard (port 3001).

## Architecture

- **Zero native modules:** sql.js (pure JS SQLite) replaces better-sqlite3 — works on any platform
- **No external databases:** Every app is self-contained with file-based SQLite
- **Persistent:** sql.js saves to `.db` file on every write
- **No build step:** Frontend is vanilla HTML+CSS+JS, served directly