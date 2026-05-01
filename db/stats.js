/**
 * Dashboard stats queries.
 * Owns: aggregated counts across clients, tickets, contracts tables.
 * Does NOT own: individual table queries (see respective db/ modules).
 */
const { pool } = require('./index');

async function getDashboardStats() {
  const [clients, tickets, contracts, mrr] = await Promise.all([
    pool.query('SELECT status, COUNT(*) as count FROM clients GROUP BY status'),
    pool.query('SELECT status, COUNT(*) as count FROM tickets GROUP BY status'),
    pool.query('SELECT status, COUNT(*) as count FROM contracts GROUP BY status'),
    pool.query(`SELECT COALESCE(SUM(monthly_rate), 0) as total FROM contracts WHERE status = 'active'`)
  ]);

  return {
    clients: {
      total: clients.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
      by_status: Object.fromEntries(clients.rows.map(r => [r.status, parseInt(r.count)]))
    },
    tickets: {
      total: tickets.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
      by_status: Object.fromEntries(tickets.rows.map(r => [r.status, parseInt(r.count)]))
    },
    contracts: {
      total: contracts.rows.reduce((sum, r) => sum + parseInt(r.count), 0),
      by_status: Object.fromEntries(contracts.rows.map(r => [r.status, parseInt(r.count)]))
    },
    mrr: parseFloat(mrr.rows[0].total)
  };
}

module.exports = { getDashboardStats };