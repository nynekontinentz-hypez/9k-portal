# MSP Admin Dashboard

Standalone PWA admin dashboard for MSPs. Manages tickets, clients, invoices, and support operations with a mobile-first dark UI. White-label ready.

## Stack

- **Backend:** Node.js + Express + SQLite (zero-config persistence)
- **Frontend:** Single-page PWA with offline support, dark theme
- **Auth:** JWT-based with bcrypt password hashing

## Quick Start

```bash
cd api
npm install
node seed.js    # Seeds demo data
node server.js
```

Then open `admin/index.html` in a browser. Set API URL to `http://localhost:3001`. Login: `admin` / `admin9kos`.

## Features

- **Ticket management:** create, filter, search, reply, status transitions with detail panel
- **Client management:** searchable client list with ticket counts
- **Invoicing:** create invoices, filter by status (pending/sent/paid/overdue), mark paid/sent/overdue
- **Activity log:** chronological history of all system actions
- **Dashboard:** ticket counts, revenue stats, overdue alerts, category breakdown chart
- **PWA:** installable, mobile-first responsive, offline-ready (via manifest + service worker)
- **JWT auth:** 12-hour tokens with auto-refresh capability
- **Rate limiting:** 200 requests per 15 minutes per IP
- **Security:** Helmet headers, CORS configured, production-ready JWT secret

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Health check |
| POST | /api/auth/login | No | JWT login |
| POST | /api/auth/refresh | Yes | Refresh JWT |
| GET | /api/stats | Yes | Dashboard stats (incl. invoices) |
| GET | /api/tickets | Yes | List tickets (filterable) |
| POST | /api/tickets | No | Create ticket (public) |
| GET | /api/tickets/:id | Yes | Get ticket + messages |
| PATCH | /api/tickets/:id | Yes | Update status/priority/notes |
| POST | /api/tickets/:id/reply | Yes | Admin reply |
| POST | /api/tickets/:id/client-reply | No | Client reply |
| DELETE | /api/tickets/:id | Yes | Delete ticket |
| GET | /api/clients | Yes | List clients (searchable) |
| GET | /api/clients/:id | Yes | Client details + tickets |
| PATCH | /api/clients/:id | Yes | Update client |
| POST | /api/contact | No | Contact form → ticket |
| GET | /api/invoices | Yes | List invoices (filterable) |
| POST | /api/invoices | Yes | Create invoice |
| PATCH | /api/invoices/:id | Yes | Update invoice status |
| DELETE | /api/invoices/:id | Yes | Delete invoice |
| GET | /api/activities | Yes | Activity log |

## Deploy as a Product

### White-Label Steps:

1. **Branding:** Search and replace in `admin/index.html`:
   - "MSP Admin Dashboard" → Your product name
   - "MSP" → Your brand name
2. **Logo:** Replace `admin/icon-192.svg`
3. **Colors:** Edit CSS variables (`--gold`, `--surface`, etc.)
4. **Default API:** Change default URL in the JavaScript

### Pricing Ideas:

- **Solo MSP:** $9/mo (1 user, unlimited clients/tickets)
- **Team:** $29/mo (up to 5 techs)
- **White-label resell:** $99/mo (rebrand as your own)

### Docker

```bash
docker build -t msp-dashboard .
docker run -p 3001:3001 msp-dashboard
```

Or with docker-compose (from project root):

```bash
docker-compose up msp-dashboard
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | API server port |
| ADMIN_PASSWORD | admin9kos | Login password |
| JWT_SECRET | (auto) | JWT signing secret |
| DB_PATH | ../data/msp.db | SQLite file location |