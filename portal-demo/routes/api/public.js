const express = require('express');
const router = express.Router();
const { createTicket } = require('../../db/tickets');
const { listTiers } = require('../../db/tiers');

router.post('/tickets', async (req, res) => {
  try {
    const { client_id, subject, description, priority, category, contact_name, contact_email, contact_phone } = req.body;
    if (!subject || !description) return res.status(400).json({ error: 'Subject and description are required' });
    const ticket = createTicket({ client_id, subject, description, priority, category, contact_name, contact_email, contact_phone });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.get('/tiers', (req, res) => {
  try {
    res.json(listTiers());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service tiers' });
  }
});

module.exports = router;
