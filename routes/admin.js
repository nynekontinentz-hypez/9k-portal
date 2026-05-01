/**
 * Protected admin pages (dashboard, analytics).
 * Requires: admin session (via requireAdmin middleware).
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

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

router.get('/analytics', requireAdmin, (req, res) => {
  serveHtml(path.join(__dirname, '..', 'public', 'analytics.html'), res);
});

router.get('/', requireAdmin, (req, res) => {
  serveHtml(path.join(__dirname, '..', 'public', 'admin.html'), res);
});

module.exports = router;