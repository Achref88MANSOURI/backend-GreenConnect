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

// List all tables to clear (add/remove as needed)
const deleteTables = [
  'users',
  'products',
  'bookings',
  'deliveries',
  'notifications',
  'carriers',
  'equipment',
  'investment_projects',
  'investments',
  'orders',
  'cart',
  'favorites',
  'reviews',
  'dashboard',
  'auth',
  'admin',
  'tawssel',
  'booking',
  'profile',
  'reset_password',
  'purchase_requests',
  'contact',
  'register',
  'signup',
  'terms',
  'users',
  // Ajoutez ici toutes les tables à vider
];

// Désactiver les contraintes de clés étrangères
console.log('⏸️  Désactivation des contraintes de clés étrangères...');
db.run('PRAGMA foreign_keys = OFF;', [], (err) => {
  if (err) {
    console.error('❌ Impossible de désactiver les foreign keys:', err.message);
    process.exit(1);
  }

  // Suppression des données
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

      // Si dernière table, réactiver les foreign keys et fermer
      if (completed + errors === deleteTables.length) {
        db.run('PRAGMA foreign_keys = ON;', [], (err2) => {
          if (err2) {
            console.error('❌ Impossible de réactiver les foreign keys:', err2.message);
          } else {
            console.log('▶️  Contraintes de clés étrangères réactivées.');
          }
          db.close();
          if (errors === 0) {
            console.log('\n🎉 All data cleared successfully!');
            process.exit(0);
          } else {
            console.log(`\n⚠️  Completed with ${errors} errors.`);
            process.exit(1);
          }
        });
      }
    });
  });
});
