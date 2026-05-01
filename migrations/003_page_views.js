module.exports = {
  name: '003_page_views',
  up: async (client) => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        path VARCHAR(2048) NOT NULL,
        referrer VARCHAR(2048),
        user_agent VARCHAR(1024),
        ip_hash VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)
    `);
  }
};