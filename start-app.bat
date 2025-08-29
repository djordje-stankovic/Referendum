@echo off
echo 🚀 Pokretanje Municipal Proposals App...
echo.

echo 📦 Proveravam dependencies...
cd municipal-proposals\backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
)

cd ..\client
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

echo.
echo 🔧 Pokretanje backend servera...
start "Backend Server" cmd /k "cd municipal-proposals\backend && npm start"

echo ⏳ Čekam da se backend pokrene...
timeout /t 5 /nobreak > nul

echo 🌐 Pokretanje frontend servera...
start "Frontend Server" cmd /k "cd municipal-proposals\client && npm run dev"

echo.
echo ✅ Oba servera su pokrenuta!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3000
echo.
echo 💡 Zatvorite terminal prozore da zaustavite servere
pause
