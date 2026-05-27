const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { findByEmail } = require('../db/admin-users');

const publicDir = path.join(__dirname, '..', 'public');

function serveHtml(filePath, res) {
  if (fs.existsSync(filePath)) {
    res.type('html').send(fs.readFileSync(filePath, 'utf8'));
  } else {
    res.status(404).json({ error: 'Page not found' });
  }
}

router.get('/admin/login', (req, res) => {
  if (req.session && req.session.adminId) return res.redirect('/admin');
  serveHtml(path.join(publicDir, 'admin-login.html'), res);
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const admin = findByEmail(email);
    if (!admin) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('portal.sid');
    res.json({ success: true });
  });
});

module.exports = router;
