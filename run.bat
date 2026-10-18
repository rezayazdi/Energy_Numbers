@echo off
cd /d "%~dp0"
if exist "Energy Numbers.exe" (
  start "" "Energy Numbers.exe"
  exit /b 0
)
echo Installer is in the dist folder after build.
echo Or run: Energy Numbers Setup *.exe
pause
