const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'logs', 'submissions.csv');

function initLog() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, 'timestamp,name,email\n', 'utf8');
  }
}

function logSubmission(name, email) {
  initLog();
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const line = `${timestamp},"${name}","${email}"\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf8');
  console.log(`[Log] Saved → ${timestamp} | ${name} | ${email}`);
}

module.exports = { logSubmission };
