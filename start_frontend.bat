@echo off
cd /d "%~dp0\frontend"
echo Werkmap: %CD%
echo.

REM Controleer Node.js
node --version
if errorlevel 1 (
    echo FOUT: Node.js niet gevonden. Installeer via https://nodejs.org
    pause
    exit /b 1
)

REM Installeer dependencies als node_modules ontbreekt
if not exist "node_modules" (
    echo node_modules niet gevonden - npm install uitvoeren...
    call npm install
)

echo.
echo Frontend starten op http://localhost:3000
echo.

call npm run dev

echo.
echo Frontend gestopt.
pause
