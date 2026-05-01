/**
 * Client queries.
 * Owns: clients table.
 */
const { pool } = require('./index');

async function listClients(status) {
  let query = `
    SELECT c.*, st.name as tier_name, st.monthly_price as tier_price
    FROM clients c
    LEFT JOIN service_tiers st ON c.service_tier_id = st.id
  `;
  const params = [];
  if (status) { query += ' WHERE c.status = $1'; params.push(status); }
  query += ' ORDER BY c.created_at DESC';
  return pool.query(query, params);
}

async function getClientById(id) {
  return pool.query(
    `SELECT c.*, st.name as tier_name, st.monthly_price as tier_price
     FROM clients c
     LEFT JOIN service_tiers st ON c.service_tier_id = st.id
     WHERE c.id = $1`,
    [id]
  );
}

async function createClient({ company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes }) {
  return pool.query(
    `INSERT INTO clients (company_name, contact_name, contact_email, contact_phone, address,
     service_tier_id, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [company_name, contact_name, contact_email, contact_phone || null, address || null,
     service_tier_id || null, status || 'prospect', notes || null]
  );
}

async function updateClient(id, { company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes }) {
  return pool.query(
    `UPDATE clients SET company_name=$1, contact_name=$2, contact_email=$3,
     contact_phone=$4, address=$5, service_tier_id=$6, status=$7, notes=$8,
     updated_at=NOW() WHERE id=$9 RETURNING *`,
    [company_name, contact_name, contact_email, contact_phone, address,
     service_tier_id || null, status, notes, id]
  );
}

async function deleteClient(id) {
  return pool.query('DELETE FROM clients WHERE id=$1 RETURNING id', [id]);
}

module.exports = { listClients, getClientById, createClient, updateClient, deleteClient };