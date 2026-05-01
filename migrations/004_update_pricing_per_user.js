module.exports = {
  name: '004_update_pricing_per_user',
  up: async (client) => {
    // Update pricing to match 9ksystems.net — per-user/month model
    // Essential: $89/user/mo, Professional: $149/user/mo, Enterprise: $219/user/mo
    await client.query(`
      UPDATE service_tiers SET
        monthly_price = 89.00,
        description = 'For small teams getting their IT baseline right. Market rate: $125–$150/user — you save ~35%.',
        features = ARRAY[
          '24/7 remote monitoring',
          'Help desk (business hours)',
          'Patch management & updates',
          'Antivirus & endpoint protection',
          'Cloud backup (up to 500GB)',
          'Monthly health report'
        ],
        updated_at = NOW()
      WHERE LOWER(name) IN ('essential', 'essentials')
    `);

    await client.query(`
      UPDATE service_tiers SET
        monthly_price = 149.00,
        description = 'Full coverage and fast response for growing businesses. Market rate: $200–$250/user — you save ~35%.',
        features = ARRAY[
          'Everything in Essential',
          '24/7 help desk support',
          'Advanced threat detection (EDR)',
          'Microsoft 365 management',
          'Cloud backup (up to 2TB)',
          'Firewall & network monitoring',
          'Quarterly strategy review'
        ],
        updated_at = NOW()
      WHERE LOWER(name) = 'professional'
    `);

    await client.query(`
      UPDATE service_tiers SET
        monthly_price = 219.00,
        description = 'Full-spectrum IT — strategy, compliance, and everything in between. Market rate: $300–$400/user — you save ~35%.',
        features = ARRAY[
          'Everything in Professional',
          'Virtual CIO (vCIO) service',
          'Compliance readiness (HIPAA, SOC2)',
          'Disaster recovery planning',
          'Unlimited cloud storage',
          'Priority 1-hour response SLA',
          'Monthly vCIO strategy call'
        ],
        updated_at = NOW()
      WHERE LOWER(name) = 'enterprise'
    `);
  }
};
