/**
 * Ticket queries.
 * Owns: tickets table.
 */
const { pool } = require('./index');

async function listTickets({ status, priority, client_id }) {
  let query = `
    SELECT t.*, c.company_name
    FROM tickets t
    LEFT JOIN clients c ON t.client_id = c.id
  `;
  const conditions = [];
  const params = [];
  if (status) { params.push(status); conditions.push(`t.status = $${params.length}`); }
  if (priority) { params.push(priority); conditions.push(`t.priority = $${params.length}`); }
  if (client_id) { params.push(client_id); conditions.push(`t.client_id = $${params.length}`); }
  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY t.created_at DESC';
  return pool.query(query, params);
}

async function updateTicket(id, { status, priority, resolution_notes }) {
  const updates = [];
  const params = [];
  let idx = 1;
  if (status !== undefined) { updates.push(`status = $${idx++}`); params.push(status); }
  if (priority !== undefined) { updates.push(`priority = $${idx++}`); params.push(priority); }
  if (resolution_notes !== undefined) { updates.push(`resolution_notes = $${idx++}`); params.push(resolution_notes); }
  if (status === 'resolved' || status === 'closed') updates.push(`resolved_at = NOW()`);
  updates.push(`updated_at = NOW()`);
  params.push(id);
  return pool.query(
    `UPDATE tickets SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    params
  );
}

async function createTicket({ client_id, subject, description, priority, category, contact_name, contact_email, contact_phone }) {
  return pool.query(
    `INSERT INTO tickets (client_id, subject, description, priority, category,
     contact_name, contact_email, contact_phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [client_id || null, subject, description, priority || 'medium',
     category || null, contact_name || null, contact_email || null, contact_phone || null]
  );
}

module.exports = { listTickets, updateTicket, createTicket };