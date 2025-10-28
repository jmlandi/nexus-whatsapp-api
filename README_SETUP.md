# 🔷 Nexus - WhatsApp Business Manager

Sistema completo de gestão de clientes e automação WhatsApp com IA integrada.

## 🌟 Funcionalidades

### Frontend Administrativo
- 🔐 **Autenticação JWT** - Login seguro com tokens
- 👥 **Gestão de Clientes** - Adicionar, editar e listar clientes com telefones
- 📄 **Gestão de Documentos** - Upload de PDFs/relatórios para S3
- 💬 **Simulador de Chat** - Teste a IA personificando um cliente
- 📊 **Dashboard** - Visão geral com estatísticas em tempo real

### Backend API
- 🤖 **IA com Claude (Anthropic)** - Respostas inteligentes e contextualizadas
- 📱 **WhatsApp Business API** - Integração oficial com Meta
- 🗄️ **PostgreSQL + Prisma** - Banco de dados robusto com ORM
- ☁️ **AWS S3** - Armazenamento de documentos
- 🔒 **Autenticação JWT** - Proteção de rotas sensíveis

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Docker Desktop ou Colima
- Conta AWS (S3)
- API Key da Anthropic (Claude)
- WhatsApp Business API (Meta) - opcional para produção

### 1️⃣ Instalação

```bash
# Clone o repositório
git clone https://github.com/jmlandi/nexus-whatsapp-api.git
cd nexus-whatsapp-api

# Instale as dependências
npm install
```

### 2️⃣ Configuração

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas credenciais
nano .env
```

**Variáveis obrigatórias:**
```env
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_S3_BUCKET_NAME=seu_bucket

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# JWT
JWT_SECRET=altere-para-uma-chave-secreta-forte
```

**Variáveis opcionais (para WhatsApp em produção):**
```env
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_id
WHATSAPP_ACCESS_TOKEN=seu_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_verify_token
```

### 3️⃣ Banco de Dados

```bash
# Inicie o PostgreSQL com Docker
./start-db.sh

# Ou manualmente:
docker-compose -f docker-compose.db.yml up -d
npx prisma generate
npx prisma migrate deploy
```

### 4️⃣ Criar Usuário Admin

```bash
npm run create-admin
```

**Credenciais padrão:**
- 📧 Email: `admin@nexus.com`
- 🔑 Senha: `admin123`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

### 5️⃣ Iniciar Servidor

```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

## 📱 Acessando o Sistema

1. Abra o navegador em: **http://localhost:3000**
2. Você será redirecionado para `/login.html`
3. Faça login com as credenciais do admin
4. Pronto! Use o sistema completo

### Páginas Disponíveis

- `/login.html` - Login
- `/register.html` - Criar nova conta (admin)
- `/dashboard.html` - Dashboard principal
- `/customers.html` - Gestão de clientes
- `/documents.html` - Gestão de documentos
- `/simulator.html` - Simulador de chat com IA

## 🗂️ Estrutura do Projeto

