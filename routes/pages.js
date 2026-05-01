/**
 * Public static page routes.
 * Owns: HTML page serving for public-facing pages.
 * Does NOT own: admin pages, API endpoints, or SPA fallback.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const slug = process.env.POLSIA_ANALYTICS_SLUG || '';

function serveHtml(filePath, res) {
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace('__POLSIA_SLUG__', slug);
    res.type('html').send(html);
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
}

const publicDir = path.join(__dirname, '..', 'public');

router.get('/', (req, res) => {
  serveHtml(path.join(publicDir, 'index.html'), res);
});

router.get('/services', (req, res) => {
  serveHtml(path.join(publicDir, 'services.html'), res);
});

router.get('/submit-ticket', (req, res) => {
  serveHtml(path.join(publicDir, 'submit-ticket.html'), res);
});

router.get('/blog/why-generic-msps-fail-dental-practices', (req, res) => {
  serveHtml(path.join(publicDir, 'blog', 'why-generic-msps-fail-dental-practices.html'), res);
});

module.exports = router;