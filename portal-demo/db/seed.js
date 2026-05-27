const bcrypt = require('bcryptjs');
const { initialize, all, get, run } = require('./index');

async function seed() {
  await initialize();

  const existing = get('SELECT COUNT(*) as c FROM admin_users');
  if (existing && existing.c > 0) {
    console.log('Database already seeded.');
    process.exit(0);
  }

  const hash = bcrypt.hashSync('admin9kos', 10);
  run("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)", ['admin@9ksystems.net', hash]);

  const tiers = [
    { name: 'Essential', description: 'Core IT support for small teams', price: 89, features: ['Helpdesk support', 'Remote monitoring', 'Anti-virus', 'Monthly check-in'] },
    { name: 'Professional', description: 'Full IT management for growing businesses', price: 149, features: ['Everything in Essential', 'On-site visits', 'Network management', 'Backup & recovery', 'Security training'] },
    { name: 'Strategic', description: 'Enterprise-grade IT + fractional CTO', price: 219, features: ['Everything in Professional', 'Fractional CTO', 'Compliance management', 'Custom integrations', '24/7 support'] },
  ];
  for (const t of tiers) {
    run('INSERT INTO service_tiers (name, description, monthly_price, features) VALUES (?, ?, ?, ?)', [t.name, t.description, t.price, JSON.stringify(t.features)]);
  }

  run("INSERT INTO clients (company_name, contact_name, contact_email, contact_phone, service_tier_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", ['Santos Consulting', 'Maria Santos', 'maria@santos.biz', '(407) 555-0101', 2, 'active', 'Repeat client.']);
  run("INSERT INTO clients (company_name, contact_name, contact_email, contact_phone, service_tier_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", ['Thompson HVAC', 'Derek Thompson', 'derek@thompsonhvac.com', '(407) 555-0234', 1, 'active', '']);
  run("INSERT INTO clients (company_name, contact_name, contact_email, contact_phone, service_tier_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", ['Orlando Yoga Studio', 'Priya Nair', 'priya@orlandoyoga.com', '(407) 555-0312', 1, 'active', '']);
  run("INSERT INTO clients (company_name, contact_name, contact_email, contact_phone, service_tier_id, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)", ['Reyes Construction', 'Carlos Reyes', 'carlos@reyesconstruction.net', '(407) 555-0445', 2, 'active', 'On-site preferred.']);

  run("INSERT INTO tickets (client_id, subject, description, priority, status, category, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [1, 'Laptop extremely slow after Windows update', 'My laptop has been extremely slow since the last Windows update.', 'high', 'progress', 'Computer Repair', 'Maria Santos', 'maria@santos.biz', '(407) 555-0101']);
  run("INSERT INTO tickets (client_id, subject, description, priority, status, category, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [2, 'Need Wi-Fi coverage in back office and warehouse', 'We have dead spots in the back 40% of our office.', 'medium', 'open', 'Networking', 'Derek Thompson', 'derek@thompsonhvac.com', '(407) 555-0234']);
  run("INSERT INTO tickets (client_id, subject, description, priority, status, category, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [3, 'Google ranking dropped', 'We used to rank #2 for yoga studio Orlando.', 'medium', 'open', 'SEO', 'Priya Nair', 'priya@orlandoyoga.com', '(407) 555-0312']);
  run("INSERT INTO tickets (client_id, subject, description, priority, status, category, contact_name, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [4, 'Set up new employee laptops', 'Need 3 Dell laptops set up.', 'low', 'resolved', 'Computer Repair', 'Carlos Reyes', 'carlos@reyesconstruction.net', '(407) 555-0445']);

  run("INSERT INTO ticket_messages (ticket_id, from_type, author, text) VALUES (?, ?, ?, ?)", [1, 'client', 'Maria Santos', 'My laptop has been extremely slow since the last Windows update.']);
  run("INSERT INTO ticket_messages (ticket_id, from_type, author, text) VALUES (?, ?, ?, ?)", [1, 'tech', '9K Systems', 'Hi Maria! This sounds like KB5032190. I can remote in today.']);
  run("INSERT INTO ticket_messages (ticket_id, from_type, author, text) VALUES (?, ?, ?, ?)", [2, 'client', 'Derek Thompson', 'Dead spots in back 40% of office.']);
  run("INSERT INTO ticket_messages (ticket_id, from_type, author, text) VALUES (?, ?, ?, ?)", [3, 'client', 'Priya Nair', 'We used to rank #2 and now on page 2.']);
  run("INSERT INTO ticket_messages (ticket_id, from_type, author, text) VALUES (?, ?, ?, ?)", [4, 'client', 'Carlos Reyes', 'Need 3 Dell laptops set up.']);
  run("INSERT INTO ticket_messages (ticket_id, from_type, author, text) VALUES (?, ?, ?, ?)", [4, 'tech', '9K Systems', 'All 3 laptops set up, enrolled in Intune.']);

  run("INSERT INTO contracts (client_id, service_tier_id, start_date, monthly_rate, status) VALUES (?, ?, ?, ?, ?)", [1, 2, '2026-01-15', 149, 'active']);
  run("INSERT INTO contracts (client_id, service_tier_id, start_date, monthly_rate, status) VALUES (?, ?, ?, ?, ?)", [2, 1, '2026-03-01', 89, 'active']);
  run("INSERT INTO contracts (client_id, service_tier_id, start_date, monthly_rate, status) VALUES (?, ?, ?, ?, ?)", [3, 1, '2026-04-01', 89, 'active']);
  run("INSERT INTO contracts (client_id, service_tier_id, start_date, monthly_rate, status) VALUES (?, ?, ?, ?, ?)", [4, 2, '2026-02-01', 149, 'active']);

  run("INSERT INTO invoices (invoice_number, client_id, amount, status, due_date, paid_at, paid_amount) VALUES (?, ?, ?, ?, ?, ?, ?)", ['INV-2026-001', 1, 149, 'paid', '2026-03-15', '2026-03-10', 149]);
  run("INSERT INTO invoices (invoice_number, client_id, amount, status, due_date) VALUES (?, ?, ?, ?, ?)", ['INV-2026-002', 2, 89, 'pending', '2026-06-01']);
  run("INSERT INTO invoices (invoice_number, client_id, amount, status, due_date, paid_at, paid_amount) VALUES (?, ?, ?, ?, ?, ?, ?)", ['INV-2026-003', 3, 89, 'paid', '2026-04-01', '2026-03-28', 89]);
  run("INSERT INTO invoices (invoice_number, client_id, amount, status, due_date) VALUES (?, ?, ?, ?, ?)", ['INV-2026-004', 4, 149, 'overdue', '2026-04-01']);
  run("INSERT INTO invoices (invoice_number, client_id, amount, status, due_date) VALUES (?, ?, ?, ?, ?)", ['INV-2026-005', 1, 149, 'sent', '2026-05-01']);

  run("INSERT INTO activities (type, description, entity_type, entity_id) VALUES (?, ?, ?, ?)", ['ticket_created', 'Maria Santos opened ticket TKT-100001', 'ticket', 1]);
  run("INSERT INTO activities (type, description, entity_type, entity_id) VALUES (?, ?, ?, ?)", ['ticket_updated', 'Derek Thompson ticket TKT-100002 set to in progress', 'ticket', 2]);
  run("INSERT INTO activities (type, description, entity_type, entity_id) VALUES (?, ?, ?, ?)", ['ticket_resolved', 'Carlos Reyes ticket TKT-100004 resolved', 'ticket', 4]);
  run("INSERT INTO activities (type, description, entity_type, entity_id) VALUES (?, ?, ?, ?)", ['invoice_paid', 'Invoice INV-2026-001 paid ($149)', 'invoice', 1]);
  run("INSERT INTO activities (type, description, entity_type, entity_id) VALUES (?, ?, ?, ?)", ['invoice_overdue', 'Invoice INV-2026-004 overdue for Reyes Construction', 'invoice', 4]);
  run("INSERT INTO activities (type, description, entity_type, entity_id) VALUES (?, ?, ?, ?)", ['client_created', 'New client: Reyes Construction', 'client', 4]);

  console.log('Database seeded!');
  console.log('  Admin: admin@9ksystems.net / admin9kos');
  console.log('  4 clients, 4 tickets, 3 service tiers, 4 contracts, 5 invoices');
}

seed().catch(console.error);
