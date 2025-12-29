const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Delete all investments first (due to foreign key)
db.run('DELETE FROM investments', function(err) {
  if (err) {
    console.error('Error deleting investments:', err);
    process.exit(1);
  }
  console.log('✓ Deleted all investments records');

  // Then delete all investment projects
  db.run('DELETE FROM investment_projects', function(err) {
    if (err) {
      console.error('Error deleting investment_projects:', err);
      process.exit(1);
    }
    console.log('✓ Deleted all investment_projects records');

    // Verify the tables are empty
    db.all('SELECT COUNT(*) as count FROM investment_projects', (err, rows) => {
      if (err) {
        console.error('Error querying investment_projects:', err);
      } else {
        console.log(`Investment projects count: ${rows[0].count}`);
      }

      db.all('SELECT COUNT(*) as count FROM investments', (err, rows) => {
        if (err) {
          console.error('Error querying investments:', err);
        } else {
          console.log(`Investments count: ${rows[0].count}`);
        }

        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            process.exit(1);
          }
          console.log('✓ Database cleared successfully');
          process.exit(0);
        });
      });
    });
  });
});
