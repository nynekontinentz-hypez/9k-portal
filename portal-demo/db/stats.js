const { all, get } = require('./index');

function getDashboardStats() {
  const clients = all("SELECT status, COUNT(*) as count FROM clients GROUP BY status");
  const tickets = all("SELECT status, COUNT(*) as count FROM tickets GROUP BY status");
  const contracts = all("SELECT status, COUNT(*) as count FROM contracts GROUP BY status");
  const mrr = get("SELECT COALESCE(SUM(monthly_rate), 0) as total FROM contracts WHERE status = 'active'");
  const invoices = all("SELECT status, COUNT(*) as count FROM invoices GROUP BY status");
  const totalRevenue = get("SELECT COALESCE(SUM(paid_amount), 0) as total FROM invoices WHERE status = 'paid'");
  const pendingRevenue = get("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status IN ('pending', 'sent')");
  const overdueCount = get("SELECT COUNT(*) as count FROM invoices WHERE status = 'overdue'");

  return {
    clients: {
      total: clients.reduce((s, r) => s + r.count, 0),
      by_status: Object.fromEntries(clients.map(r => [r.status, r.count]))
    },
    tickets: {
      total: tickets.reduce((s, r) => s + r.count, 0),
      by_status: Object.fromEntries(tickets.map(r => [r.status, r.count]))
    },
    contracts: {
      total: contracts.reduce((s, r) => s + r.count, 0),
      by_status: Object.fromEntries(contracts.map(r => [r.status, r.count]))
    },
    invoices: {
      total: invoices.reduce((s, r) => s + r.count, 0),
      by_status: Object.fromEntries(invoices.map(r => [r.status, r.count])),
      totalRevenue: totalRevenue.total,
      pendingRevenue: pendingRevenue.total,
      overdueCount: overdueCount.count
    },
    mrr: mrr.total
  };
}

module.exports = { getDashboardStats };
