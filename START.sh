#!/bin/bash

echo "========================================"
echo "  PAINEL DE REVENDEDORES - INICIAR"
echo "========================================"
echo ""

# Verificar dependências
echo "[1/4] Verificando dependências..."
if ! command -v composer &> /dev/null; then
    echo "ERRO: Composer não encontrado!"
    echo "Instale em: https://getcomposer.org/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js não encontrado!"
    echo "Instale em: https://nodejs.org/"
    exit 1
fi

# Backend
echo "[2/4] Configurando Backend..."
cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Arquivo .env criado!"
fi

if [ ! -d "vendor" ]; then
    composer install --ignore-platform-reqs
    php artisan key:generate
    php artisan jwt:secret
    php artisan migrate --seed
fi

# Frontend
echo "[3/4] Configurando Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    npm install
fi

# Iniciar servidores
echo "[4/4] Iniciando servidores..."
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Login padrão:"
echo "Email: admin@admin.com"
echo "Senha: admin123"
echo ""

# Iniciar backend em background
cd ../backend
php artisan serve &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

# Iniciar frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  SERVIDORES INICIADOS COM SUCESSO!"
echo "========================================"
echo ""
echo "Pressione Ctrl+C para parar os servidores"

# Aguardar interrupção
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
