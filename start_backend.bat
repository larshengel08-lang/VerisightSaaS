@echo off
cd /d "%~dp0"
echo Werkmap: %CD%
echo.

REM Controleer Python
python --version
if errorlevel 1 (
    echo FOUT: Python niet gevonden in PATH
    pause
    exit /b 1
)

REM Maak venv aan als die ontbreekt
if not exist ".venv\Scripts\activate.bat" (
    echo Aanmaken .venv...
    python -m venv .venv
)

REM Activeer venv
call .venv\Scripts\activate.bat
echo Venv actief.

REM Installeer packages
echo Packages controleren...
pip install -r requirements.txt --quiet

echo.
echo Backend starten op http://localhost:8000
echo.

python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

echo.
echo Backend gestopt.
pause
