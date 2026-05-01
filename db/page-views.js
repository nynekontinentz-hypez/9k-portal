/**
 * Page views analytics queries.
 * Owns: page_views table.
 * Does NOT own: any other tables or business logic.
 */
const { pool } = require('./index');

/** Insert a page view. Returns the inserted row. */
async function insertPageView({ path, referrer, userAgent, ipHash }) {
  const result = await pool.query(
    `INSERT INTO page_views (path, referrer, user_agent, ip_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, path, referrer, created_at`,
    [path, referrer || null, userAgent || null, ipHash || null]
  );
  return result.rows[0];
}

/** Total views in a given time window (in days). */
async function getTotalViews(days) {
  const result = await pool.query(
    `SELECT COUNT(*) as total
     FROM page_views
     WHERE created_at >= NOW() - INTERVAL '1 day' * $1`,
    [days]
  );
  return parseInt(result.rows[0].total);
}

/** Top N pages by view count in a given time window. */
async function getTopPages(days, limit = 10) {
  const result = await pool.query(
    `SELECT path, COUNT(*) as views
     FROM page_views
     WHERE created_at >= NOW() - INTERVAL '1 day' * $1
     GROUP BY path
     ORDER BY views DESC
     LIMIT $2`,
    [days, limit]
  );
  return result.rows;
}

/** Referrer breakdown — count of views per referrer domain. */
async function getReferrerBreakdown(days) {
  const result = await pool.query(
    `SELECT
       CASE
         WHEN referrer IS NULL OR referrer = '' THEN '(direct)'
         WHEN referrer ~* 'google' THEN 'Google'
         WHEN referrer ~* 'bing' THEN 'Bing'
         WHEN referrer ~* 'facebook' THEN 'Facebook'
         WHEN referrer ~* 'linkedin' THEN 'LinkedIn'
         WHEN referrer ~* 'twitter' THEN 'Twitter / X'
         WHEN referrer ~* 't.co' THEN 'Twitter / X'
         ELSE 'Other'
       END as source,
       COUNT(*) as views
     FROM page_views
     WHERE created_at >= NOW() - INTERVAL '1 day' * $1
     GROUP BY source
     ORDER BY views DESC`,
    [days]
  );
  return result.rows;
}

/** Daily view counts for the last N days. */
async function getViewsOverTime(days) {
  const result = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as views
     FROM page_views
     WHERE created_at >= NOW() - INTERVAL '1 day' * $1
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [days]
  );
  return result.rows;
}

module.exports = { insertPageView, getTotalViews, getTopPages, getReferrerBreakdown, getViewsOverTime };