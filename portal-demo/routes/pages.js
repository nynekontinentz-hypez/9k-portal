const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const publicDir = path.join(__dirname, '..', 'public');

function serveHtml(filePath, res) {
  if (fs.existsSync(filePath)) {
    res.type('html').send(fs.readFileSync(filePath, 'utf8'));
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
}

router.get('/', (req, res) => serveHtml(path.join(publicDir, 'index.html'), res));
router.get('/services', (req, res) => serveHtml(path.join(publicDir, 'services.html'), res));
router.get('/submit-ticket', (req, res) => serveHtml(path.join(publicDir, 'submit-ticket.html'), res));

module.exports = router;
