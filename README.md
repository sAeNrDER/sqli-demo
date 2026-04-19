# FIT2173 — SQL Injection & Burp Suite Demo

An interactive educational website for **FIT2173/FIT3173 Web Security Lab 7**. Covers HTML fundamentals, live SQL injection demonstrations, and a Burp Suite proxy guide.

> **For educational use only.** The login page is intentionally vulnerable to demonstrate SQL injection in a safe, controlled environment.

---

## Pages

| Page | Description |
|------|-------------|
| **Home** `/` | Overview, demo database viewer, and quick-reference payload table |
| **HTML Basics** `/html-basics.html` | Page structure, forms, GET vs POST, live HTML editor |
| **SQLi Live Demo** `/login.html` | Vulnerable vs safe login side-by-side with live SQL query preview |
| **How SQLi Works** `/sqli.html` | Breakdown of injection payloads, error probing, and parameterized query defense |
| **Burp Suite Guide** `/burpsuite.html` | Step-by-step proxy walkthrough matching Lab 7 instructions |

---

## Getting Started

**Prerequisites:** [Node.js](https://nodejs.org) v18+

```bash
# 1. Clone the repo
git clone https://github.com/sAeNrDER/sqli-demo.git
cd sqli-demo

# 2. Install dependencies
npm install

# 3. Start the server
node server.js
```

Then open **http://localhost:3000** in your browser.

---

## Demo Payloads

Try these on the **SQLi Live Demo** page:

| Type | Username | Password | Result |
|------|----------|----------|--------|
| Normal login | `admin` | `password123` | Login succeeds |
| Error probe | `'` | anything | 500 DB error — confirms injection |
| Login bypass | `' or 1=1 -- ` | anything | Bypasses auth, returns all users |
| Safe version | `' or 1=1 -- ` | anything | Blocked by parameterized query |

---

## Project Structure

```
sqli-demo/
├── server.js          # Express server with vulnerable + safe API endpoints
├── package.json
└── public/
    ├── index.html         # Homepage
    ├── html-basics.html   # HTML fundamentals
    ├── login.html         # Vulnerable login demo
    ├── sqli.html          # SQL injection explained
    ├── burpsuite.html     # Burp Suite guide
    ├── style.css          # Dark security theme
    └── demo.js            # Live SQL preview + form interactivity
```

---

## Using with Burp Suite

1. Start the server (`node server.js`)
2. In Burp Suite, set the proxy to intercept `localhost:3000`
3. Submit the login form on `/login.html` with **Intercept on**
4. Modify the `username` field to `' or 1=1 -- ` and forward
5. Observe the server bypass in the response

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/db-info` | Returns all rows in the users table |
| `POST` | `/api/login-vulnerable` | Intentionally injectable login (string interpolation) |
| `POST` | `/api/login-safe` | Safe login using parameterized queries |

---

## Stack

- **Node.js + Express** — web server
- **sql.js** — pure JavaScript in-memory SQLite (no native build required)
- **Vanilla HTML/CSS/JS** — no frameworks

---

## References

- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — free interactive labs
- [Burp Suite Documentation](https://portswigger.net/burp/documentation/desktop/getting-started/)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
