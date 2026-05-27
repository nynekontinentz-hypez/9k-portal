const crypto = require('crypto');
const { insertPageView } = require('../db/page-views');

const SKIP_PATHS = new Set(['/health', '/favicon.ico', '/apple-touch-icon.png']);
const SKIP_PREFIXES = ['/api/', '/admin/', '/public/'];

function shouldSkip(path) {
  if (SKIP_PATHS.has(path)) return true;
  for (const p of SKIP_PREFIXES) { if (path.startsWith(p)) return true; }
  return false;
}

function hashIP(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

function trackPageView(req) {
  if (shouldSkip(req.path)) return;
  try {
    insertPageView({
      path: req.path,
      referrer: req.headers['referer'] || req.headers['referrer'] || '',
      userAgent: req.headers['user-agent'] || '',
      ipHash: hashIP(req.ip || req.headers['x-forwarded-for'] || ''),
    });
  } catch (e) {
    // analytics errors non-fatal
  }
}

module.exports = { trackPageView };
