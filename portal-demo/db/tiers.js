const { all, get, run } = require('./index');

function listTiers() {
  return all('SELECT * FROM service_tiers ORDER BY monthly_price ASC');
}

function createTier({ name, description, monthly_price, features, is_active }) {
  run('INSERT INTO service_tiers (name, description, monthly_price, features, is_active) VALUES (?, ?, ?, ?, ?)',
    [name, description || '', monthly_price, JSON.stringify(features || []), is_active !== false ? 1 : 0]);
  const row = get('SELECT MAX(id) as id FROM service_tiers');
  return get('SELECT * FROM service_tiers WHERE id = ?', [row.id]);
}

function updateTier(id, { name, description, monthly_price, features, is_active }) {
  run("UPDATE service_tiers SET name=?, description=?, monthly_price=?, features=?, is_active=?, updated_at=datetime('now') WHERE id=?",
    [name, description, monthly_price, JSON.stringify(features || []), is_active, id]);
  return get('SELECT * FROM service_tiers WHERE id = ?', [id]);
}

function deleteTier(id) {
  run('DELETE FROM service_tiers WHERE id = ?', [id]);
}

module.exports = { listTiers, createTier, updateTier, deleteTier };
