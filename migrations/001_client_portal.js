module.exports = {
  name: '001_client_portal',
  up: async (client) => {
    // Service tiers define the plans clients can subscribe to
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_tiers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        features TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Clients are the businesses we serve
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50),
        address TEXT,
        service_tier_id INTEGER REFERENCES service_tiers(id),
        status VARCHAR(50) DEFAULT 'prospect',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Index on client status for dashboard filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)
    `);

    // Contracts track the formal agreements with each client
    await client.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        service_tier_id INTEGER REFERENCES service_tiers(id),
        start_date DATE NOT NULL,
        end_date DATE,
        monthly_rate DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)
    `);

    // Tickets are support requests from clients
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id),
        subject VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        category VARCHAR(100),
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        resolved_at TIMESTAMPTZ,
        resolution_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)
    `);

    // Seed default service tiers
    await client.query(`
      INSERT INTO service_tiers (name, description, monthly_price, features) VALUES
        ('Essential', 'Core IT support for small teams', 499.00,
         ARRAY['Remote help desk (business hours)', 'Endpoint monitoring', 'Monthly health report', 'Email support']),
        ('Professional', 'Comprehensive IT management', 999.00,
         ARRAY['24/7 remote support', 'Endpoint monitoring & management', 'Cybersecurity suite', 'Cloud backup', 'Quarterly business review']),
        ('Enterprise', 'Full-service IT partnership', 1999.00,
         ARRAY['24/7 priority support', 'Advanced threat protection', 'Cloud infrastructure management', 'Virtual CIO advisory', 'Dedicated account manager', 'Compliance readiness'])
      ON CONFLICT DO NOTHING
    `);
  }
};
