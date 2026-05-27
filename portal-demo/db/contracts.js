const { all, get, run } = require('./index');

function listContracts({ client_id, status } = {}) {
  let sql = 'SELECT co.*, c.company_name, c.contact_name, st.name as tier_name FROM contracts co LEFT JOIN clients c ON co.client_id = c.id LEFT JOIN service_tiers st ON co.service_tier_id = st.id';
  const conditions = []; const params = [];
  if (client_id) { conditions.push('co.client_id = ?'); params.push(client_id); }
  if (status) { conditions.push('co.status = ?'); params.push(status); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY co.created_at DESC';
  return all(sql, params);
}

function getContractById(id) {
  return get('SELECT co.*, c.company_name, st.name as tier_name FROM contracts co LEFT JOIN clients c ON co.client_id = c.id LEFT JOIN service_tiers st ON co.service_tier_id = st.id WHERE co.id = ?', [id]);
}

function createContract({ client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes }) {
  run('INSERT INTO contracts (client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [client_id, service_tier_id || null, start_date, end_date || null, monthly_rate, status || 'draft', notes || null]);
  const row = get('SELECT MAX(id) as id FROM contracts');
  return getContractById(row.id);
}

function updateContract(id, fields) {
  const sets = []; const params = [];
  ['client_id','service_tier_id','start_date','end_date','monthly_rate','status','notes'].forEach(k => {
    if (fields[k] !== undefined) { sets.push(`${k} = ?`); params.push(fields[k]); }
  });
  sets.push("updated_at = datetime('now')");
  params.push(id);
  run(`UPDATE contracts SET ${sets.join(', ')} WHERE id = ?`, params);
  return getContractById(id);
}

function deleteContract(id) {
  run('DELETE FROM contracts WHERE id = ?', [id]);
}

module.exports = { listContracts, getContractById, createContract, updateContract, deleteContract };
