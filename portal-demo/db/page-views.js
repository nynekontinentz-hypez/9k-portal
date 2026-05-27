const { all, get, run } = require('./index');

function insertPageView({ path, referrer, userAgent, ipHash }) {
  run('INSERT INTO page_views (path, referrer, user_agent, ip_hash) VALUES (?, ?, ?, ?)', [path, referrer || null, userAgent || null, ipHash || null]);
}

function getTotalViews(days) {
  const r = get("SELECT COUNT(*) as total FROM page_views WHERE created_at >= datetime('now', '-' || ? || ' days')", [days]);
  return r.total;
}

function getTopPages(days, limit = 10) {
  return all("SELECT path, COUNT(*) as views FROM page_views WHERE created_at >= datetime('now', '-' || ? || ' days') GROUP BY path ORDER BY views DESC LIMIT ?", [days, limit]);
}

function getReferrerBreakdown(days) {
  return all("SELECT CASE WHEN referrer IS NULL OR referrer = '' THEN '(direct)' ELSE 'Other' END as source, COUNT(*) as views FROM page_views WHERE created_at >= datetime('now', '-' || ? || ' days') GROUP BY source ORDER BY views DESC", [days]);
}

function getViewsOverTime(days) {
  return all("SELECT DATE(created_at) as date, COUNT(*) as views FROM page_views WHERE created_at >= datetime('now', '-' || ? || ' days') GROUP BY DATE(created_at) ORDER BY date ASC", [days]);
}

module.exports = { insertPageView, getTotalViews, getTopPages, getReferrerBreakdown, getViewsOverTime };
