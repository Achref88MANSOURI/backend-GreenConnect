const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
  db.run("UPDATE user SET role='user' WHERE role!='user'", function (err) {
    if (err) {
      console.error('Role normalization failed:', err.message);
    } else {
      console.log('Roles normalized. Rows changed:', this.changes);
    }
    db.all("SELECT id, role FROM user", (e, rows) => {
      if (e) console.error('Listing users failed:', e.message);
      else console.table(rows);
      db.close();
    });
  });
});
