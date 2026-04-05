@echo off
REM Verisight — Streamlit Operator Dashboard
REM Run from the Verisight project root folder

cd /d "%~dp0"

echo.
echo  Verisight Dashboard starting...
echo  Dashboard: http://localhost:8501
echo.

python -m streamlit run dashboard/app.py --server.port 8501 --server.headless true
