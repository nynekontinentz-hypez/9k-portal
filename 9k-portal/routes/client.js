const express = require('express');
const router = express.Router();
const { requireClient } = require('../middleware/auth');
const clients = require('../db/clients');
const tickets = require('../db/tickets');
const contracts = require('../db/contracts');
const mailer = require('../lib/mailer');
const audit = require('../middleware/audit');

router.use(requireClient);

// ── Dashboard ────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const [client, clientTickets, contract] = await Promise.all([
    clients.findById(req.session.client.id),
    tickets.findByClient(req.session.client.id),
    contracts.findActive(req.session.client.id),
  ]);
  const open = clientTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  res.render('client/dashboard', {
    user: req.session.client, client, tickets: clientTickets.slice(0, 5),
    openCount: open.length, contract,
  });
});

// ── Tickets ──────────────────────────────────────────────────────────────────

router.get('/tickets', async (req, res) => {
  const all = await tickets.findByClient(req.session.client.id);
  res.render('client/tickets', { user: req.session.client, tickets: all });
});

router.get('/tickets/new', (req, res) => {
  res.render('client/new-ticket', { user: req.session.client, error: null });
});

router.post('/tickets/new', async (req, res) => {
  const { title, description, category, urgency, affected_asset } = req.body;
  if (!title || !description) {
    return res.render('client/new-ticket', { user: req.session.client, error: 'Title and description are required.' });
  }
  const client = await clients.findById(req.session.client.id);
  const id = await tickets.create({
    client_id: req.session.client.id,
    title, description, category, urgency: urgency || 'normal',
    affected_asset,
    client_env_tag: client.environment || 'unknown',
  });
  const ticket = await tickets.findById(id);
  await mailer.sendTicketConfirmation(req.session.client.email, ticket).catch(() => {});
  await audit.log('client', req.session.client.id, 'ticket_created', 'ticket', id, { title }, req.ip);
  res.redirect(`/client/tickets/${id}?created=1`);
});

router.get('/tickets/:id', async (req, res) => {
  const ticket = await tickets.findById(req.params.id);
  if (!ticket || ticket.client_id !== req.session.client.id) {
    return res.status(404).render('error', { message: 'Ticket not found.', status: 404, user: req.session.client });
  }
  const updates = await tickets.getUpdates(req.params.id, false);
  res.render('client/ticket-detail', {
    user: req.session.client, ticket, updates,
    created: req.query.created === '1',
  });
});

// ── Onboarding intake form ────────────────────────────────────────────────────

router.get('/onboarding', async (req, res) => {
  const client = await clients.findById(req.session.client.id);
  res.render('client/onboarding', { user: req.session.client, client, success: false, error: null });
});

router.post('/onboarding', async (req, res) => {
  const { environment, endpoint_count, uses_azure_ad, uses_microsoft_365, emergency_contact_name, emergency_contact_phone } = req.body;
  await require('../db').query(
    `UPDATE clients SET environment = ?, endpoint_count = ?, uses_azure_ad = ?, uses_microsoft_365 = ?, emergency_contact_name = ?, emergency_contact_phone = ? WHERE id = ?`,
    [environment, parseInt(endpoint_count) || 0, uses_azure_ad ? 1 : 0, uses_microsoft_365 ? 1 : 0,
     emergency_contact_name || null, emergency_contact_phone || null, req.session.client.id]
  );
  const client = await clients.findById(req.session.client.id);
  res.render('client/onboarding', { user: req.session.client, client, success: true, error: null });
});

module.exports = router;
