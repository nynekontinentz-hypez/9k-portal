/**
 * Download project source as a tar.gz archive.
 * Owns: GET /download-source
 * Does NOT own: authentication, other routes
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const router = express.Router();

const VALID_TOKEN = process.env.DOWNLOAD_TOKEN || '9ksystems2026';
const ARCHIVE_PATH = '/tmp/9k-portal-source.tar.gz';

router.get('/', (req, res) => {
  if (req.query.token !== VALID_TOKEN) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }

  const projectRoot = path.resolve(__dirname, '..');

  try {
    // Build tar.gz using system tar — excludes noise dirs and secrets
    execSync(
      `tar czf ${ARCHIVE_PATH} --exclude=node_modules --exclude=.git --exclude=.env --exclude=.tmp .`,
      { cwd: projectRoot, stdio: 'pipe' }
    );

    res.setHeader('Content-Disposition', 'attachment; filename="9k-portal-source.tar.gz"');
    res.setHeader('Content-Type', 'application/gzip');

    const archive = fs.createReadStream(ARCHIVE_PATH);
    archive.pipe(res);

    // Clean up temp file after stream finishes
    archive.on('end', () => {
      try { fs.unlinkSync(ARCHIVE_PATH); } catch (_) { /* ephemeral fs, may already be gone */ }
    });
  } catch (err) {
    console.error('tar failed:', err.message);
    res.status(500).json({ error: 'Failed to create source archive' });
  }
});

module.exports = router;
