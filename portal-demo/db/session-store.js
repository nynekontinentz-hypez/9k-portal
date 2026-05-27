class SessionStore {
  constructor(sqlDb) {
    this.db = sqlDb;
  }

  async get(sid) {
    const stmt = this.db.prepare("SELECT sess FROM sessions WHERE sid = ? AND expired > datetime('now')");
    stmt.bind([sid]);
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row ? JSON.parse(row.sess) : null;
  }

  async set(sid, sess) {
    const maxAge = sess.cookie?.maxAge || 86400000;
    const expires = new Date(Date.now() + maxAge).toISOString();
    const stmt = this.db.prepare('INSERT OR REPLACE INTO sessions (sid, sess, expired) VALUES (?, ?, ?)');
    stmt.run([sid, JSON.stringify(sess), expires]);
    stmt.free();
  }

  async destroy(sid) {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE sid = ?');
    stmt.run([sid]);
    stmt.free();
  }

  async touch(sid, sess) {
    const maxAge = sess.cookie?.maxAge || 86400000;
    const expires = new Date(Date.now() + maxAge).toISOString();
    const stmt = this.db.prepare('UPDATE sessions SET expired = ? WHERE sid = ?');
    stmt.run([expires, sid]);
    stmt.free();
  }
}

module.exports = SessionStore;
