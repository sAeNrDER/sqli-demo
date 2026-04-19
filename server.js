// FIT2173 SQL Injection Demo Server
// INTENTIONALLY VULNERABLE - FOR EDUCATIONAL USE ONLY

const express = require('express');
const initSqlJs = require('sql.js');
const path = require('path');

const app = express();
const PORT = 3000;

let db;

// --- Database Setup (in-memory, initialized async) ---
initSqlJs().then(SQL => {
  db = new SQL.Database();
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
    INSERT INTO users VALUES (1, 'admin', 'password123', 'admin');
    INSERT INTO users VALUES (2, 'alice', 'alice456', 'user');
    INSERT INTO users VALUES (3, 'bob', 'bob789', 'user');
  `);
  console.log('\n  FIT2173 SQL Injection Demo');
  console.log(`  Running at: http://localhost:${PORT}\n`);
  console.log('  DB seeded with users: admin, alice, bob\n');
}).catch(err => {
  console.error('Failed to init database:', err);
  process.exit(1);
});

// Helper: run a query and return rows as objects
function execQuery(sql) {
  const results = db.exec(sql);
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

// Helper: parameterized query returning rows as objects
function execSafe(sql, params) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API: Show DB contents ---
app.get('/api/db-info', (req, res) => {
  const rows = execSafe('SELECT id, username, password, role FROM users', []);
  res.json({ table: 'users', rows });
});

// --- API: VULNERABLE login (intentionally unsafe) ---
app.post('/api/login-vulnerable', (req, res) => {
  const { username = '', password = '' } = req.body;

  // DELIBERATELY UNSAFE: string interpolation — no sanitization
  const sql = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;

  try {
    const rows = execQuery(sql);
    if (rows.length > 0) {
      res.json({
        success: true,
        message: `Welcome, ${rows[0].username}! (role: ${rows[0].role})`,
        sql_executed: sql,
        rows_returned: rows.length,
        users_matched: rows.map(r => r.username)
      });
    } else {
      res.json({
        success: false,
        message: 'Invalid username or password.',
        sql_executed: sql,
        rows_returned: 0
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database error: ' + err.message,
      sql_executed: sql,
      error: true
    });
  }
});

// --- API: SAFE login (parameterized query) ---
app.post('/api/login-safe', (req, res) => {
  const { username = '', password = '' } = req.body;
  const sql = 'SELECT * FROM users WHERE username=? AND password=?';

  try {
    const rows = execSafe(sql, [username, password]);
    if (rows.length > 0) {
      res.json({
        success: true,
        message: `Welcome, ${rows[0].username}! (role: ${rows[0].role})`,
        sql_template: sql,
        note: 'Parameters bound safely — injection impossible'
      });
    } else {
      res.json({
        success: false,
        message: 'Invalid username or password.',
        sql_template: sql
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error: ' + err.message });
  }
});

app.listen(PORT);
