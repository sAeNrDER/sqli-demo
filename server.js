// FIT2173 SQL Injection Demo Server
// INTENTIONALLY VULNERABLE - FOR EDUCATIONAL USE ONLY

const express = require('express');
const initSqlJs = require('sql.js');
const path = require('path');

const app = express();
const PORT = 3000;

let db;

initSqlJs().then(SQL => {
  db = new SQL.Database();

  // ── Users table (Lab 1 — Login Bypass) ──────────────────────────
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
    INSERT INTO users VALUES (1, 'administrator', 'supersecret', 'admin');
    INSERT INTO users VALUES (2, 'alice', 'alice456', 'user');
    INSERT INTO users VALUES (3, 'bob', 'bob789', 'user');
  `);

  // ── Products table (Lab 2 — WHERE Clause / Hidden Data) ─────────
  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT,
      category TEXT,
      price REAL,
      released INTEGER DEFAULT 1,
      description TEXT
    );
    INSERT INTO products VALUES (1,  'OSSTMM 3',                          'Books',    19.99,  1, 'Open Source Security Testing Manual — the industry standard');
    INSERT INTO products VALUES (2,  'Web App Hacker''s Handbook',         'Books',    24.99,  1, 'Finding and exploiting security flaws in web applications');
    INSERT INTO products VALUES (3,  'Hacking: Art of Exploitation',       'Books',    29.99,  1, 'A deep dive into shellcode, heap overflows, and exploitation');
    INSERT INTO products VALUES (4,  '[UNRELEASED] Internal Pentest Guide','Books',    0.00,   0, 'CONFIDENTIAL — not yet published');
    INSERT INTO products VALUES (5,  'Burp Suite Pro License',             'Software', 449.00, 1, 'Annual professional web security testing license');
    INSERT INTO products VALUES (6,  'Wireshark',                          'Software', 0.00,   1, 'The world''s most popular network protocol analyzer');
    INSERT INTO products VALUES (7,  'Nmap',                               'Software', 0.00,   1, 'Network discovery and security auditing tool');
    INSERT INTO products VALUES (8,  '[UNRELEASED] Zero-Day Exploit Pack', 'Software', 9999.00,0, 'RESTRICTED — pre-release exploit collection');
    INSERT INTO products VALUES (9,  'CTF Hacker T-Shirt',                 'Clothing', 29.99,  1, 'I void warranties');
    INSERT INTO products VALUES (10, 'Dark Mode Hoodie',                   'Clothing', 49.99,  1, 'For those who prefer the terminal');
    INSERT INTO products VALUES (11, '[UNRELEASED] Admin Hoodie',          'Clothing', 149.99, 0, 'STAFF ONLY — pre-production exclusive');
  `);

  console.log('\n  FIT2173 SQL Injection Demo');
  console.log(`  Running at: http://localhost:${PORT}\n`);
}).catch(err => { console.error(err); process.exit(1); });

// ── Helpers ──────────────────────────────────────────────────────────
function execQuery(sql) {
  const results = db.exec(sql);
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}
function execSafe(sql, params) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// ── Middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── GET /api/db-info  (homepage table) ───────────────────────────────
app.get('/api/db-info', (req, res) => {
  const users    = execSafe('SELECT id, username, password, role FROM users', []);
  const products = execSafe('SELECT id, name, category, price, released FROM products', []);
  res.json({ users, products });
});

// ── POST /api/login-vulnerable  (Lab 1 — UNSAFE) ─────────────────────
app.post('/api/login-vulnerable', (req, res) => {
  const { username = '', password = '' } = req.body;
  const sql = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  try {
    const rows = execQuery(sql);
    if (rows.length > 0) {
      res.json({ success: true, message: `Welcome, ${rows[0].username}! (role: ${rows[0].role})`,
        sql_executed: sql, rows_returned: rows.length, users_matched: rows.map(r => r.username) });
    } else {
      res.json({ success: false, message: 'Invalid username or password.', sql_executed: sql, rows_returned: 0 });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error: ' + err.message, sql_executed: sql, error: true });
  }
});

// ── POST /api/login-safe  (Lab 1 — SAFE) ─────────────────────────────
app.post('/api/login-safe', (req, res) => {
  const { username = '', password = '' } = req.body;
  const sql = 'SELECT * FROM users WHERE username=? AND password=?';
  try {
    const rows = execSafe(sql, [username, password]);
    if (rows.length > 0) {
      res.json({ success: true, message: `Welcome, ${rows[0].username}! (role: ${rows[0].role})`,
        sql_template: sql, note: 'Parameters bound safely — injection impossible' });
    } else {
      res.json({ success: false, message: 'Invalid username or password.', sql_template: sql });
    }
  } catch (err) { res.status(500).json({ success: false, message: 'Error: ' + err.message }); }
});

// ── GET /api/products  (Lab 2 — UNSAFE WHERE clause) ─────────────────
app.get('/api/products', (req, res) => {
  const { category = '' } = req.query;
  const sql = category
    ? `SELECT * FROM products WHERE category='${category}' AND released=1`
    : `SELECT * FROM products WHERE released=1`;
  try {
    const rows = execQuery(sql);
    res.json({ products: rows, sql_executed: sql, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: true, message: 'Database error: ' + err.message, sql_executed: sql });
  }
});

// ── GET /api/products-safe  (Lab 2 — SAFE) ───────────────────────────
app.get('/api/products-safe', (req, res) => {
  const { category = '' } = req.query;
  const sql = category
    ? 'SELECT * FROM products WHERE category=? AND released=1'
    : 'SELECT * FROM products WHERE released=1';
  const rows = category ? execSafe(sql, [category]) : execSafe(sql, []);
  res.json({ products: rows, sql_template: sql });
});

app.listen(PORT);
