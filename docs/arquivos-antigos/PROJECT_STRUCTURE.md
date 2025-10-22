# Estrutura do Projeto Nexus

```
nexus/
│
├── 📁 src/                          # Código-fonte da aplicação
│   ├── 📁 controllers/              # Controladores das rotas (lógica de requisição/resposta)
│   │   ├── customerController.js   # CRUD de clientes
│   │   ├── phoneNumberController.js # CRUD de números de telefone
│   │   ├── reportController.js     # CRUD de relatórios + S3
│   │   ├── messageController.js    # Webhook Twilio + mensagens
│   │   └── chatController.js       # Gerenciamento de chats
│   │
│   ├── 📁 services/                 # Lógica de negócio e integrações externas
│   │   ├── twilioService.js        # Integração com Twilio (WhatsApp)
│   │   ├── s3Service.js            # Integração com AWS S3 (armazenamento)
│   │   └── chatService.js          # Lógica de gerenciamento de chats
│   │
│   ├── 📁 routes/                   # Definição das rotas da API
│   │   ├── index.js                # Agregador de rotas
│   │   ├── customerRoutes.js       # Rotas de clientes
│   │   ├── phoneNumberRoutes.js    # Rotas de números
│   │   ├── reportRoutes.js         # Rotas de relatórios
│   │   ├── messageRoutes.js        # Rotas de mensagens
│   │   └── chatRoutes.js           # Rotas de chats
│   │
│   ├── 📁 jobs/                     # Tarefas agendadas (cron jobs)
│   │   └── cronJobs.js             # Job de fechar chats inativos
│   │
│   ├── 📁 utils/                    # Utilitários e helpers
│   │   ├── logger.js               # Logger com Winston
│   │   ├── prisma.js               # Cliente Prisma (singleton)
│   │   └── helpers.js              # Funções auxiliares e validators
│   │
│   └── 📄 server.js                 # Ponto de entrada da aplicação
│
├── 📁 prisma/                       # Configuração do Prisma ORM
│   └── schema.prisma               # Schema do banco de dados
│
├── 📁 logs/                         # Arquivos de log (gerados automaticamente)
│   ├── error.log                   # Apenas erros
│   ├── combined.log                # Todos os logs
│   └── .gitkeep                    # Mantém pasta no Git
│
├── 📁 .github/                      # Configurações GitHub (opcional)
│   └── workflows/                  # GitHub Actions para CI/CD
│
├── 📄 .env                          # Variáveis de ambiente (NÃO commitado)
├── 📄 .env.example                 # Template de variáveis de ambiente
├── 📄 .env.local                   # Exemplo para desenvolvimento local
│
├── 📄 .gitignore                   # Arquivos ignorados pelo Git
├── 📄 .dockerignore                # Arquivos ignorados pelo Docker
│
├── 📄 package.json                 # Dependências e scripts npm
├── 📄 package-lock.json            # Lock de versões (gerado automaticamente)
│
├── 📄 Dockerfile                   # Imagem Docker da aplicação
├── 📄 docker-compose.yml           # Orquestração dos serviços
│
├── 📄 setup.sh                     # Script de inicialização automatizada
│
├── 📄 README.md                    # Documentação principal (LEIA PRIMEIRO!)
├── 📄 QUICKSTART.md                # Guia rápido de 5 minutos
├── 📄 API_EXAMPLES.md              # Exemplos de requisições
├── 📄 DEPLOY.md                    # Guia de deploy em produção
├── 📄 CONTRIBUTING.md              # Guia para contribuidores
└── 📄 CHANGELOG.md                 # Histórico de mudanças

```

## 📊 Fluxo de Dados

```
Cliente WhatsApp
       ↓
    Twilio
       ↓
Webhook (POST /api/message)
       ↓
messageController
       ↓
chatService (busca/cria chat)
       ↓
PostgreSQL (salva mensagem)
       ↓
[Futura integração com IA]
       ↓
Resposta automática
       ↓
twilioService
       ↓
    Twilio
       ↓
Cliente WhatsApp
```

## 🔄 Arquitetura da Aplicação

```
┌─────────────────────────────────────────────────┐
│                  Cliente HTTP                    │
│            (Postman, cURL, Frontend)            │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│               Express Server                     │
│  ┌──────────────────────────────────────────┐  │
│  │  Middlewares (Helmet, CORS, Rate Limit)  │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │             Routes                        │  │
│  │  /api/customer, /api/chat, etc.          │  │
│  └──────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│             Controllers Layer                    │
│  (Recebe requisições, valida, chama services)   │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│              Services Layer                      │
│  ┌──────────────┬──────────────┬─────────────┐ │
│  │ chatService  │ twilioService│  s3Service  │ │
│  └──────────────┴──────────────┴─────────────┘ │
│           (Lógica de negócio)                   │
└─────┬──────────────────┬────────────────┬───────┘
      │                  │                │
      ▼                  ▼                ▼
┌──────────┐      ┌──────────┐    ┌──────────┐
│PostgreSQL│      │  Twilio  │    │  AWS S3  │
│  (Prisma)│      │WhatsApp  │    │  (PDFs)  │
└──────────┘      └──────────┘    └──────────┘
```

