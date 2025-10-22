# Introdução - Nexus API

## 🎯 O que é o Nexus?

Nexus é uma API desenvolvida para automatizar o envio de relatórios de marketing via WhatsApp e gerenciar conversas com inteligência artificial.

## ✨ Funcionalidades Principais

### 1. Gerenciamento de Clientes
- CRUD completo de clientes
- Associação de múltiplos números WhatsApp por cliente
- Soft delete (desativação sem perder dados)

### 2. Relatórios de Marketing
- Upload de PDFs para AWS S3
- Armazenamento seguro com URLs presignadas
- Associação de relatórios a clientes
- Controle de datas e observações

### 3. Mensagens WhatsApp
- Envio via Twilio
- Recebimento através de webhook
- Templates aprovados do WhatsApp
- Histórico completo de conversas

### 4. Chat com IA (Anthropic Claude)
- Respostas automáticas contextualizadas
- Acesso ao histórico de conversas
- Informações sobre relatórios do cliente
- Fallback inteligente em caso de falha

### 5. Automação
- Fechamento automático de chats inativos (cron job)
- Processamento assíncrono de mensagens
- Rate limiting e segurança

## 🏗 Arquitetura

```
┌─────────────┐
│   Cliente   │
│  WhatsApp   │
└──────┬──────┘
       │
       v
┌─────────────┐      ┌──────────────┐
│   Twilio    │ <──> │   Nexus API  │
└─────────────┘      └──────┬───────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                v           v           v
         ┌──────────┐ ┌─────────┐ ┌─────────┐
         │PostgreSQL│ │  AWS S3 │ │Anthropic│
         │          │ │         │ │ Claude  │
         └──────────┘ └─────────┘ └─────────┘
```

## 🛠 Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.x | Framework web |
| **PostgreSQL** | 15+ | Banco de dados |
| **Prisma** | 5.x | ORM |
| **Twilio** | - | WhatsApp API |
| **AWS S3** | - | Armazenamento de arquivos |
| **Anthropic** | - | IA (Claude 3.5 Sonnet) |
| **Docker** | - | Containerização |
| **Winston** | - | Sistema de logs |

## 📂 Estrutura do Projeto

```
nexus/
├── src/
│   ├── controllers/      # Lógica de rotas (req/res)
│   ├── services/         # Integrações externas e lógica de negócio
│   ├── routes/           # Definição de endpoints
│   ├── jobs/             # Tarefas agendadas (cron)
│   ├── utils/            # Utilitários e helpers
│   └── server.js         # Ponto de entrada
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
├── logs/                 # Logs da aplicação
├── docs/                 # Documentação (você está aqui!)
├── docker-compose.yml    # Orquestração de containers
├── Dockerfile            # Imagem Docker da API
└── package.json          # Dependências e scripts
```

## 🔄 Fluxo de Mensagens

1. Cliente envia mensagem via WhatsApp
2. Twilio recebe e envia para webhook do Nexus
3. Nexus processa e salva no banco de dados
4. IA (Claude) gera resposta contextualizada
5. Nexus envia resposta via Twilio
6. Cliente recebe resposta no WhatsApp

## 📊 Modelo de Dados

### Entidades Principais

- **Customer**: Clientes da agência
- **PhoneNumber**: Números WhatsApp dos clientes
- **Report**: Relatórios PDF armazenados no S3
- **Chat**: Conversas ativas ou encerradas
- **ChatMessage**: Mensagens individuais (user, agent, wa_template)

### Relacionamentos

- 1 Customer → N PhoneNumbers
- 1 Customer → N Reports
- 1 PhoneNumber → N Chats
- 1 Chat → N ChatMessages

## 🔐 Segurança

- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de acesso cross-origin
- **Rate Limiting**: Proteção contra abuse
- **Validação**: Express-validator em todas as rotas
- **Soft Delete**: Dados nunca são apagados definitivamente
