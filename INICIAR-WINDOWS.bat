@echo off
cd /d "%~dp0"
echo Instalando dependencias de San Andres Explorer...
npm install
if errorlevel 1 pause & exit /b 1
echo Iniciando la aplicacion...
npm run dev
pause
