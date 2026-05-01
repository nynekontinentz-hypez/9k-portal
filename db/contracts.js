/**
 * Contract queries.
 * Owns: contracts table.
 */
const { pool } = require('./index');

async function listContracts({ client_id, status }) {
  let query = `
    SELECT co.*, c.company_name, c.contact_name, st.name as tier_name
    FROM contracts co
    LEFT JOIN clients c ON co.client_id = c.id
    LEFT JOIN service_tiers st ON co.service_tier_id = st.id
  `;
  const conditions = [];
  const params = [];
  if (client_id) { params.push(client_id); conditions.push(`co.client_id = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`co.status = $${params.length}`); }
  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY co.created_at DESC';
  return pool.query(query, params);
}

async function createContract({ client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes }) {
  return pool.query(
    `INSERT INTO contracts (client_id, service_tier_id, start_date, end_date,
     monthly_rate, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [client_id, service_tier_id || null, start_date, end_date || null,
     monthly_rate, status || 'draft', notes || null]
  );
}

async function updateContract(id, { client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes }) {
  return pool.query(
    `UPDATE contracts SET client_id=$1, service_tier_id=$2, start_date=$3,
     end_date=$4, monthly_rate=$5, status=$6, notes=$7, updated_at=NOW()
     WHERE id=$8 RETURNING *`,
    [client_id, service_tier_id || null, start_date, end_date || null,
     monthly_rate, status, notes, id]
  );
}

async function deleteContract(id) {
  return pool.query('DELETE FROM contracts WHERE id=$1 RETURNING id', [id]);
}

module.exports = { listContracts, createContract, updateContract, deleteContract };