## 🗄️ Modelo de Dados

```
┌─────────────┐
│  Customer   │
│─────────────│
│ id          │───┐
│ firstName   │   │
│ lastName    │   │
│ nickname    │   │
│ isActive    │   │
└─────────────┘   │
                  │ 1:N
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌───────────┐ ┌────────┐ ┌─────────┐
│PhoneNumber│ │ Report │ │  Chat   │
│───────────│ │────────│ │─────────│
│ id        │ │ id     │ │ id      │
│customerId │ │custId  │ │custId   │
│phoneNumber│ │url     │ │phoneId  │
│ isActive  │ │timestamp│ │isOpen   │
└─────┬─────┘ └────────┘ └────┬────┘
      │                        │ 1:N
      │ 1:N                    │
      │                        ▼
      │              ┌──────────────┐
      └──────────────│ ChatMessage  │
                     │──────────────│
                     │ id           │
                     │ chatId       │
                     │ message      │
                     │ type         │
                     │ createdAt    │
                     └──────────────┘
```

## 🚀 Stack Tecnológica

### Backend
- **Node.js** 18+ - Runtime JavaScript
- **Express.js** 4.x - Framework web minimalista
- **Prisma** 5.x - ORM moderno para TypeScript/JavaScript

### Banco de Dados
- **PostgreSQL** 15+ - Banco relacional robusto

### Integrações
- **Twilio** - API WhatsApp Business
- **AWS S3** - Object storage para PDFs

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **Nginx** - Proxy reverso (produção)

### Segurança
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

### Ferramentas
- **Winston** - Logger estruturado
- **node-cron** - Agendamento de tarefas
- **Multer** - Upload de arquivos (futuro)

## 📝 Padrões e Convenções

### Estrutura de Código
- **Controllers**: Apenas lógica de HTTP (req/res)
- **Services**: Lógica de negócio
- **Utils**: Funções puras reutilizáveis
- **Routes**: Definição de endpoints

### Nomenclatura
- **Arquivos**: camelCase.js
- **Classes/Constructors**: PascalCase
- **Variáveis/Funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Commits
- Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

### Código
- ESLint (futuro) para linting
- Prettier (futuro) para formatação
- JSDoc para documentação de funções

## 🔐 Segurança

### Implementado
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet security headers
- ✅ CORS configurado
- ✅ Input validation
- ✅ Soft delete
- ✅ Logging de auditoria

### Recomendado para Produção
- 🔒 JWT Authentication
- 🔒 Twilio webhook signature validation
- 🔒 HTTPS obrigatório
- 🔒 Secrets manager (não usar .env)
- 🔒 Database encryption at rest
- 🔒 Input sanitization adicional

## 📦 Dependências Principais

### Production
```json
{
  "express": "^4.18.2",           // Framework web
  "@prisma/client": "^5.7.0",     // ORM
  "twilio": "^4.19.0",            // WhatsApp API
  "@aws-sdk/client-s3": "^3.478.0", // S3 SDK
  "winston": "^3.11.0",           // Logger
  "node-cron": "^3.0.3",          // Cron jobs
  "helmet": "^7.1.0",             // Security
  "cors": "^2.8.5",               // CORS
  "express-rate-limit": "^7.1.5"  // Rate limit
}
```

### Development
```json
{
  "prisma": "^5.7.0",             // Prisma CLI
  "nodemon": "^3.0.2"             // Auto-reload
}
```

## 📊 Métricas e KPIs

### Performance
- Tempo de resposta < 200ms (95th percentile)
- Uptime > 99.9%
- Taxa de erro < 0.1%

### Uso
- Mensagens processadas/dia
- Relatórios enviados/mês
- Chats ativos simultâneos
- Taxa de resposta da IA

## 🎯 Próximos Passos

1. **Fase 1 - MVP** ✅
   - CRUD completo
   - Integração Twilio
   - Upload S3
   - Chat básico

2. **Fase 2 - IA** 🚧
   - Integração OpenAI/Anthropic
   - Processamento de PDFs
   - Respostas contextualizadas
   - Treinamento customizado

3. **Fase 3 - Features** 📅
   - Dashboard web
   - Analytics
   - Multi-tenancy
   - API pública

4. **Fase 4 - Scale** 📅
   - Microservices
   - Event-driven architecture
   - Real-time WebSocket
   - Global CDN

## 📞 Links Úteis

- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Twilio](https://www.twilio.com/docs/whatsapp)
- [Documentação AWS S3](https://docs.aws.amazon.com/s3)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Desenvolvido para WN7 Agência de Marketing Digital**
