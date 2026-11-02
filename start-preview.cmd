@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 20 or newer is required. Install Node.js and run this file again.
  pause
  exit /b 1
)

if not defined PORT set "PORT=4173"
echo Light Index local preview
echo Open http://127.0.0.1:%PORT%/ in your browser.
echo Keep this window open while viewing the website. Press Ctrl+C to stop.
echo.
node server.mjs
if errorlevel 1 (
  echo.
  echo Preview could not start. If port %PORT% is already in use, try opening the address above.
  pause
  exit /b 1
)
