@echo off
title Smart AI Timetable Generator Launcher
echo ===================================================
echo   Smart AI Timetable Generator - Quick Launcher
echo   Suguna College of Engineering
echo ===================================================
echo.

echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm install
)
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [2/3] Starting Backend Express API (Port 5000)...
start "Timetable Backend API" cmd /k "node backend/server.js"

echo [3/3] Starting Frontend React UI (Port 3000)...
start "Timetable Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 3 >nul

echo Opening browser...
start http://localhost:3000

echo.
echo ===================================================
echo   Application Running Successfully!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000/api
echo   Cloud DB: Supabase (Shared across both laptops)
echo ===================================================
pause
