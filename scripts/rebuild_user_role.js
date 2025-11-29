const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  db.run(`CREATE TABLE user_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phoneNumber TEXT,
    address TEXT,
    avatarUrl TEXT,
    settings TEXT,
    role TEXT NOT NULL
  )`, function(err){ if(err) console.error('Create new table error:', err.message); });

  db.run(`INSERT INTO user_new (id,name,email,password,phoneNumber,address,avatarUrl,settings,role)
          SELECT id,name,email,password,phoneNumber,address,avatarUrl,settings,'user' as role FROM user`, function(err){
            if(err) console.error('Copy rows error:', err.message);
            else console.log('Rows copied:', this.changes);
          });

  db.run('DROP TABLE user', function(err){ if(err) console.error('Drop old table error:', err.message); });
  db.run('ALTER TABLE user_new RENAME TO user', function(err){ if(err) console.error('Rename table error:', err.message); });
  db.run('COMMIT', function(err){ if(err) console.error('Commit error:', err.message); else console.log('Migration committed'); });

  db.all('SELECT id, role FROM user', (err, rows) => {
    if(err) console.error('Final select error:', err.message);
    else console.table(rows);
    db.close();
  });
});
