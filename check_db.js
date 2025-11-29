const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Tables:', tables);

    const productTable = tables.find(t => t.name.toLowerCase().includes('product'));
    if (productTable) {
      console.log(`Querying table: ${productTable.name}`);
      db.all(`SELECT * FROM ${productTable.name}`, (err, rows) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Products:', rows);
        }
      });
    } else {
      console.log('No product table found.');
    }
  });
});
