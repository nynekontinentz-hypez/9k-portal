/**
 * NineKOS App Entry Point
 *
 * Wire middleware, mount routes, start server.
 * Business logic lives in routes/, db/, and middleware/.
 * This file stays under 300 lines — never add logic here.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const { pool } = require('./db/index');

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

// Trust proxy for Render (secure cookies behind reverse proxy)
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session Middleware ──────────────────────────────────

const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

app.use(session({
  store: new PgSession({ pool, tableName: 'admin_sessions', createTableIfMissing: true }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
  name: 'ninekos.sid'
}));

// No-cache headers for HTML pages
app.use((req, res, next) => {
  if (req.accepts('html') && !req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// ─── Health Check ────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// ─── Source Download (temporary) ─────────────────────────

app.use('/download-source', require('./routes/download-source'));

// ─── Block direct admin HTML access ─────────────────────

app.use((req, res, next) => {
  if (req.path === '/admin.html' || req.path === '/admin-login.html') {
    return res.redirect(req.path === '/admin.html' ? '/admin' : '/admin/login');
  }
  next();
});

// ─── Static Files ────────────────────────────────────────

app.use(express.static(path.join(__dirname, 'public')));

// ─── Page View Tracking ──────────────────────────────────
// Fire-and-forget insert after every request (except skipped paths)
const { trackPageView } = require('./middleware/analytics');
app.use((req, res, next) => {
  res.on('finish', () => trackPageView(req));
  next();
});

// ─── Route Mounts ────────────────────────────────────────

app.use(require('./routes/pages'));
app.use(require('./routes/admin-auth'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api/public'));
app.use('/api', require('./routes/api/admin'));

// ─── Catch-all (SPA fallback for non-API paths) ─────────

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  const html = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(html)) {
    res.type('html').send(fs.readFileSync(html, 'utf8'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// ─── Cold Start Prevention (production only) ────────────

const http = require('http');
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    http.get(`http://localhost:${port}/health`, () => {}).on('error', () => {});
  }, 720000); // 12 minutes
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});