const { v4: uuidv4 } = require('uuid');
const { initialize, get, run } = require('./db');

async function seed() {
  await initialize();

  const existing = get('SELECT COUNT(*) as c FROM tickets');
  if (existing && existing.c > 0) {
    console.log('Database already seeded.');
    process.exit(0);
  }

  const now = Date.now();
  const tickets = [
    { id:'TKT-100001', name:'Maria Santos', email:'maria@santos.biz', phone:'(407) 555-0101', category:'Computer Repair', priority:'high', status:'progress', subject:'Laptop extremely slow after Windows update', created:new Date(now-172800000).toISOString(), updated:new Date(now-3600000).toISOString(), notes:'KB5032190 rollback issue.' },
    { id:'TKT-100002', name:'Derek Thompson', email:'derek@thompsonhvac.com', phone:'(407) 555-0234', category:'Networking', priority:'medium', status:'open', subject:'Need Wi-Fi coverage in back office and warehouse', created:new Date(now-86400000).toISOString(), updated:new Date(now-86400000).toISOString(), notes:'' },
    { id:'TKT-100003', name:'Priya Nair', email:'priya@orlandoyoga.com', phone:'(407) 555-0312', category:'SEO', priority:'medium', status:'open', subject:'Google ranking dropped significantly', created:new Date(now-18000000).toISOString(), updated:new Date(now-18000000).toISOString(), notes:'' },
    { id:'TKT-100004', name:'Carlos Reyes', email:'carlos@reyesconstruction.net', phone:'(407) 555-0445', category:'Computer Repair', priority:'low', status:'resolved', subject:'Set up new employee laptops', created:new Date(now-432000000).toISOString(), updated:new Date(now-259200000).toISOString(), notes:'Completed on-site.' },
  ];

  for (const t of tickets) {
    run('INSERT INTO tickets (id, name, email, phone, category, priority, status, subject, created, updated, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [t.id, t.name, t.email, t.phone, t.category, t.priority, t.status, t.subject, t.created, t.updated, t.notes]);
    run('INSERT INTO ticket_messages (id, ticket_id, from_type, author, text, ts) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), t.id, 'client', t.name, t.subject + '. Please assist.', t.created]);
  }

  const clients = [
    { id: uuidv4(), name:'Maria Santos', email:'maria@santos.biz', phone:'(407) 555-0101', company:'Santos Consulting', type:'business', since:new Date(now-7776000000).toISOString(), notes:'Repeat client.' },
    { id: uuidv4(), name:'Derek Thompson', email:'derek@thompsonhvac.com', phone:'(407) 555-0234', company:'Thompson HVAC', type:'business', since:new Date(now-2592000000).toISOString(), notes:'' },
    { id: uuidv4(), name:'Priya Nair', email:'priya@orlandoyoga.com', phone:'(407) 555-0312', company:'Orlando Yoga Studio', type:'business', since:new Date(now-864000000).toISOString(), notes:'' },
    { id: uuidv4(), name:'Carlos Reyes', email:'carlos@reyesconstruction.net', phone:'(407) 555-0445', company:'Reyes Construction', type:'business', since:new Date(now-10368000000).toISOString(), notes:'On-site preferred.' },
  ];
  for (const c of clients) {
    run('INSERT INTO clients (id, name, email, phone, company, type, since, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [c.id, c.name, c.email, c.phone, c.company, c.type, c.since, c.notes]);
  }

  const invoices = [
    { id:uuidv4(), number:'INV-2026-001', email:'maria@santos.biz', name:'Maria Santos', amount:149, status:'paid', due:'2026-03-15', paidAt:new Date(now-7776000000).toISOString(), notes:'' },
    { id:uuidv4(), number:'INV-2026-002', email:'derek@thompsonhvac.com', name:'Derek Thompson', amount:89, status:'pending', due:'2026-06-01', notes:'' },
    { id:uuidv4(), number:'INV-2026-003', email:'priya@orlandoyoga.com', name:'Priya Nair', amount:89, status:'paid', due:'2026-04-01', paidAt:new Date(now-5184000000).toISOString(), notes:'' },
    { id:uuidv4(), number:'INV-2026-004', email:'carlos@reyesconstruction.net', name:'Carlos Reyes', amount:149, status:'overdue', due:'2026-04-01', notes:'' },
    { id:uuidv4(), number:'INV-2026-005', email:'maria@santos.biz', name:'Maria Santos', amount:149, status:'sent', due:'2026-05-01', notes:'' },
  ];
  for (const i of invoices) {
    run('INSERT INTO invoices (id, invoice_number, email, client_name, amount, status, due_date, paid_at, notes, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [i.id, i.number, i.email, i.name, i.amount, i.status, i.due, i.paidAt||'', i.notes, new Date(now-86400000).toISOString(), new Date(now-86400000).toISOString()]);
  }

  const now2 = new Date().toISOString();
  const acts = [
    ['ticket_created', 'Maria Santos opened ticket TKT-100001', 'ticket', 'TKT-100001'],
    ['ticket_updated', 'TKT-100002 set to in progress by admin', 'ticket', 'TKT-100002'],
    ['ticket_resolved', 'TKT-100004 resolved', 'ticket', 'TKT-100004'],
    ['invoice_paid', 'INV-2026-001 paid ($149)', 'invoice', 'INV-2026-001'],
    ['invoice_overdue', 'INV-2026-004 overdue for Carlos Reyes', 'invoice', 'INV-2026-004'],
    ['client_created', 'New client: Reyes Construction', 'client', ''],
  ];
  for (const a of acts) {
    run('INSERT INTO activities (id, type, description, entity_type, entity_id, created) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), a[0], a[1], a[2], a[3], now2]);
  }

  console.log('Seeded: 4 tickets, 4 clients, 5 invoices');
}

seed().catch(console.error);
