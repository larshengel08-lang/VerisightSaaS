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
echo.

REM Installeer packages stil als requirements bestaan
if exist "requirements.txt" (
    echo Packages controleren...
    pip install -r requirements.txt --quiet
    echo.
)

echo Kies product:
echo   1. ExitScan
echo   2. RetentieScan
echo.
set /p choice=Voer 1 of 2 in: 

if "%choice%"=="1" goto exitreport
if "%choice%"=="2" goto retentionreport

echo.
echo Ongeldige keuze. Gebruik 1 of 2.
pause
exit /b 1

:exitreport
echo.
echo Voorbeeldrapport voor ExitScan genereren...
python generate_voorbeeldrapport.py exit
goto done

:retentionreport
echo.
echo Voorbeeldrapport voor RetentieScan genereren...
python generate_voorbeeldrapport.py retention
goto done

:done
echo.
echo Klaar.
echo Output staat in:
echo   docs\examples\
echo   frontend\public\examples\
pause
