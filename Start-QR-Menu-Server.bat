@echo off
title Hotel Premier - QR Menu Server
echo ===================================================
echo Starting Hotel Premier QR Menu Server...
echo ===================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-QR-Menu-Server.ps1"
pause
