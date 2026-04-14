@echo off
setlocal
cd /d "%~dp0"
python sync_planning_artifacts.py
endlocal
