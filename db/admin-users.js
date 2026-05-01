/**
 * Admin user queries.
 * Owns: admin_users table.
 */
const { pool } = require('./index');

async function findByEmail(email) {
  return pool.query(
    'SELECT id, email, password_hash FROM admin_users WHERE LOWER(email) = LOWER($1)',
    [email.trim()]
  );
}

module.exports = { findByEmail };