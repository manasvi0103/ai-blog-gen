@echo off
echo ========================================
echo   AI Blog Platform - Starting Servers
echo ========================================
echo.

echo 🔧 Starting Backend Server (Port 5001)...
start "Backend Server" cmd /k "cd ai-blog-platform-backend && npm start"

echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo 🎨 Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd ai-blog-platform-frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📋 Server Information:
echo   Backend:  http://localhost:5001
echo   Frontend: http://localhost:3000
echo   API:      http://localhost:5001/api
echo   Health:   http://localhost:5001/health
echo.
echo 🌐 Open your browser and go to: http://localhost:3000
echo.
pause
