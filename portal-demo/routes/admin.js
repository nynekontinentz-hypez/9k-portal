const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

const publicDir = path.join(__dirname, '..', 'public');

function serveHtml(filePath, res) {
  if (fs.existsSync(filePath)) {
    res.type('html').send(fs.readFileSync(filePath, 'utf8'));
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
}

router.get('/admin', requireAdmin, (req, res) => serveHtml(path.join(publicDir, 'admin.html'), res));
router.get('/admin/analytics', requireAdmin, (req, res) => serveHtml(path.join(publicDir, 'analytics.html'), res));

module.exports = router;
