/**
 * Page view tracking middleware.
 * Runs after every request — logs the path, referrer, user-agent, and hashed IP.
 * Skips: /health, /api/*, favicon.ico, static assets.
 *
 * Does NOT block the response — fire-and-forget insert with no impact on latency.
 */
const crypto = require('crypto');
const { insertPageView } = require('../db/page-views');

const SKIP_PATHS = new Set([
  '/health',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
]);

const SKIP_PREFIXES = ['/api/', '/public/', '/admin/api/'];

function shouldSkip(path) {
  if (SKIP_PATHS.has(path)) return true;
  for (const prefix of SKIP_PREFIXES) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}

function hashIP(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

function trackPageView(req) {
  if (shouldSkip(req.path)) return;

  const ipHash = hashIP(req.ip || req.headers['x-forwarded-for'] || '');
  const referrer = req.headers['referer'] || req.headers['referrer'] || '';

  insertPageView({
    path: req.path,
    referrer,
    userAgent: req.headers['user-agent'] || '',
    ipHash,
  }).catch(err => {
    // Silent catch — analytics failures must never affect user requests
    console.error('Page view tracking failed:', err.message);
  });
}

module.exports = { trackPageView };