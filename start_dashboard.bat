@echo off
REM RetentionPulse — Streamlit Operator Dashboard
REM Run from the RetentionPulse project root folder

cd /d "%~dp0"

echo.
echo  RetentionPulse Dashboard starting...
echo  Dashboard: http://localhost:8501
echo.

python -m streamlit run dashboard/app.py --server.port 8501 --server.headless true
