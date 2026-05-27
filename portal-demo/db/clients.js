const { all, get, run } = require('./index');

function listClients(status) {
  let sql = 'SELECT c.*, st.name as tier_name, st.monthly_price as tier_price FROM clients c LEFT JOIN service_tiers st ON c.service_tier_id = st.id';
  const params = [];
  if (status) { sql += ' WHERE c.status = ?'; params.push(status); }
  sql += ' ORDER BY c.created_at DESC';
  return all(sql, params);
}

function getClientById(id) {
  return get('SELECT c.*, st.name as tier_name, st.monthly_price as tier_price FROM clients c LEFT JOIN service_tiers st ON c.service_tier_id = st.id WHERE c.id = ?', [id]);
}

function createClient({ company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes }) {
  run('INSERT INTO clients (company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [company_name, contact_name, contact_email, contact_phone || null, address || null, service_tier_id || null, status || 'prospect', notes || null]);
  const row = get('SELECT MAX(id) as id FROM clients');
  return getClientById(row.id);
}

function updateClient(id, fields) {
  const sets = []; const params = [];
  ['company_name','contact_name','contact_email','contact_phone','address','service_tier_id','status','notes'].forEach(k => {
    if (fields[k] !== undefined) { sets.push(`${k} = ?`); params.push(fields[k]); }
  });
  sets.push("updated_at = datetime('now')");
  params.push(id);
  run(`UPDATE clients SET ${sets.join(', ')} WHERE id = ?`, params);
  return getClientById(id);
}

function deleteClient(id) {
  run('DELETE FROM clients WHERE id = ?', [id]);
}

module.exports = { listClients, getClientById, createClient, updateClient, deleteClient };
