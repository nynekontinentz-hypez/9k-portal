/**
 * Protected admin API endpoints (requireAdmin middleware enforced at mount point).
 * Owns: tier CRUD, client CRUD, contract CRUD, ticket management, dashboard stats, analytics.
 * Does NOT own: public APIs (see api/public.js).
 * All database queries go through db/ modules — all queries via named functions.
 */
const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const { listTiers, createTier, updateTier, deleteTier } = require('../../db/tiers');
const { listClients, getClientById, createClient, updateClient, deleteClient } = require('../../db/clients');
const { listContracts, createContract, updateContract, deleteContract } = require('../../db/contracts');
const { listTickets, updateTicket } = require('../../db/tickets');
const { getDashboardStats } = require('../../db/stats');
const { getTotalViews, getTopPages, getReferrerBreakdown, getViewsOverTime } = require('../../db/page-views');

// All routes in this file require admin auth
router.use(requireAdmin);

// ─── Service Tiers CRUD ──────────────────────────────────

router.post('/tiers', async (req, res) => {
  try {
    const { name, description, monthly_price, features, is_active } = req.body;
    if (!name || monthly_price == null) {
      return res.status(400).json({ error: 'Name and monthly_price are required' });
    }
    const result = await createTier({ name, description, monthly_price, features, is_active });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating tier:', err);
    res.status(500).json({ error: 'Failed to create tier' });
  }
});

router.put('/tiers/:id', async (req, res) => {
  try {
    const { name, description, monthly_price, features, is_active } = req.body;
    const result = await updateTier(req.params.id, { name, description, monthly_price, features, is_active });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tier not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating tier:', err);
    res.status(500).json({ error: 'Failed to update tier' });
  }
});

router.delete('/tiers/:id', async (req, res) => {
  try {
    const result = await deleteTier(req.params.id);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tier not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting tier:', err);
    res.status(500).json({ error: 'Failed to delete tier' });
  }
});

// ─── Clients CRUD ────────────────────────────────────────

router.get('/clients', async (req, res) => {
  try {
    const result = await listClients(req.query.status);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.get('/clients/:id', async (req, res) => {
  try {
    const result = await getClientById(req.params.id);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching client:', err);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const { company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes } = req.body;
    if (!company_name || !contact_name || !contact_email) {
      return res.status(400).json({ error: 'company_name, contact_name, and contact_email are required' });
    }
    const result = await createClient({ company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.put('/clients/:id', async (req, res) => {
  try {
    const { company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes } = req.body;
    const result = await updateClient(req.params.id, { company_name, contact_name, contact_email, contact_phone, address, service_tier_id, status, notes });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    const result = await deleteClient(req.params.id);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// ─── Contracts CRUD ──────────────────────────────────────

router.get('/contracts', async (req, res) => {
  try {
    const result = await listContracts({ client_id: req.query.client_id, status: req.query.status });
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contracts:', err);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

router.post('/contracts', async (req, res) => {
  try {
    const { client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes } = req.body;
    if (!client_id || !start_date || monthly_rate == null) {
      return res.status(400).json({ error: 'client_id, start_date, and monthly_rate are required' });
    }
    const result = await createContract({ client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating contract:', err);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

router.put('/contracts/:id', async (req, res) => {
  try {
    const { client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes } = req.body;
    const result = await updateContract(req.params.id, { client_id, service_tier_id, start_date, end_date, monthly_rate, status, notes });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contract not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating contract:', err);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

router.delete('/contracts/:id', async (req, res) => {
  try {
    const result = await deleteContract(req.params.id);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contract not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting contract:', err);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// ─── Tickets (admin read/update) ─────────────────────────

router.get('/tickets', async (req, res) => {
  try {
    const result = await listTickets({
      status: req.query.status,
      priority: req.query.priority,
      client_id: req.query.client_id
    });
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.put('/tickets/:id', async (req, res) => {
  try {
    const { status, priority, resolution_notes } = req.body;
    const result = await updateTicket(req.params.id, { status, priority, resolution_notes });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// ─── Dashboard Stats ─────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── Analytics ───────────────────────────────────────────

router.get('/analytics', async (req, res) => {
  try {
    const [today, last7, last30, topPages, referrers, viewsOverTime] = await Promise.all([
      getTotalViews(1),
      getTotalViews(7),
      getTotalViews(30),
      getTopPages(30, 10),
      getReferrerBreakdown(30),
      getViewsOverTime(30),
    ]);
    res.json({ today, last7, last30, topPages, referrers, viewsOverTime });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;