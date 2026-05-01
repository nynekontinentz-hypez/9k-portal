/**
 * Public API endpoints (no auth required).
 * Owns: ticket submission, service tier listing.
 * Does NOT own: admin-only endpoints (see api/admin.js).
 */
const express = require('express');
const router = express.Router();
const { createTicket } = require('../../db/tickets');
const { listTiers } = require('../../db/tiers');

router.post('/tickets', async (req, res) => {
  try {
    const { client_id, subject, description, priority, category,
      contact_name, contact_email, contact_phone } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }
    const result = await createTicket({ client_id, subject, description, priority, category, contact_name, contact_email, contact_phone });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.get('/tiers', async (req, res) => {
  try {
    const result = await listTiers();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tiers:', err);
    res.status(500).json({ error: 'Failed to fetch service tiers' });
  }
});

module.exports = router;