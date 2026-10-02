@echo off
setlocal
title Hotel Premier - 1-Click GitHub Sync
color 0b

echo ===================================================================
echo   HOTEL PREMIER QR MENU - GITHUB & NETLIFY 1-CLICK SYNC
echo   Developer: Avinash Hedawoo
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Staging modified files...
git add .

echo.
set /p commit_msg="Enter update description (Press Enter for 'Update Hotel Premier Menu'): "
if "%commit_msg%"=="" set commit_msg=Update Hotel Premier Menu

echo.
echo [2/3] Committing changes...
git commit -m "%commit_msg%"

echo.
echo [3/3] Pushing to GitHub (Netlify will auto-deploy in 15 seconds)...
git push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================================
    echo   SUCCESS! Changes pushed to GitHub!
    echo   Netlify is building and deploying your live site right now!
    echo ===================================================================
) else (
    echo.
    echo NOTE: If this is your first time, make sure you have added your remote repository:
    echo git remote add origin https://github.com/YOUR_USERNAME/hotel-premier-qr-menu.git
    echo git push -u origin main
)

echo.
pause
