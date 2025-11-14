const { Client } = require('pg');
const c = new Client({ host: process.env.DB_HOST || 'localhost', port: process.env.DB_PORT || 5432, user: process.env.DB_USER || 'admin', password: process.env.DB_PASS || 'admin', database: process.env.DB_NAME || 'greeenconnect' });

c.connect()
  .then(() => { console.log('connected'); return c.end(); })
  .catch(err => { console.error('conn error', err); process.exit(1); });
