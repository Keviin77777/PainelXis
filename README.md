# Painel de Revendedores IPTV

Sistema completo de gerenciamento para revendedores IPTV com integração Admin API.

## 🚀 Tecnologias

### Backend
- PHP 8.2 + Laravel 10
- MySQL 8.0
- Redis
- JWT Authentication
- Admin API Integration

### Frontend
- React 18
- Vite
- TailwindCSS
- Zustand (State Management)
- Recharts (Gráficos)
- Dark Mode

### Infraestrutura
- Nginx + Proxy Reverso
- Docker + Docker Compose
- Anti-DDoS básico (Rate Limiting)
- Cloudflare Ready

## 📦 Instalação Rápida

### Opção 1: Desenvolvimento Local

**Backend (Laravel):**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve
```

**Frontend (React):**
```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

**Login padrão:**
- Email: admin@admin.com
- Senha: admin123

### Opção 2: Docker (Recomendado para Produção)

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

Acesse: http://localhost

## ⚙️ Configuração da Admin API

Após fazer login, vá em **Configurações** e configure:

1. **URL do Servidor**: http://seu-servidor-ip
2. **Código de Acesso Admin**: seu-codigo-admin
3. Clique em **Testar Conexão**
4. Se bem-sucedido, clique em **Salvar Configurações**

A configuração é salva automaticamente no `.env` do backend.

## 🔧 Configuração Admin API

No arquivo `.env` do backend, configure:

```env
ADMIN_API_URL=http://ip-do-servidor
ADMIN_API_CODE=codigo-de-acesso-admin
```

## 📱 Funcionalidades

- ✅ Login com JWT
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de Linhas
- ✅ Gerenciamento de Usuários
- ✅ Dark Mode
- ✅ Responsivo
- ✅ Integração completa com Admin API
- ✅ Cache Redis
- ✅ Rate Limiting
- ✅ Logs de atividades

## 🔐 Segurança

- JWT com criptografia
- Rate limiting no Nginx
- Headers de segurança
- Validação de dados
- Proteção CSRF
- Sanitização de inputs

## 📊 Admin API Endpoints Integrados

- User Info & Statistics
- Lines Management (CRUD)
- Users Management (CRUD)
- MAG Devices
- Activity Logs
- Live Connections
- Bouquets & Packages

## 🌐 Deploy

1. Configure Cloudflare para proteção DDoS
2. Configure SSL/TLS
3. Ajuste variáveis de ambiente
4. Execute: `docker-compose up -d`

## 📝 Licença

Proprietário - Todos os direitos reservados
