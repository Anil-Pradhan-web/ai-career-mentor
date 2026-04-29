@echo off
echo.
echo  =========================================
echo   AI Career Mentor - Starting Servers...
echo  =========================================
echo.

echo  [1/2] Starting Backend (FastAPI - Port 8000)...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo  [2/2] Starting Frontend (Next.js - Port 3000)...
start "Frontend - Next.js" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  =========================================
echo   Both servers started!
echo   Backend  -> http://localhost:8000
echo   Frontend -> http://localhost:3000
echo   API Docs -> http://localhost:8000/docs
echo  =========================================
echo.
pause
