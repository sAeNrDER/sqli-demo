# FIT2173 — SQL Injection & Burp Suite Demo

An interactive educational website for **FIT2173/FIT3173 Web Security Lab 7**. Covers HTML fundamentals, live SQL injection demonstrations, and a Burp Suite proxy guide.

> **For educational use only.** The login page is intentionally vulnerable to demonstrate SQL injection in a safe, controlled environment.

---

## Prerequisites — Environment Setup

Before running the project, make sure these are installed. Run the check commands first — if any fail, follow the install link.

| Tool | Required | Check | Install |
|------|----------|-------|---------|
| **Node.js** | v18+ | `node -v` | [nodejs.org](https://nodejs.org) |
| **npm** | v8+ (bundled with Node) | `npm -v` | Comes with Node.js |
| **Git** | any | `git --version` | [git-scm.com](https://git-scm.com) |

**One-liner to check all three at once (PowerShell / CMD):**
```powershell
node -v && npm -v && git --version
```

Expected output (versions may differ):
```
v20.11.0
10.2.4
git version 2.43.0.windows.1
```

> If `node` is not found, download the **LTS** installer from [nodejs.org](https://nodejs.org) — npm is included automatically. No Python or compiler needed; this project uses `sql.js` (pure JavaScript SQLite).

---

## Quick Start (Windows — Recommended)

**Prerequisite:** [Node.js v18+](https://nodejs.org) must be installed.

### Option A — One double-click

1. Clone or download the repo
2. Double-click **`start.bat`**

That's it. The script installs dependencies (first run only) and opens your browser automatically.

---

### Option B — One-liner (PowerShell / CMD)

Paste this into PowerShell or Command Prompt — clones, installs, and starts in one go:

```powershell
git clone https://github.com/sAeNrDER/sqli-demo.git; cd sqli-demo; npm install; node server.js
```

Then open **http://localhost:3000**.

---

### Option C — Manual steps

```bash
# 1. Clone the repo
git clone https://github.com/sAeNrDER/sqli-demo.git
cd sqli-demo

# 2. Install dependencies (first time only)
npm install

# 3. Start the server
node server.js
```

Then open **http://localhost:3000**.

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| **Lab Setup** | `/setup.html` | PortSwigger account registration + Burp Suite proxy setup |
| **Home** | `/` | Overview, live DB viewer, quick-reference payload table |
| **HTML Basics** | `/html-basics.html` | Page structure, forms, GET vs POST, live HTML editor |
| **SQLi Live Demo** | `/login.html` | Vulnerable vs safe login, Retrieving Hidden Data activity, Prevention guide |
| **How SQLi Works** | `/sqli.html` | Injection mechanics, error probing, parameterized query defence |
| **Burp Suite Guide** | `/burpsuite.html` | Step-by-step proxy walkthrough matching Lab 7 instructions |

---

## Demo Payloads

Try these on the **SQLi Live Demo** page:

| Type | Username | Password | Result |
|------|----------|----------|--------|
| Normal login | `admin` | `password123` | Login succeeds |
| Error probe | `'` | anything | 500 DB error — confirms injection |
| Login bypass (all users) | `' or 1=1 -- ` | anything | Returns every row, logs in as admin |
| Login bypass (targeted) | `admin'--` | anything | Bypasses password check for admin specifically |
| Safe version | `' or 1=1 -- ` | anything | Blocked — parameterized query |

---

## Project Structure

```
sqli-demo/
├── start.bat              # Windows one-click launcher
├── server.js              # Express server — vulnerable + safe API endpoints
├── package.json
└── public/
    ├── setup.html         # Lab setup guide (PortSwigger + Burp proxy)
    ├── index.html         # Homepage
    ├── html-basics.html   # HTML fundamentals
    ├── login.html         # Vulnerable login + hidden data + prevention demo
    ├── sqli.html          # SQL injection explained
    ├── burpsuite.html     # Burp Suite guide
    ├── style.css          # Dark security theme
    └── demo.js            # Live SQL preview + form interactivity
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/db-info` | Returns all rows in the users table |
| `POST` | `/api/login-vulnerable` | Intentionally injectable login (string interpolation) |
| `POST` | `/api/login-safe` | Safe login using parameterized queries |
| `GET` | `/api/products` | Injectable product filter (WHERE clause injection) |
| `GET` | `/api/products-safe` | Safe product filter (parameterized) |

---

## Using with Burp Suite

1. Start the server (`start.bat` or `node server.js`)
2. In Burp Suite → **Proxy → Open browser** (easiest) or configure Firefox to proxy via `127.0.0.1:8080`
3. Navigate to `http://localhost:3000/login.html` in the Burp browser
4. Submit the login form with **Intercept on**
5. Modify the `username` field to `' or 1=1 -- ` and forward
6. Observe the bypass in the response

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
