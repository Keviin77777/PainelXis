# 🚀 Guia de Instalação Completo

## Requisitos

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+
- Redis
- Docker (opcional)

---

## 📋 Instalação Passo a Passo

### 1️⃣ Clonar o Projeto

```bash
git clone <seu-repositorio>
cd reseller-panel
```

### 2️⃣ Configurar Backend

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
composer install

# Copiar arquivo de ambiente
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate

# Gerar chave JWT
php artisan jwt:secret

# Configurar banco de dados no .env
# Edite as linhas:
# DB_DATABASE=reseller_panel
# DB_USERNAME=seu_usuario
# DB_PASSWORD=sua_senha

# Criar banco de dados
mysql -u root -p -e "CREATE DATABASE reseller_panel"

# Executar migrations e seeders
php artisan migrate --seed

# Iniciar servidor
php artisan serve
```

O backend estará rodando em: http://localhost:8000

### 3️⃣ Configurar Frontend

```bash
# Abrir novo terminal e entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em: http://localhost:3000

### 4️⃣ Acessar o Sistema

Abra o navegador em: http://localhost:3000

**Credenciais padrão:**
- Email: `admin@admin.com`
- Senha: `admin123`

### 5️⃣ Configurar Admin API

1. Faça login no sistema
2. Vá em **Configurações** no menu lateral
3. Preencha:
   - **URL do Servidor**: http://seu-servidor-ip
   - **Código de Acesso Admin**: seu-codigo-admin
4. Clique em **Testar Conexão**
5. Se bem-sucedido, clique em **Salvar Configurações**

---

## 🐳 Instalação com Docker

### Opção Mais Rápida

```bash
# Subir todos os serviços
docker-compose up -d

# Aguardar inicialização (30-60 segundos)

# Executar migrations
docker-compose exec backend php artisan migrate --seed
```

Acesse: http://localhost

### Comandos Úteis Docker

```bash
# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Parar serviços
docker-compose down

# Reiniciar serviços
docker-compose restart

# Reconstruir imagens
docker-compose up -d --build
```

---

## 🔧 Configuração Avançada

### Redis (Opcional mas Recomendado)

No `.env` do backend:
```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Configurar HTTPS (Produção)

1. Obter certificado SSL (Let's Encrypt recomendado)
2. Editar `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... resto da configuração
}
```

### Cloudflare

1. Adicionar domínio no Cloudflare
2. Configurar DNS apontando para seu servidor
3. Ativar proxy (nuvem laranja)
4. Em SSL/TLS: Selecionar "Full" ou "Full (strict)"
5. Em Security > WAF: Configurar regras de firewall

---

## 🧪 Testar Instalação

### Backend

```bash
cd backend
php artisan test
```

### Frontend

```bash
cd frontend
npm run build
```

---

## 🐛 Solução de Problemas

### Erro: "Class 'Redis' not found"

```bash
# Instalar extensão Redis do PHP
sudo apt-get install php-redis
sudo systemctl restart php8.2-fpm
```

### Erro: "SQLSTATE[HY000] [2002] Connection refused"

Verifique se o MySQL está rodando:
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### Erro: "npm ERR! code ELIFECYCLE"

```bash
# Limpar cache e reinstalar
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Porta 8000 ou 3000 já em uso

```bash
# Backend - usar outra porta
php artisan serve --port=8001

# Frontend - editar vite.config.js
# Alterar: server: { port: 3001 }
```

---

## 📊 Verificar Status

### Backend
```bash
cd backend
php artisan about
```

### Banco de Dados
```bash
php artisan migrate:status
```

### Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## 🔐 Segurança em Produção

1. **Alterar credenciais padrão**
2. **Configurar firewall**
3. **Usar HTTPS**
4. **Configurar rate limiting**
5. **Manter sistema atualizado**
6. **Fazer backups regulares**

---

## 📞 Suporte

Se encontrar problemas, verifique:
- Logs do Laravel: `backend/storage/logs/laravel.log`
- Logs do Nginx: `docker-compose logs nginx`
- Console do navegador (F12)
