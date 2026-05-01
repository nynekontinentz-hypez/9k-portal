/**
 * Database pool singleton.
 * All query execution routes through this module — never create additional pools.
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

module.exports = { pool };