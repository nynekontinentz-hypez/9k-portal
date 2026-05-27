const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { initialize, all, get, run } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'msp-dashboard-secret-change-in-production';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin9kos', 10);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'] }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests' } }));

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try { req.admin = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalid or expired' }); }
}

function getTickets(filters = {}) {
  let sql = 'SELECT * FROM tickets';
  const conditions = []; const params = [];
  if (filters.status) { conditions.push('status = ?'); params.push(filters.status); }
  if (filters.priority) { conditions.push('priority = ?'); params.push(filters.priority); }
  if (filters.category) { conditions.push('category = ?'); params.push(filters.category); }
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push('(subject LIKE ? OR name LIKE ? OR email LIKE ? OR id LIKE ?)');
    params.push(q, q, q, q);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY updated DESC';
  return all(sql, params);
}

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString(), version: '2.0.0' }));

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== 'admin') return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, username, role: 'admin', expiresIn: 43200 });
});

app.post('/api/auth/refresh', authRequired, (req, res) => {
  const token = jwt.sign({ username: req.admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, expiresIn: 43200 });
});

// Stats (moved below after invoices route defined)

// Tickets
app.get('/api/tickets', authRequired, (req, res) => {
  const result = getTickets(req.query);
  res.json({ tickets: result, total: result.length });
});

app.get('/api/tickets/:id', authRequired, (req, res) => {
  const t = get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!t) return res.status(404).json({ error: 'Ticket not found' });
  t.messages = all('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY ts ASC', [req.params.id]);
  res.json(t);
});

