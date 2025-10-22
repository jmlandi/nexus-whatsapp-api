# Nexus - API de Automação WhatsApp com IA 🤖

API desenvolvida para automatizar o envio de relatórios de marketing e gerenciar conversas com agente de IA via WhatsApp.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude_3.5-191919?style=flat&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Twilio](https://img.shields.io/badge/Twilio-WhatsApp-F22F46?style=flat&logo=twilio&logoColor=white)](https://www.twilio.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3-232F3E?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/s3/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📚 Documentação Completa

Toda a documentação foi reorganizada na pasta `/docs` para facilitar o acesso:

| Documento | Descrição |
|-----------|-----------|
| **[📖 Introdução](./docs/01-INTRODUCAO.md)** | O que é o Nexus e principais funcionalidades |
| **[⚡ Instalação](./docs/02-INSTALACAO.md)** | Como instalar e configurar o projeto |
| **[🔌 API](./docs/03-API.md)** | Documentação completa da API e exemplos |
| **[🚀 Deploy](./docs/04-DEPLOY.md)** | Guia de deploy em produção |

---

## 🎯 Sobre o Projeto

Nexus é uma API que automatiza o envio de relatórios de marketing via WhatsApp e gerencia conversas com inteligência artificial.

**Principais Funcionalidades:**
- ✅ Gerenciamento de clientes e números WhatsApp
- ✅ Upload e armazenamento de relatórios PDF (AWS S3)
- ✅ Envio/recebimento de mensagens via Twilio
- ✅ Chat com IA contextualizada (Anthropic Claude)
- ✅ Automação de tarefas (cron jobs)

## ⚡ Início Rápido

```bash
# 1. Clone e configure
git clone <seu-repositorio> nexus
cd nexus
cp .env.example .env
# Edite .env com suas credenciais

# 2. Inicie com Docker
docker-compose up -d

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
