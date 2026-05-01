const bcrypt = require('bcryptjs');

module.exports = {
  name: 'admin_users',
  up: async (client) => {
    // Create admin_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Unique index on email (case-insensitive)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_unique_idx ON admin_users (LOWER(email))
    `);

    // Create session storage table for connect-pg-simple
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        PRIMARY KEY (sid)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS admin_sessions_expire_idx ON admin_sessions (expire)
    `);

    // Seed default admin account
    const hash = await bcrypt.hash('9ksystems2026!', 10);
    await client.query(
      `INSERT INTO admin_users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      ['admin@9ksystems.net', hash]
    );
  }
};
