// FIT2173 Demo - Frontend Interactivity

// ── SQL Live Preview ──────────────────────────────────────────────
function updateSqlPreview() {
  const userEl = document.getElementById('username');
  const passEl = document.getElementById('password');
  const previewEl = document.getElementById('sql-preview-text');
  if (!userEl || !previewEl) return;

  const u = userEl.value || '';
  const p = passEl ? passEl.value || '' : '';

  const uEsc = escHtml(u);
  const pEsc = escHtml(p);

  // Highlight injected content in red
  const uHighlight = uEsc ? `<span class="sql-inject">${uEsc}</span>` : '';
  const pHighlight = pEsc ? `<span class="sql-inject">${pEsc}</span>` : '';

  previewEl.innerHTML =
    `<span class="sql-keyword">SELECT</span> * <span class="sql-keyword">FROM</span> users ` +
    `<span class="sql-keyword">WHERE</span> username=<span class="sql-string">'${uHighlight}'</span> ` +
    `<span class="sql-keyword">AND</span> password=<span class="sql-string">'${pHighlight}'</span>`;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Vulnerable Login Submit ────────────────────────────────────────
async function doVulnerableLogin(event) {
  if (event) event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const box = document.getElementById('response-box');

  box.className = 'response-box show';
  box.innerHTML = '<span style="color:#8b949e">Sending request...</span>';

  try {
    const res = await fetch('/api/login-vulnerable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    const status = res.status;

    if (data.error) {
      box.className = 'response-box show error';
      box.innerHTML = `
        <div style="color:var(--red);font-weight:bold">HTTP ${status} — Database Error</div>
        <div style="margin-top:6px;color:#ff7b72">${escHtml(data.message)}</div>
        <div style="margin-top:10px;color:var(--text2);font-size:0.8rem">SQL executed:</div>
        <pre style="margin:4px 0 0;padding:8px;background:#0a0e14;border-radius:4px;font-size:0.82rem;color:var(--red)">${escHtml(data.sql_executed)}</pre>
      `;
    } else if (data.success) {
      box.className = 'response-box show success';
      box.innerHTML = `
        <div style="color:var(--green);font-weight:bold">HTTP 200 — LOGIN SUCCESS</div>
        <div style="margin-top:6px">${escHtml(data.message)}</div>
        ${data.rows_returned > 1 ? `<div style="color:var(--yellow);margin-top:4px">Rows returned: ${data.rows_returned} — matched users: ${data.users_matched.join(', ')}</div>` : ''}
        <div style="margin-top:10px;color:var(--text2);font-size:0.8rem">SQL executed:</div>
        <pre style="margin:4px 0 0;padding:8px;background:#0a0e14;border-radius:4px;font-size:0.82rem;color:var(--green)">${escHtml(data.sql_executed)}</pre>
      `;
    } else {
      box.className = 'response-box show error';
      box.innerHTML = `
        <div style="color:var(--red);font-weight:bold">HTTP 200 — LOGIN FAILED</div>
        <div style="margin-top:6px;color:var(--text2)">${escHtml(data.message)}</div>
        <div style="margin-top:10px;color:var(--text2);font-size:0.8rem">SQL executed:</div>
        <pre style="margin:4px 0 0;padding:8px;background:#0a0e14;border-radius:4px;font-size:0.82rem;color:var(--text2)">${escHtml(data.sql_executed)}</pre>
      `;
    }
  } catch (err) {
    box.className = 'response-box show error';
    box.innerHTML = `<div style="color:var(--red)">Network error: ${err.message}</div>`;
  }
}

// ── Safe Login Submit ──────────────────────────────────────────────
async function doSafeLogin(event) {
  if (event) event.preventDefault();
  const username = document.getElementById('safe-username').value;
  const password = document.getElementById('safe-password').value;
  const box = document.getElementById('safe-response-box');

  box.className = 'response-box show';
  box.innerHTML = '<span style="color:#8b949e">Sending request...</span>';

  try {
    const res = await fetch('/api/login-safe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      box.className = 'response-box show success';
      box.innerHTML = `
        <div style="color:var(--green);font-weight:bold">LOGIN SUCCESS</div>
        <div style="margin-top:6px">${escHtml(data.message)}</div>
        <div style="margin-top:8px;color:var(--text2);font-size:0.8rem">SQL template: <code style="color:var(--green)">${escHtml(data.sql_template)}</code></div>
        <div style="color:var(--green);font-size:0.8rem;margin-top:4px">${escHtml(data.note || '')}</div>
      `;
    } else {
      box.className = 'response-box show error';
      box.innerHTML = `
        <div style="color:var(--red);font-weight:bold">LOGIN FAILED — injection attempt blocked</div>
        <div style="margin-top:6px;color:var(--text2)">${escHtml(data.message)}</div>
        <div style="margin-top:8px;font-size:0.8rem;color:var(--text2)">SQL template: <code>${escHtml(data.sql_template || '')}</code></div>
      `;
    }
  } catch (err) {
    box.className = 'response-box show error';
    box.innerHTML = `<div style="color:var(--red)">Network error: ${err.message}</div>`;
  }
}

// ── Inject Payload Helper ─────────────────────────────────────────
function injectPayload(user, pass) {
  const uEl = document.getElementById('username');
  const pEl = document.getElementById('password');
  if (uEl) uEl.value = user;
  if (pEl) pEl.value = pass;
  updateSqlPreview();
  uEl && uEl.focus();
}

function injectSafePayload(user, pass) {
  const uEl = document.getElementById('safe-username');
  const pEl = document.getElementById('safe-password');
  if (uEl) uEl.value = user;
  if (pEl) pEl.value = pass;
}

// ── HTML Basics Live Editor ───────────────────────────────────────
function updatePreview() {
  const code = document.getElementById('html-editor');
  const frame = document.getElementById('preview-frame');
  if (!code || !frame) return;
  frame.srcdoc = code.value;
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Attach SQL preview listeners
  const u = document.getElementById('username');
  const p = document.getElementById('password');
  if (u) u.addEventListener('input', updateSqlPreview);
  if (p) p.addEventListener('input', updateSqlPreview);
  updateSqlPreview();

  // Attach login form
  const form = document.getElementById('login-form');
  if (form) form.addEventListener('submit', doVulnerableLogin);

  const safeForm = document.getElementById('safe-login-form');
  if (safeForm) safeForm.addEventListener('submit', doSafeLogin);

  // HTML editor
  const editor = document.getElementById('html-editor');
  if (editor) {
    editor.addEventListener('input', updatePreview);
    updatePreview();
  }

  // Active nav link
  const path = window.location.pathname.replace('/', '') || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === path || (path === 'index.html' && a.getAttribute('href') === '/')) {
      a.classList.add('active');
    }
  });
});
