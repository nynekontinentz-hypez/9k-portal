/**
 * Service tier queries.
 * Owns: service_tiers table.
 */
const { pool } = require('./index');

async function listTiers() {
  return pool.query('SELECT * FROM service_tiers ORDER BY monthly_price ASC');
}

async function createTier({ name, description, monthly_price, features, is_active }) {
  return pool.query(
    `INSERT INTO service_tiers (name, description, monthly_price, features, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, description || '', monthly_price, features || [], is_active !== false]
  );
}

async function updateTier(id, { name, description, monthly_price, features, is_active }) {
  return pool.query(
    `UPDATE service_tiers SET name=$1, description=$2, monthly_price=$3,
     features=$4, is_active=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
    [name, description, monthly_price, features || [], is_active, id]
  );
}

async function deleteTier(id) {
  return pool.query('DELETE FROM service_tiers WHERE id=$1 RETURNING id', [id]);
}

module.exports = { listTiers, createTier, updateTier, deleteTier };