app.post('/api/tickets', (req, res) => {
  const { name, email, phone, category, priority, subject, description } = req.body;
  if (!name || !email || !subject || !description) return res.status(400).json({ error: 'Missing required fields: name, email, subject, description' });
  const id = 'TKT-1' + String(Date.now()).slice(-5);
  const now = new Date().toISOString();
  run('INSERT INTO tickets (id, name, email, phone, category, priority, status, subject, created, updated, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, phone || '', category || 'Other / Not Sure', priority || 'medium', 'open', subject, now, now, '']);
  run('INSERT INTO ticket_messages (id, ticket_id, from_type, author, text, ts) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), id, 'client', name, description, now]);
  if (!get('SELECT id FROM clients WHERE email = ?', [email])) {
    run('INSERT INTO clients (id, name, email, phone, company, type, since, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), name, email, phone || '', '', 'individual', now, '']);
  }
  res.status(201).json({ id, name, email, phone: phone || '', category: category || 'Other / Not Sure', priority: priority || 'medium', status: 'open', subject, created: now, updated: now, notes: '' });
});

app.patch('/api/tickets/:id', authRequired, (req, res) => {
  const ticket = get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const allowed = ['status', 'priority', 'notes'];
  const sets = []; const params = [];
  allowed.forEach(k => {
    if (req.body[k] !== undefined) { sets.push(`${k} = ?`); params.push(req.body[k]); }
  });
  if (sets.length) {
    sets.push("updated = datetime('now')");
    params.push(req.params.id);
    run(`UPDATE tickets SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  res.json(get('SELECT * FROM tickets WHERE id = ?', [req.params.id]));
});

app.post('/api/tickets/:id/reply', authRequired, (req, res) => {
  const ticket = get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Reply text required' });
  const msg = { id: uuidv4(), ticket_id: req.params.id, from_type: 'tech', author: 'MSP Admin', text: text.trim(), ts: new Date().toISOString() };
  run('INSERT INTO ticket_messages (id, ticket_id, from_type, author, text, ts) VALUES (?, ?, ?, ?, ?, ?)', [msg.id, msg.ticket_id, msg.from_type, msg.author, msg.text, msg.ts]);
  run("UPDATE tickets SET updated = ?, status = CASE WHEN status = 'open' THEN 'progress' ELSE status END WHERE id = ?", [msg.ts, req.params.id]);
  const updated = get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  updated.messages = all('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY ts ASC', [req.params.id]);
  res.json(updated);
});

app.post('/api/tickets/:id/client-reply', (req, res) => {
  const ticket = get('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { text, email } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Reply text required' });
  if (email && ticket.email.toLowerCase() !== email.toLowerCase()) return res.status(403).json({ error: 'Email does not match ticket' });
  const msg = { id: uuidv4(), ticket_id: req.params.id, from_type: 'client', author: ticket.name, text: text.trim(), ts: new Date().toISOString() };
  run('INSERT INTO ticket_messages (id, ticket_id, from_type, author, text, ts) VALUES (?, ?, ?, ?, ?, ?)', [msg.id, msg.ticket_id, msg.from_type, msg.author, msg.text, msg.ts]);
  run("UPDATE tickets SET updated = ?, status = CASE WHEN status = 'resolved' THEN 'open' ELSE status END WHERE id = ?", [msg.ts, req.params.id]);
  res.json({ message: msg, ticket: get('SELECT * FROM tickets WHERE id = ?', [req.params.id]) });
});

app.delete('/api/tickets/:id', authRequired, (req, res) => {
  run('DELETE FROM ticket_messages WHERE ticket_id = ?', [req.params.id]);
  run('DELETE FROM tickets WHERE id = ?', [req.params.id]);
  res.json({ deleted: true });
});

// Clients
app.get('/api/clients', authRequired, (req, res) => {
  let clients = all('SELECT * FROM clients');
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    clients = clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
  }
  clients = clients.map(c => {
    const clientTickets = all('SELECT created FROM tickets WHERE email = ? ORDER BY created DESC', [c.email]);
    return { ...c, ticketCount: clientTickets.length, lastTicket: clientTickets[0]?.created || null };
  });
  res.json({ clients, total: clients.length });
});

app.get('/api/clients/:id', authRequired, (req, res) => {
  const c = get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'Client not found' });
  c.tickets = all('SELECT * FROM tickets WHERE email = ? ORDER BY created DESC', [c.email]);
  res.json(c);
});

app.patch('/api/clients/:id', authRequired, (req, res) => {
  const c = get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!c) return res.status(404).json({ error: 'Client not found' });
  const sets = []; const params = [];
  ['name','email','phone','company','type','notes'].forEach(k => {
    if (req.body[k] !== undefined) { sets.push(`${k} = ?`); params.push(req.body[k]); }
  });
  if (sets.length) { params.push(req.params.id); run(`UPDATE clients SET ${sets.join(', ')} WHERE id = ?`, params); }
  res.json(get('SELECT * FROM clients WHERE id = ?', [req.params.id]));
});

// Invoices
app.get('/api/invoices', authRequired, (req, res) => {
  let sql = 'SELECT * FROM invoices';
  const conditions = []; const params = [];
  if (req.query.status) { conditions.push('status = ?'); params.push(req.query.status); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY created DESC';
  res.json({ invoices: all(sql, params), total: 0 });
});

app.get('/api/invoices/:id', authRequired, (req, res) => {
  const inv = get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  res.json(inv);
});

app.post('/api/invoices', authRequired, (req, res) => {
  const { email, amount, due_date, notes } = req.body;
  if (!email || amount == null) return res.status(400).json({ error: 'email and amount required' });
  const id = uuidv4();
  const now = new Date().toISOString();
  const number = 'INV-' + String(Date.now()).slice(-6);
  const client = get('SELECT name, email FROM clients WHERE email = ?', [email]);
  run('INSERT INTO invoices (id, invoice_number, email, client_name, amount, status, due_date, notes, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, number, email, client?.name || email, amount, 'pending', due_date || new Date(Date.now()+30*86400000).toISOString().slice(0,10), notes||'', now, now]);
  run('INSERT INTO activities (id, type, description, entity_type, entity_id, created) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), 'invoice_created', `Invoice ${number} created for $${amount}`, 'invoice', id, now]);
  res.status(201).json(get('SELECT * FROM invoices WHERE id = ?', [id]));
});

app.patch('/api/invoices/:id', authRequired, (req, res) => {
  const inv = get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  const sets = []; const params = [];
  ['amount','status','due_date','notes'].forEach(k => {
    if (req.body[k] !== undefined) { sets.push(`${k} = ?`); params.push(req.body[k]); }
  });
  if (req.body.status === 'paid') {
    sets.push("paid_at = ?"); params.push(new Date().toISOString());
    sets.push("paid_amount = ?"); params.push(req.body.paid_amount || inv.amount);
  }
  if (sets.length) { sets.push("updated = datetime('now')"); params.push(req.params.id); run(`UPDATE invoices SET ${sets.join(', ')} WHERE id = ?`, params); }
  const updated = get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
  if (req.body.status) run('INSERT INTO activities (id, type, description, entity_type, entity_id, created) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), `invoice_${req.body.status}`, `Invoice ${updated.invoice_number} marked as ${req.body.status}`, 'invoice', req.params.id, new Date().toISOString()]);
  res.json(updated);
});

app.delete('/api/invoices/:id', authRequired, (req, res) => {
  run('DELETE FROM invoices WHERE id = ?', [req.params.id]);
  res.json({ deleted: true });
});

// Activities
app.get('/api/activities', authRequired, (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(all('SELECT * FROM activities ORDER BY created DESC LIMIT ?', [limit]));
});

// Stats - extend with invoice data
app.get('/api/stats', authRequired, (req, res) => {
  const tickets = getTickets();
  const clientCount = get('SELECT COUNT(*) as c FROM clients');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 86400000);
  const paidRevenue = get("SELECT COALESCE(SUM(paid_amount), 0) as t FROM invoices WHERE status = 'paid'");
  const pendingRevenue = get("SELECT COALESCE(SUM(amount), 0) as t FROM invoices WHERE status IN ('pending','sent')");
  const overdueCount = get("SELECT COUNT(*) as c FROM invoices WHERE status = 'overdue'");
  res.json({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    progress: tickets.filter(t => t.status === 'progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    high: tickets.filter(t => t.priority === 'high' && t.status !== 'resolved' && t.status !== 'closed').length,
    createdToday: tickets.filter(t => new Date(t.created) >= today).length,
    createdThisWeek: tickets.filter(t => new Date(t.created) >= thisWeek).length,
    byCategory: [...new Set(tickets.map(t => t.category))].map(cat => ({ category: cat, count: tickets.filter(t => t.category === cat).length })),
    clients: clientCount ? clientCount.c : 0,
    invoices: { paidRevenue: paidRevenue.t, pendingRevenue: pendingRevenue.t, overdueCount: overdueCount.c },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, topic, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
  const id = 'TKT-1' + String(Date.now()).slice(-5);
  const now = new Date().toISOString();
  run('INSERT INTO tickets (id, name, email, phone, category, priority, status, subject, created, updated, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, phone || '', topic || 'General Question', 'low', 'open', `Contact form: ${topic || 'General'}`, now, now, 'From contact form']);
  run('INSERT INTO ticket_messages (id, ticket_id, from_type, author, text, ts) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), id, 'client', name, message, now]);
  if (!get('SELECT id FROM clients WHERE email = ?', [email])) {
    run('INSERT INTO clients (id, name, email, phone, company, type, since, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), name, email, phone || '', '', 'individual', now, 'From contact form']);
  }
  res.status(201).json({ success: true, ticketId: id });
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

async function start() {
  await initialize();
  app.listen(PORT, () => {
    console.log(`\n  MSP Dashboard API running on http://localhost:${PORT}`);
    console.log(`  Login: admin / admin9kos`);
    console.log(`  JWT expires: 12h\n`);
  });
}

start().catch(console.error);

module.exports = app;
