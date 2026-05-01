/**
 * Updates service_tiers to match 9ksystems.net/#pricing exactly.
 * Per-user monthly pricing replacing previous flat-rate monthly pricing.
 */

module.exports = {
  name: '004_update_pricing',
  async up(client) {
    // Clear existing tiers and replace with exact 9ksystems.net pricing
    await client.query(`DELETE FROM service_tiers`);

    await client.query(`
      INSERT INTO service_tiers (name, description, monthly_price, features, is_active) VALUES
        ('Essential',
         'For small teams getting their IT baseline right.',
         89.00,
         ARRAY[
           '24/7 remote monitoring',
           'Help desk (business hours)',
           'Patch management & updates',
           'Antivirus & endpoint protection',
           'Cloud backup (up to 500GB)',
           'Monthly health report'
         ],
         true),
        ('Professional',
         'Full coverage and fast response for growing businesses.',
         149.00,
         ARRAY[
           'Everything in Essential',
           '24/7 help desk support',
           'Advanced threat detection (EDR)',
           'Microsoft 365 management',
           'Cloud backup (up to 2TB)',
           'Firewall & network monitoring',
           'Quarterly strategy review'
         ],
         true),
        ('Enterprise',
         'Full-spectrum IT — strategy, compliance, and everything in between.',
         219.00,
         ARRAY[
           'Everything in Professional',
           'Virtual CIO (vCIO) service',
           'Compliance readiness (HIPAA, SOC2)',
           'Disaster recovery planning',
           'Unlimited cloud storage',
           'Priority 1-hour response SLA',
           'Monthly vCIO strategy call'
         ],
         true)
    `);
  },
  async down(client) {
    await client.query(`DELETE FROM service_tiers`);
    await client.query(`
      INSERT INTO service_tiers (name, description, monthly_price, features, is_active) VALUES
        ('Essential', 'Core IT support for small teams', 499.00,
         ARRAY['Remote help desk (business hours)', 'Endpoint monitoring', 'Monthly health report', 'Email support'],
         true),
        ('Professional', 'Comprehensive IT management', 999.00,
         ARRAY['24/7 remote support', 'Endpoint monitoring & management', 'Cybersecurity suite', 'Cloud backup', 'Quarterly business review'],
         true),
        ('Enterprise', 'Full-service IT partnership', 1999.00,
         ARRAY['24/7 priority support', 'Advanced threat protection', 'Cloud infrastructure management', 'Virtual CIO advisory', 'Dedicated account manager', 'Compliance readiness'],
         true)
    `);
  }
};
