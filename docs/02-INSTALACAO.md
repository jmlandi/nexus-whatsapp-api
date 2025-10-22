# Instalação e Configuração

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Node.js** 18+ (se rodar sem Docker)
- Contas configuradas:
  - [Twilio](https://www.twilio.com/) (WhatsApp API)
  - [AWS S3](https://aws.amazon.com/s3/)
  - [Anthropic](https://console.anthropic.com/) (opcional, para IA)

## ⚡ Instalação Rápida (Docker)

### 1. Clone o Projeto

```bash
git clone <seu-repositorio> nexus
cd nexus
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha as variáveis:

```bash
# Node.js
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://nexus_user:nexus_password@postgres:5432/nexus_db

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+14155238886

# AWS S3
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=nexus-reports
AWS_REGION=us-east-1

# Anthropic (opcional - para IA)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=2000

# Cron Jobs
INACTIVE_CHAT_HOURS=72
```

### 3. Inicie os Serviços

```bash
# Inicia todos os containers
docker-compose up -d

# Aguarde ~30 segundos para os serviços subirem
```

### 4. Execute as Migrations

```bash
docker-compose exec api npx prisma migrate dev --name init
```

### 5. Verifique a Instalação

```bash
# Health check
curl http://localhost:3000/health

# Deve retornar:
# {"status":"ok","timestamp":"...","uptime":...}
```

## 🔧 Instalação Manual (Sem Docker)

### 1. Instale as Dependências

```bash
npm install
```

### 2. Configure PostgreSQL

```bash
# Crie o banco de dados
createdb nexus_db

# Configure DATABASE_URL no .env
DATABASE_URL=postgresql://user:password@localhost:5432/nexus_db
```

### 3. Execute as Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Inicie o Servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

## 🛠 Comandos Úteis

### Docker

```bash
# Ver logs
docker-compose logs -f api

# Parar todos os serviços
docker-compose down

# Reconstruir API
docker-compose build api

# Acessar shell do container
docker-compose exec api sh

# Reiniciar serviço
docker-compose restart api
```

### Prisma

```bash
# Interface visual do banco
docker-compose exec api npx prisma studio
# Acesse: http://localhost:5555

# Gerar cliente Prisma
docker-compose exec api npx prisma generate

# Nova migration
docker-compose exec api npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
docker-compose exec api npx prisma migrate deploy

# Resetar banco (CUIDADO! Apaga todos os dados)
docker-compose exec api npx prisma migrate reset
```

### NPM Scripts

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Prisma Studio
npm run prisma:studio

# Gerar cliente Prisma
npm run prisma:generate

# Nova migration
npm run prisma:migrate
```

## 🔗 Acessar Interfaces

| Interface | URL | Credenciais |
|-----------|-----|-------------|
| **API** | http://localhost:3000 | - |
| **PgAdmin** | http://localhost:5050 | admin@nexus.com / admin |
| **Prisma Studio** | http://localhost:5555 | - |

### Conectar PgAdmin ao PostgreSQL

No PgAdmin, adicione um novo servidor:

- **Host**: `postgres`
- **Port**: `5432`
- **Database**: `nexus_db`
- **Username**: `nexus_user`
- **Password**: `nexus_password`

## 🌐 Configurar Webhook do Twilio

1. Acesse o [Console Twilio](https://console.twilio.com/)
2. Vá em **Messaging** → **Settings** → **WhatsApp Sandbox**
3. Configure o webhook:
   - **When a message comes in**: `https://seu-dominio.com/api/message`
   - **Method**: `POST`

Para desenvolvimento local, use [ngrok](https://ngrok.com/):

```bash
# Instale o ngrok
brew install ngrok  # macOS
# ou baixe de https://ngrok.com/download

# Exponha a porta 3000
ngrok http 3000

# Use a URL gerada no webhook do Twilio
# Exemplo: https://abc123.ngrok.io/api/message
```

## 🗄 Configurar AWS S3

1. Acesse o [Console AWS](https://console.aws.amazon.com/)
2. Crie um bucket S3:
   - Nome: `nexus-reports` (ou outro de sua preferência)
   - Region: `us-east-1` (ou outra região)
   - Desmarque "Block all public access" se necessário
3. Crie um usuário IAM com permissões S3:
   - Policy: `AmazonS3FullAccess` ou custom
   - Anote **Access Key ID** e **Secret Access Key**
4. Configure as variáveis no `.env`

## 🤖 Configurar Anthropic (IA)

1. Acesse [Anthropic Console](https://console.anthropic.com/)
2. Crie uma conta e obtenha uma API Key
3. Configure no `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

## 🧪 Testar a Instalação

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Criar um cliente
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "Joãozinho",
      "phoneNumbers": ["+5511999999999"]
    }]
  }'

# 3. Listar clientes
curl http://localhost:3000/api/customer
```

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"

```bash
# Encontre o processo
lsof -ti:3000

# Mate o processo
kill -9 $(lsof -ti:3000)
```

### Erro: "Cannot connect to PostgreSQL"

```bash
# Verifique se o container está rodando
docker-compose ps

# Reinicie o PostgreSQL
docker-compose restart postgres
```

### Erro: "Prisma Client not generated"

```bash
docker-compose exec api npx prisma generate
docker-compose restart api
```

### Logs não aparecem

```bash
# Verifique o diretório logs
ls -la logs/

# Veja logs em tempo real
docker-compose logs -f api
```

## ✅ Próximos Passos

Após a instalação:

1. Leia [03-API.md](./03-API.md) para entender os endpoints
2. Teste os exemplos de requisições
3. Configure o webhook do Twilio
4. Faça upload de um relatório de teste
5. Envie uma mensagem para testar o fluxo completo
