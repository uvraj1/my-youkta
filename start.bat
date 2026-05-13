@echo off
title Youkta AI Studio
color 0B
echo ========================================================
echo       INITIALIZING YOUKTA AI STUDIO ENGINE...
echo ========================================================
echo.
echo [1/3] Checking and installing dependencies...
call npm install
echo.
echo [2/3] Starting Local Backend (File System) Server...
:: /k keeps the backend terminal open so you can clearly see local save & compile logs
start "Youkta Local Server" cmd /k "title Youkta Backend Server & color 0D & echo Starting Backend... & npm run server"
echo.
:: Wait 3 seconds to ensure the server starts before the frontend
timeout /t 3 /nobreak > nul

echo [3/3] Opening Browser and Starting UI...
start http://localhost:3000
call npm run dev
pause