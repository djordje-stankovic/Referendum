#!/bin/bash

echo "🚀 Pokretanje Municipal Proposals App..."
echo

echo "📦 Proveravam dependencies..."

# Backend dependencies
cd municipal-proposals/backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Frontend dependencies
cd ../client
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo
echo "🔧 Pokretanje backend servera..."
cd ../backend
npm start &
BACKEND_PID=$!

echo "⏳ Čekam da se backend pokrene..."
sleep 5

echo "🌐 Pokretanje frontend servera..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Oba servera su pokrenuta!"
echo
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3000"
echo
echo "💡 Pritisnite Ctrl+C da zaustavite servere"

# Wait for user to stop
trap "echo '🛑 Zaustavljam servere...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
