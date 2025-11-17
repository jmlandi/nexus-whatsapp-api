# Nexus - WhatsApp API with AI Automation 🤖

Production-ready API for automating marketing report delivery and managing AI-powered customer conversations via WhatsApp.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude_3.5-191919?style=flat&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Business_API-25D366?style=flat&logo=whatsapp&logoColor=white)](https://developers.facebook.com/docs/whatsapp)
[![AWS S3](https://img.shields.io/badge/AWS-S3-232F3E?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/s3/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📚 Complete Documentation

All documentation has been reorganized in `/docs` for easy access:

### 🚀 Getting Started
| Document | Description |
|----------|-------------|
| **[📖 Documentation Index](./docs/00-INDEX.md)** | Complete documentation navigation |
| **[⚡ Quick Start](./docs/01-QUICK-START.md)** | Get running in 5 minutes |
| **[📦 Installation](./docs/02-INSTALLATION.md)** | Detailed setup instructions |
| **[⚙️ Configuration](./docs/03-CONFIGURATION.md)** | Environment variables reference |

### 📖 Core Guides
| Document | Description |
|----------|-------------|
| **[🏗️ Architecture](./docs/04-ARCHITECTURE.md)** | System design and components |
| **[🗄️ Database](./docs/05-DATABASE.md)** | Schema and relationships |
| **[🔌 API Reference](./docs/06-API-REFERENCE.md)** | Complete endpoints documentation |

### 🔗 Integrations
| Document | Description |
|----------|-------------|
| **[📱 WhatsApp](./docs/07-WHATSAPP.md)** | WhatsApp Business API setup |
| **[🤖 AI/Claude](./docs/08-AI-ANTHROPIC.md)** | Anthropic Claude configuration |
| **[🪣 AWS S3](./docs/09-AWS-S3.md)** | S3 storage setup |

### 🚀 Deployment & Operations
| Document | Description |
|----------|-------------|
| **[🌐 Deployment](./docs/10-DEPLOYMENT.md)** | Production deployment guide |
| **[🔒 Security](./docs/13-SECURITY.md)** | Security best practices |
| **[🔧 Troubleshooting](./docs/19-TROUBLESHOOTING.md)** | Common issues and solutions |

---

## 🎯 About Nexus

Nexus automates marketing report delivery and provides AI-powered customer support via WhatsApp.

### Key Features

**🤖 AI-Powered Conversations**
- Context-aware responses using Claude 3.5
- PDF report content extraction and analysis
- Natural language understanding in Portuguese

**📱 WhatsApp Integration**
- Official WhatsApp Business API
- Template messages for reports
- Interactive chat management
- Webhook handling

**📊 Report Management**
- PDF upload to AWS S3
- Automated delivery schedules
- Customer-specific reports
- Secure presigned URLs

**🔐 Production-Ready**
- JWT authentication
- Rate limiting & CORS
- Request tracking
- Graceful shutdown
- Comprehensive logging

**⚡ Performance Optimized**
- Database indexes
- Response compression
- Connection pooling
- Efficient caching

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- WhatsApp Business API account
- AWS S3 bucket
- Anthropic API key

### Installation (5 minutes)

```bash
# 1. Clone and install
git clone https://github.com/yourusername/nexus-whatsapp-api.git nexus
cd nexus
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Setup database
npx prisma generate
npx prisma migrate dev
npm run create-admin

# 4. Start server
npm run dev
```

### Verify

Visit http://localhost:3000/health

**Expected response:**
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "whatsapp": "configured",
    "s3": "configured",
    "anthropic": "configured"
  }
}
```

✅ **Running!** Visit [Quick Start Guide](./docs/01-QUICK-START.md) for detailed instructions.

---

## 🐳 Docker Setup

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start with auto-reload
npm start                # Production server
npm run create-admin     # Create admin user

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI

# Code Quality
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix issues
npm run format           # Format code

# Deployment
npm run build            # Prepare for production
```

---

## 🏗️ Tech Stack

### Backend
- **Node.js 18** - Runtime environment
- **Express 4** - Web framework
- **Prisma 5** - ORM and database toolkit
- **PostgreSQL 15** - Relational database

### Integrations
- **WhatsApp Business API** - Messaging platform
- **Anthropic Claude 3.5** - AI responses
- **AWS S3** - File storage
- **JWT** - Authentication

### DevOps
- **Docker** - Containerization
- **Render.com** - Deployment platform
- **PM2** - Process management
- **Winston** - Logging

---

## 📂 Project Structure

```
nexus/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utilities & helpers
│   └── server.js        # Application entry
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── docs/                # 📚 Complete documentation
├── public/              # Static files & SPA
├── scripts/             # Utility scripts
├── logs/                # Application logs
└── package.json         # Dependencies
```

---

## 🔒 Security Features

- ✅ JWT authentication with secure secrets
- ✅ Rate limiting (auth, upload, API calls)
- ✅ Input sanitization (XSS, SQL injection)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Request ID tracking
- ✅ Audit logging
- ✅ Environment validation
- ✅ Secure password hashing (bcrypt)

See [Security Guide](./docs/13-SECURITY.md) for details.

---

## 📊 API Overview

### Authentication
```bash
POST /api/auth/login       # User login
POST /api/auth/register    # User registration
```

### Customers
```bash
GET    /api/customers           # List customers
POST   /api/customers           # Create customer
GET    /api/customers/:id       # Get customer
PUT    /api/customers/:id       # Update customer
DELETE /api/customers/:id       # Delete customer
```

### Reports
```bash
GET    /api/reports             # List reports
POST   /api/reports             # Upload report
GET    /api/reports/:id         # Get report
DELETE /api/reports/:id         # Delete report
GET    /api/reports/:id/download # Download PDF
```

### Chats
```bash
GET    /api/chats               # List chats
POST   /api/chats               # Create chat
GET    /api/chats/:id           # Get chat
POST   /api/chats/:id/message   # Send message
POST   /api/chats/:id/close     # Close chat
```

### Templates
```bash
GET    /api/templates           # List templates
POST   /api/templates/send      # Send template message
```

See [API Reference](./docs/06-API-REFERENCE.md) for complete documentation.

---

## 🚀 Deployment

### Render.com (Recommended)

1. Create PostgreSQL database
2. Create web service
3. Set environment variables
4. Deploy automatically from GitHub

**Deploy in 5 minutes:** [Render Deployment Guide](./docs/11-RENDER-DEPLOY.md)

### VPS/Server

1. Install Node.js, PostgreSQL, Nginx
2. Clone repository
3. Configure environment
4. Setup PM2 and SSL

**Full guide:** [Deployment Guide](./docs/10-DEPLOYMENT.md)

---

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexus.com","password":"your_password"}'

# Test with JWT
curl http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📈 Monitoring

### Health Check
```bash
GET /health
```

Response includes:
- Server status
- Database connectivity
- External services (WhatsApp, S3, AI)
- Memory usage
- Uptime

### Logs
```bash
# View logs
tail -f logs/combined.log
tail -f logs/error.log

# Docker logs
docker-compose logs -f api
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation
- **[Complete Docs](./docs/00-INDEX.md)** - All documentation
- **[Troubleshooting](./docs/19-TROUBLESHOOTING.md)** - Common issues
- **[FAQ](./docs/19-TROUBLESHOOTING.md#faq)** - Frequently asked questions

### Community
- GitHub Issues - Bug reports and feature requests
- Discussions - Questions and community support

### Debug
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Check health
curl http://localhost:3000/health

# View logs
tail -f logs/combined.log
```

---

## 🎯 Roadmap

- [x] WhatsApp Business API integration
- [x] AI-powered responses (Claude 3.5)
- [x] PDF report management
- [x] Customer portal SPA
- [x] Production security hardening
- [x] Comprehensive documentation
- [ ] Multi-language support
- [ ] Automated testing suite
- [ ] Analytics dashboard
- [ ] Webhook event logging
- [ ] Message templates editor

---

## 🌟 Acknowledgments

- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Anthropic Claude](https://www.anthropic.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Express.js](https://expressjs.com/)

---

**Made with ❤️ for automated customer engagement**

**Version:** 2.0 | **Last Updated:** November 2025


# 3. Execute migrations
docker-compose exec api npx prisma migrate dev --name init

# 4. Teste
curl http://localhost:3000/health
```

**Pronto!** API rodando em http://localhost:3000

➡️ **Leia a [documentação completa](./docs/README.md)** para mais detalhes.

## 🛠 Stack Tecnológica

- **Node.js** + **Express** - API REST
- **PostgreSQL** + **Prisma** - Banco de dados
- **Twilio** - WhatsApp API
- **AWS S3** - Armazenamento de arquivos
- **Anthropic Claude** - Inteligência Artificial
- **Docker** - Containerização

## 📂 Estrutura do Projeto

```
nexus/
├── src/
│   ├── controllers/      # Lógica de rotas
│   ├── services/         # Integrações (Twilio, S3, IA)
│   ├── routes/           # Definição de endpoints
│   ├── jobs/             # Cron jobs
│   └── utils/            # Utilitários
├── prisma/
│   └── schema.prisma     # Schema do banco
├── docs/                 # Documentação
└── docker-compose.yml    # Orquestração
```

➡️ **Para mais detalhes**, consulte:
- [Documentação de Instalação](./docs/02-INSTALACAO.md)
- [Documentação da API](./docs/03-API.md)
- [Guia de Deploy](./docs/04-DEPLOY.md)

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a [documentação completa](./docs/README.md)
2. Verifique os logs: `docker-compose logs -f api`
3. Abra uma issue no repositório

## 📄 Licença

MIT License - veja LICENSE para detalhes.

---

**Desenvolvido com ❤️ para automação de marketing via WhatsApp**
