#!/bin/bash

echo "========================================"
echo "  AI Blog Platform - Starting Servers"
echo "========================================"
echo

echo "🔧 Starting Backend Server (Port 5001)..."
cd ai-blog-platform-backend
npm start &
BACKEND_PID=$!

echo "⏳ Waiting 5 seconds for backend to start..."
sleep 5

echo "🎨 Starting Frontend Server (Port 3000)..."
cd ../ai-blog-platform-frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Both servers are starting!"
echo
echo "📋 Server Information:"
echo "  Backend:  http://localhost:5001"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:5001/api"
echo "  Health:   http://localhost:5001/health"
echo
echo "🌐 Open your browser and go to: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
