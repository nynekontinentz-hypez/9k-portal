/**
 * Admin authentication middleware.
 * Redirects HTML requests to /admin/login; returns 401 for API requests.
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.redirect('/admin/login');
}

module.exports = { requireAdmin };