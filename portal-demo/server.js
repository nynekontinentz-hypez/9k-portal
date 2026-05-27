const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const { initialize } = require('./db/index');

async function main() {
  await initialize();

  const db = require('./db/index');
  const app = express();
  const port = process.env.PORT || 3000;

  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.SESSION_SECRET || '9k-portal-demo-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    },
    name: 'portal.sid'
  }));

  app.use((req, res, next) => {
    if (req.accepts('html') && !req.path.startsWith('/api/')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
  });

  app.get('/health', (req, res) => res.json({ status: 'healthy' }));
  app.use(express.static(path.join(__dirname, 'public')));

  const { trackPageView } = require('./middleware/analytics');
  app.use((req, res, next) => {
    res.on('finish', () => trackPageView(req));
    next();
  });

  app.use(require('./routes/pages'));
  app.use(require('./routes/admin-auth'));
  app.use(require('./routes/admin'));
  app.use('/api', require('./routes/api/public'));
  app.use('/api', require('./routes/api/admin'));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    const html = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(html)) res.type('html').send(fs.readFileSync(html, 'utf8'));
    else res.status(404).json({ error: 'Not found' });
  });

  app.listen(port, () => {
    console.log(`\n  9K Portal Demo running on http://localhost:${port}`);
    console.log(`  Public:  http://localhost:${port}`);
    console.log(`  Admin:   http://localhost:${port}/admin`);
    console.log(`  Login:   admin@9ksystems.net / admin9kos\n`);
  });
}

main().catch(console.error);
