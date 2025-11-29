const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

const DEFAULT_FARMER_ID = 1;

function run() {
  db.serialize(() => {
    db.get('SELECT id FROM user WHERE id = ?', [DEFAULT_FARMER_ID], (err, user) => {
      if (err) return console.error('Error checking default user:', err.message);
      if (!user) {
        console.error('Default user with id 1 not found. Aborting backfill.');
        return;
      }
      db.run('UPDATE product SET farmerId = ? WHERE farmerId IS NULL', [DEFAULT_FARMER_ID], function (updateErr) {
        if (updateErr) return console.error('Backfill update error:', updateErr.message);
        console.log('Rows updated (farmerId set):', this.changes);
        db.all('SELECT id, farmerId FROM product', (listErr, rows) => {
          if (listErr) return console.error('Listing products error:', listErr.message);
          console.table(rows);
          db.close();
        });
      });
    });
  });
}
run();
