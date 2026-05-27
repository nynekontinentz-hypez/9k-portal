const { all, get, run } = require('./index');

function listInvoices(filters = {}) {
  let sql = 'SELECT i.*, c.company_name, c.contact_name FROM invoices i LEFT JOIN clients c ON i.client_id = c.id';
  const conditions = []; const params = [];
  if (filters.status) { conditions.push('i.status = ?'); params.push(filters.status); }
  if (filters.client_id) { conditions.push('i.client_id = ?'); params.push(filters.client_id); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY i.created_at DESC';
  return all(sql, params);
}

function getInvoiceById(id) {
  return get('SELECT i.*, c.company_name, c.contact_name FROM invoices i LEFT JOIN clients c ON i.client_id = c.id WHERE i.id = ?', [id]);
}

function createInvoice(data) {
  const due = data.due_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const number = 'INV-' + String(Date.now()).slice(-6);
  run('INSERT INTO invoices (invoice_number, client_id, contract_id, amount, status, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [number, data.client_id || null, data.contract_id || null, data.amount, data.status || 'pending', due, data.notes || '']);
  const row = get('SELECT i.*, c.company_name, c.contact_name FROM invoices i LEFT JOIN clients c ON i.client_id = c.id ORDER BY i.id DESC LIMIT 1');
  recordActivity('invoice_created', `Invoice ${number} created for $${data.amount}`, 'invoice', row.id);
  return row;
}

function updateInvoice(id, data) {
  const sets = []; const params = [];
  ['amount', 'status', 'due_date', 'paid_at', 'paid_amount', 'notes'].forEach(k => {
    if (data[k] !== undefined) { sets.push(`${k} = ?`); params.push(data[k]); }
  });
  if (data.status === 'paid' && !data.paid_at) {
    sets.push("paid_at = datetime('now')");
  }
  if (sets.length) {
    sets.push("updated_at = datetime('now')");
    params.push(id);
    run(`UPDATE invoices SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  const inv = getInvoiceById(id);
  if (inv && data.status) recordActivity(`invoice_${data.status}`, `Invoice ${inv.invoice_number} marked as ${data.status}`, 'invoice', id);
  return inv;
}

function deleteInvoice(id) {
  run('DELETE FROM invoices WHERE id = ?', [id]);
}

function recordActivity(type, description, entity_type, entity_id) {
  run('INSERT INTO activities (type, description, entity_type, entity_id) VALUES (?, ?, ?, ?)', [type, description, entity_type || null, entity_id || null]);
}

function listActivities(limit = 20) {
  return all('SELECT * FROM activities ORDER BY created_at DESC LIMIT ?', [limit]);
}

module.exports = { listInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice, recordActivity, listActivities };