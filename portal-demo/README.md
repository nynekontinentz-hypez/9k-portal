# 9K Portal Demo

Standalone MSP client portal with SQLite (zero-config, no PostgreSQL).

## Quick Start

```bash
npm install
npm run seed    # Seeds demo data
npm start
```

Open http://localhost:3000

## Login

- **Admin:** http://localhost:3000/admin — `admin@9ksystems.net` / `admin9kos`

## Features

- **Public site:** homepage, services, submit ticket, FAQ, contact, privacy
- **Admin dashboard:** stats, MRR, revenue, tickets, clients, invoices
- **Ticket system:** filter, detail view with messages, reply, status updates
- **Client management:** search, detail view with ticket history, create
- **Contracts:** list all contracts with tier and rate info
- **Service tiers:** create/edit tiers with per-line features list
- **Invoicing:** create invoices, filter by status, mark paid/sent/overdue
- **Activity log:** chronological feed of all actions across the system
- **Analytics:** page views tracking, top pages, views over time
- **Auth:** session-based, auto-redirect on expiry

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /admin/login | No | Login |
| POST | /admin/logout | Yes | Logout |
| GET | /api/stats | Yes | Dashboard stats (incl. invoices/revenue) |
| GET | /api/tickets | Yes | List tickets |
| POST | /api/tickets | No | Create ticket |
| GET | /api/tickets/:id | Yes | Get ticket + messages |
| PUT | /api/tickets/:id | Yes | Update ticket |
| POST | /api/tickets/:id/reply | Yes | Reply to ticket |
| DELETE | /api/tickets/:id | Yes | Delete ticket |
| GET | /api/clients | Yes | List clients |
| GET | /api/clients/:id | Yes | Get client + tickets |
| POST | /api/clients | Yes | Create client |
| PUT | /api/clients/:id | Yes | Update client |
| DELETE | /api/clients/:id | Yes | Delete client |
| GET | /api/contracts | Yes | List contracts |
| POST | /api/contracts | Yes | Create contract |
| GET | /api/tiers | No | List service tiers |
| POST | /api/tiers | Yes | Create tier |
| GET | /api/invoices | Yes | List invoices (filterable) |
| POST | /api/invoices | Yes | Create invoice |
| PUT | /api/invoices/:id | Yes | Update invoice status |
| DELETE | /api/invoices/:id | Yes | Delete invoice |
| GET | /api/activities | Yes | Activity log |
| GET | /api/analytics | Yes | Page view analytics |

## Docker

```bash
docker build -t portal-demo .
docker run -p 3000:3000 portal-demo
```

Or with docker-compose (from project root):

```bash
docker-compose up portal-demo
```

## Database

SQLite file at `data/portal.db`. Delete it to reset, then re-run `npm run seed`.

## Tech Stack

- **Backend:** Node.js + Express + sql.js (pure JS SQLite)
- **Frontend:** HTML + CSS + vanilla JS (no frameworks)
- **Auth:** express-session with memory store
- **No native modules** — works on any platform that runs Node.js