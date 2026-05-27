const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/auth');
const { listTiers, createTier, updateTier, deleteTier } = require('../../db/tiers');
const { listClients, getClientById, createClient, updateClient, deleteClient } = require('../../db/clients');
const { listContracts, createContract, updateContract, deleteContract } = require('../../db/contracts');
const { listTickets, getTicketById, updateTicket, deleteTicket, getTicketMessages, addTicketMessage } = require('../../db/tickets');
const { getDashboardStats } = require('../../db/stats');
const { getTotalViews, getTopPages, getReferrerBreakdown, getViewsOverTime } = require('../../db/page-views');
const { listInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice, recordActivity, listActivities } = require('../../db/invoices');

router.use(requireAdmin);

// Tiers
router.post('/tiers', (req, res) => {
  try {
    const { name, description, monthly_price, features, is_active } = req.body;
    if (!name || monthly_price == null) return res.status(400).json({ error: 'Name and monthly_price are required' });
    res.status(201).json(createTier({ name, description, monthly_price, features, is_active }));
  } catch (err) { res.status(500).json({ error: 'Failed to create tier' }); }
});

router.put('/tiers/:id', (req, res) => {
  try {
    const result = updateTier(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Tier not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Failed to update tier' }); }
});

router.delete('/tiers/:id', (req, res) => {
  try { deleteTier(req.params.id); res.json({ deleted: true }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete tier' }); }
});

// Clients
router.get('/clients', (req, res) => {
  try { res.json(listClients(req.query.status)); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch clients' }); }
});

router.get('/clients/:id', (req, res) => {
  try {
    const client = getClientById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const clientTickets = listTickets({ client_id: req.params.id });
    res.json({ ...client, tickets: clientTickets });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch client' }); }
});

router.post('/clients', (req, res) => {
  try {
    const { company_name, contact_name, contact_email } = req.body;
    if (!company_name || !contact_name || !contact_email) return res.status(400).json({ error: 'company_name, contact_name, and contact_email are required' });
    res.status(201).json(createClient(req.body));
  } catch (err) { res.status(500).json({ error: 'Failed to create client' }); }
});

router.put('/clients/:id', (req, res) => {
  try {
    const result = updateClient(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Client not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Failed to update client' }); }
});

router.delete('/clients/:id', (req, res) => {
  try { deleteClient(req.params.id); res.json({ deleted: true }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete client' }); }
});

// Contracts
router.get('/contracts', (req, res) => {
  try { res.json(listContracts({ client_id: req.query.client_id, status: req.query.status })); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch contracts' }); }
});

router.post('/contracts', (req, res) => {
  try {
    const { client_id, start_date, monthly_rate } = req.body;
    if (!client_id || !start_date || monthly_rate == null) return res.status(400).json({ error: 'client_id, start_date, and monthly_rate are required' });
    res.status(201).json(createContract(req.body));
  } catch (err) { res.status(500).json({ error: 'Failed to create contract' }); }
});

router.put('/contracts/:id', (req, res) => {
  try {
    const result = updateContract(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Contract not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Failed to update contract' }); }
});

router.delete('/contracts/:id', (req, res) => {
  try { deleteContract(req.params.id); res.json({ deleted: true }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete contract' }); }
});

// Tickets
router.get('/tickets', (req, res) => {
  try {
    const tickets = listTickets({ status: req.query.status, priority: req.query.priority, client_id: req.query.client_id });
    res.json(tickets);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch tickets' }); }
});

router.get('/tickets/:id', (req, res) => {
  try {
    const ticket = getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.messages = getTicketMessages(req.params.id);
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch ticket' }); }
});

router.put('/tickets/:id', (req, res) => {
  try {
    const { status, priority, resolution_notes } = req.body;
    const result = updateTicket(req.params.id, { status, priority, resolution_notes });
    if (!result) return res.status(404).json({ error: 'Ticket not found' });
    if (status) recordActivity(`ticket_${status}`, `Ticket #${req.params.id} marked as ${status}`, 'ticket', parseInt(req.params.id));
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Failed to update ticket' }); }
});

router.post('/tickets/:id/reply', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Reply text required' });
    addTicketMessage(req.params.id, 'tech', '9K Systems', text.trim());
    const ticket = getTicketById(req.params.id);
    if (ticket && ticket.status === 'open') updateTicket(req.params.id, { status: 'progress' });
    recordActivity('ticket_reply', `Replied to ticket #${req.params.id}`, 'ticket', parseInt(req.params.id));
    ticket.messages = getTicketMessages(req.params.id);
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: 'Failed to reply' }); }
});

router.delete('/tickets/:id', (req, res) => {
  try { deleteTicket(req.params.id); res.json({ deleted: true }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete ticket' }); }
});

// Invoices
router.get('/invoices', (req, res) => {
  try { res.json(listInvoices({ status: req.query.status, client_id: req.query.client_id })); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch invoices' }); }
});

router.get('/invoices/:id', (req, res) => {
  try {
    const inv = getInvoiceById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    res.json(inv);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch invoice' }); }
});

router.post('/invoices', (req, res) => {
  try {
    const { client_id, amount } = req.body;
    if (!client_id || amount == null) return res.status(400).json({ error: 'client_id and amount are required' });
    res.status(201).json(createInvoice(req.body));
  } catch (err) { res.status(500).json({ error: 'Failed to create invoice' }); }
});

router.put('/invoices/:id', (req, res) => {
  try {
    const result = updateInvoice(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Failed to update invoice' }); }
});

router.delete('/invoices/:id', (req, res) => {
  try { deleteInvoice(req.params.id); res.json({ deleted: true }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete invoice' }); }
});

// Activities
router.get('/activities', (req, res) => {
  try { res.json(listActivities(req.query.limit || 50)); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch activities' }); }
});

// Stats
router.get('/stats', (req, res) => {
  try { res.json(getDashboardStats()); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

// Analytics
router.get('/analytics', (req, res) => {
  try {
    const today = getTotalViews(1);
    const last7 = getTotalViews(7);
    const last30 = getTotalViews(30);
    const topPages = getTopPages(30, 10);
    const referrers = getReferrerBreakdown(30);
    const viewsOverTime = getViewsOverTime(30);
    res.json({ today, last7, last30, topPages, referrers, viewsOverTime });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch analytics' }); }
});

module.exports = router;
