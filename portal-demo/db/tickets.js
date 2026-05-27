const { all, get, run } = require('./index');

function listTickets({ status, priority, client_id } = {}) {
  let sql = 'SELECT t.*, c.company_name FROM tickets t LEFT JOIN clients c ON t.client_id = c.id';
  const conditions = []; const params = [];
  if (status) { conditions.push('t.status = ?'); params.push(status); }
  if (priority) { conditions.push('t.priority = ?'); params.push(priority); }
  if (client_id) { conditions.push('t.client_id = ?'); params.push(client_id); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY t.created_at DESC';
  return all(sql, params);
}

function getTicketById(id) {
  return get('SELECT t.*, c.company_name FROM tickets t LEFT JOIN clients c ON t.client_id = c.id WHERE t.id = ?', [id]);
}

function createTicket({ client_id, subject, description, priority, category, contact_name, contact_email, contact_phone }) {
  run('INSERT INTO tickets (client_id, subject, description, priority, category, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [client_id || null, subject, description, priority || 'medium', category || null, contact_name || null, contact_email || null, contact_phone || null]);
  const row = get('SELECT MAX(id) as id FROM tickets');
  return getTicketById(row.id);
}

function updateTicket(id, { status, priority, resolution_notes }) {
  const sets = []; const params = [];
  if (status !== undefined) { sets.push('status = ?'); params.push(status); }
  if (priority !== undefined) { sets.push('priority = ?'); params.push(priority); }
  if (resolution_notes !== undefined) { sets.push('resolution_notes = ?'); params.push(resolution_notes); }
  if (status === 'resolved' || status === 'closed') sets.push("resolved_at = datetime('now')");
  sets.push("updated_at = datetime('now')");
  params.push(id);
  run(`UPDATE tickets SET ${sets.join(', ')} WHERE id = ?`, params);
  return getTicketById(id);
}

function deleteTicket(id) {
  run('DELETE FROM ticket_messages WHERE ticket_id = ?', [id]);
  run('DELETE FROM tickets WHERE id = ?', [id]);
}

function getTicketMessages(ticketId) {
  return all('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC', [ticketId]);
}

function addTicketMessage(ticketId, fromType, author, text) {
  run('INSERT INTO ticket_messages (ticket_id, from_type, author, text) VALUES (?, ?, ?, ?)', [ticketId, fromType, author, text]);
}

module.exports = { listTickets, getTicketById, createTicket, updateTicket, deleteTicket, getTicketMessages, addTicketMessage };
