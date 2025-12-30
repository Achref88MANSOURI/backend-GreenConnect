const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Try different possible database paths
const dbPaths = [
  path.join(__dirname, '..', 'db.sqlite'),
  path.join(__dirname, '..', 'web.db'),
  path.join(__dirname, '..', 'database.db'),
  path.join(__dirname, '..', '.data', 'database.db'),
  'db.sqlite',
  'web.db',
  'database.db'
];

let db = null;
let dbPath = null;

// Find which database file exists
for (const p of dbPaths) {
  try {
    const fs = require('fs');
    if (fs.existsSync(p)) {
      dbPath = p;
      break;
    }
  } catch (e) {
    // Continue
  }
}

if (!dbPath) {
  console.error('❌ Database file not found. Tried paths:', dbPaths);
  process.exit(1);
}

console.log(`📁 Using database: ${dbPath}\n`);
db = new sqlite3.Database(dbPath);

// Delete data from investment tables
const deleteTables = [
  'investments',           // Rental requests
  'investment_projects'    // Land listings
];

console.log('🗑️  Clearing investment data...\n');

let completed = 0;
let errors = 0;

deleteTables.forEach(table => {
  db.run(`DELETE FROM ${table}`, [], (err) => {
    if (err) {
      console.error(`❌ Error deleting from ${table}:`, err.message);
      errors++;
    } else {
      console.log(`✅ Cleared ${table}`);
      completed++;
    }

    // Check if we're done
    if (completed + errors === deleteTables.length) {
      if (errors === 0) {
        console.log('\n✨ All investment data deleted successfully!');
      } else {
        console.log(`\n⚠️  Completed with ${errors} error(s)`);
      }
      db.close();
    }
  });
});

// Handle connection errors
db.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  process.exit(1);
});
