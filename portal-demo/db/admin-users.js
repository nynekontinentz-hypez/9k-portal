const { get } = require('./index');

function findByEmail(email) {
  return get('SELECT id, email, password_hash FROM admin_users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
}

module.exports = { findByEmail };