```
nexus/
├── src/
│   ├── controllers/      # Lógica de negócio
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── documentController.js
│   │   ├── chatController.js
│   │   └── ...
│   ├── services/         # Integrações externas
│   │   ├── whatsappService.js
│   │   ├── aiService.js
│   │   ├── s3Service.js
│   │   └── ...
│   ├── routes/           # Rotas da API
│   ├── middleware/       # Middlewares (auth, etc)
│   ├── utils/            # Utilitários
│   └── server.js         # Entrada da aplicação
├── public/               # Frontend
│   ├── css/
│   │   └── style.css     # Estilos globais
│   ├── js/
│   │   ├── auth.js       # Autenticação
│   │   ├── api.js        # Helper de API
│   │   ├── dashboard.js
│   │   ├── customers.js
│   │   ├── documents.js
│   │   └── simulator.js
│   ├── login.html
│   ├── dashboard.html
│   ├── customers.html
│   ├── documents.html
│   └── simulator.html
├── prisma/
│   └── schema.prisma     # Schema do banco
├── scripts/
│   └── create-admin.js   # Script de criação de admin
├── docker-compose.yml    # Docker completo
├── docker-compose.db.yml # Apenas banco de dados
├── start-db.sh           # Script para iniciar DB
└── stop-db.sh            # Script para parar DB
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Dados do usuário autenticado

### Clientes
- `GET /api/customer` - Listar clientes
- `POST /api/customer` - Criar cliente
- `PUT /api/customer/:id` - Atualizar cliente
- `DELETE /api/customer/:id` - Deletar cliente

### Telefones
- `GET /api/phone_number` - Listar telefones
- `POST /api/phone_number` - Adicionar telefone
- `DELETE /api/phone_number/:id` - Remover telefone

### Documentos
- `GET /api/document` - Listar documentos
- `GET /api/document/customer/:id` - Documentos de um cliente
- `POST /api/document/upload` - Upload de PDF
- `DELETE /api/document/:id` - Deletar documento

### Chat/Simulador
- `POST /api/webchat/session` - Criar sessão
- `POST /api/webchat/message` - Enviar mensagem
- `GET /api/webchat/history/:id` - Histórico
- `POST /api/webchat/close/:id` - Fechar sessão

### WhatsApp (em produção)
- `POST /api/message` - Webhook do WhatsApp
- `GET /api/message` - Verificação do webhook
- `POST /api/template` - Criar template
- `GET /api/template` - Listar templates

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm run dev                    # Inicia com hot-reload

# Produção
npm start                      # Inicia em modo produção

# Banco de Dados
./start-db.sh                  # Inicia PostgreSQL + PgAdmin
./stop-db.sh                   # Para PostgreSQL
npm run prisma:studio          # Interface visual do Prisma
npx prisma migrate dev         # Criar nova migration

# Utilitários
npm run create-admin           # Criar usuário admin
npm run setup                  # Setup completo (instala tudo)
```

## 🐳 Docker

### Apenas Banco de Dados (Recomendado para Dev)

```bash
# Iniciar
docker-compose -f docker-compose.db.yml up -d

# Parar
docker-compose -f docker-compose.db.yml down
```

### Aplicação Completa

```bash
# Iniciar tudo (API + DB + PgAdmin)
docker-compose up -d

# Parar tudo
docker-compose down
```

## 📊 PgAdmin

Acesse: **http://localhost:5050**

**Credenciais:**
- Email: `admin@nexus.com`
- Senha: `admin`

**Conectar ao banco:**
1. Add New Server
2. General > Name: `Nexus`
3. Connection:
   - Host: `postgres` (ou `localhost` se rodando fora do Docker)
   - Port: `5432`
   - Database: `nexus_db`
   - Username: `nexus_user`
   - Password: `nexus_password`

## 🧪 Testando a IA

1. Acesse `/customers.html`
2. Crie um cliente com nome, sobrenome e telefone
3. (Opcional) Faça upload de um PDF em `/documents.html`
4. Acesse `/simulator.html`
5. Selecione o cliente criado
6. Inicie a simulação e converse com a IA!

A IA terá acesso aos documentos do cliente e contexto das conversas anteriores.

## 📝 Notas Importantes

- ⚠️ **JWT_SECRET**: Altere para uma chave forte em produção
- ⚠️ **Senha Admin**: Altere `admin123` após primeiro acesso
- 📱 **WhatsApp**: É opcional. O sistema funciona sem para testes
- 🔒 **Rotas Protegidas**: Todas as rotas da API (exceto auth) exigem token JWT
- 📄 **PDFs**: Upload máximo de 50MB por arquivo

## 🐛 Troubleshooting

### Banco não conecta
```bash
# Verifique se o Docker está rodando
docker ps

# Reinicie o banco
./stop-db.sh
./start-db.sh
```

### Erro de autenticação
- Verifique se o `JWT_SECRET` está configurado no `.env`
- Limpe o localStorage do navegador (F12 > Application > Local Storage)

### Erro ao fazer upload
- Verifique as credenciais AWS no `.env`
- Confirme que o bucket S3 existe e tem permissões corretas

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Marcos - [GitHub](https://github.com/jmlandi)

---

**🔷 Nexus** - Automação inteligente para WhatsApp Business
