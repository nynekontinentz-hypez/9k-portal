/**
 * Admin authentication routes (login, logout).
 * Owns: admin login/logout flow, session management.
 * Does NOT own: general auth checks (see middleware/auth.js).
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { findByEmail } = require('../db/admin-users');

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

router.get('/login', (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin');
  }
  serveHtml(path.join(__dirname, '..', 'public', 'admin-login.html'), res);
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await findByEmail(email);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    res.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('ninekos.sid');
    res.json({ success: true });
  });
});

module.exports = router;