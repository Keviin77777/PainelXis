@echo off
echo ========================================
echo   PAINEL DE REVENDEDORES - INICIAR
echo ========================================
echo.

echo [1/4] Verificando dependencias...
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Composer nao encontrado!
    echo Instale em: https://getcomposer.org/
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo [2/4] Instalando dependencias do Backend...
cd backend
if not exist ".env" (
    copy .env.example .env
    echo Arquivo .env criado!
)

if not exist "vendor" (
    echo Instalando dependencias do Composer...
    call composer install --ignore-platform-reqs
    if %errorlevel% neq 0 (
        echo.
        echo ERRO: Falha ao instalar dependencias!
        echo Execute: FIX-PHP.bat para corrigir extensoes PHP
        pause
        exit /b 1
    )
    call php artisan key:generate
    call php artisan jwt:secret
)

echo [3/4] Instalando dependencias do Frontend...
cd ..\frontend
if not exist "node_modules" (
    call npm install
)

echo [4/4] Iniciando servidores...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Login padrao:
echo Email: admin@admin.com
echo Senha: admin123
echo.

start "Backend Laravel" cmd /k "cd backend && php artisan serve"
timeout /t 3 /nobreak >nul
start "Frontend React" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   SERVIDORES INICIADOS COM SUCESSO!
echo ========================================
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul
start http://localhost:3000
