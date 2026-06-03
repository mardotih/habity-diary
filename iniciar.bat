@echo off
REM ========================================
REM  Diario de Habitos - Script de inicializacao
REM  Passo a passo:
REM    1. Vai para a pasta do projeto
REM    2. Fecha servidores anteriores (se estiverem a correr)
REM    3. Abre uma janela para o backend (porta 4000)
REM    4. Abre uma janela para o frontend (porta 5173)
REM    5. Abre o browser no endereco do frontend
REM ========================================

title Diario de Habitos

REM Passo 1: Ir para a pasta onde este script esta guardado
cd /d "%~dp0"

echo ========================================
echo   Diario de Habitos - Inicializacao
echo ========================================
echo.

REM Passo 2: Fechar servidores que tenham ficado abertos anteriormente
echo [..] A fechar servidores anteriores...
taskkill /fi "WINDOWTITLE eq Backend*" /f >nul 2>nul
taskkill /fi "WINDOWTITLE eq Frontend*" /f >nul 2>nul
timeout /t 1 /nobreak >nul

REM Passo 3: Iniciar o servidor backend (Node.js na porta 4000)
REM A janela fica aberta (cmd /k) para mostrar erros se houver
echo [..] A iniciar backend (porta 4000)...
start "Backend (porta 4000)" cmd /k pushd "%~dp0backend" ^&^& node src\server.js

REM Aguarda 4 segundos para o backend arrancar
timeout /t 4 /nobreak >nul

REM Passo 4: Iniciar o servidor frontend (Vite na porta 5173)
echo [..] A iniciar frontend (porta 5173)...
start "Frontend (porta 5173)" cmd /k pushd "%~dp0frontend" ^&^& node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173

REM Aguarda 6 segundos para o frontend arrancar
timeout /t 6 /nobreak >nul

REM Passo 5: Abrir o browser automaticamente
echo [..] A abrir no navegador...
start http://localhost:5173

echo.
echo ========================================
echo   Projecto iniciado com sucesso!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:4000/api
echo.
echo   Credenciais de admin:
echo     Email:    admin@habitdiary.com
echo     Password: Admin@123
echo ========================================
echo.
echo  As janelas dos servidores estao abertas em separado.
echo  Feche essas janelas para parar os servidores.
echo.
pause
