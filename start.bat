@echo off
title FIT2173 SQLi Demo
color 0A
cls

echo.
echo  ===============================================
echo   FIT2173 ^| SQL Injection Demo
echo  ===============================================
echo.

:: ── Check Node.js ──────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo.
    echo  Please install Node.js v18+ from:
    echo  https://nodejs.org
    echo.
    echo  After installing, re-run this script.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% found

:: ── Install dependencies if needed ─────────────────────────────────
if not exist "node_modules\" (
    echo.
    echo  [SETUP] node_modules not found. Installing dependencies...
    echo  This takes about 30 seconds on first run.
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo  [ERROR] npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed.
) else (
    echo  [OK] Dependencies already installed.
)

:: ── Start server ───────────────────────────────────────────────────
echo.
echo  -----------------------------------------------
echo   Starting server on http://localhost:3000
echo   Press Ctrl+C to stop
echo  -----------------------------------------------
echo.

:: Open browser after a short delay (1.5s for server to boot)
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

node server.js

pause
