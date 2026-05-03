const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'lostfound.sqlite');
const db = new sqlite3.Database(dbPath);

const name = "Admin User";
const email = "admin@gmail.com";
const password = "123456";
const role = "admin";

db.run("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role], function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Admin user checked/created. ID: ${this.lastID}`);
  db.close();
});
