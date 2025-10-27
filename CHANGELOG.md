# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-10-16

### ✨ Adicionado

#### Funcionalidades Principais
- Sistema completo de gerenciamento de clientes (CRUD)
- Gerenciamento de números de telefone WhatsApp
- Upload e armazenamento de relatórios PDF no S3
- Integração completa com Twilio para WhatsApp
- Sistema de chat com mensagens
- Webhook para receber mensagens do Twilio
- Envio de templates aprovados do WhatsApp

#### Infraestrutura
- Arquitetura baseada em Express.js
- Banco de dados PostgreSQL com Prisma ORM
- Containerização completa com Docker
- Sistema de logs com Winston
- Rate limiting para segurança
- Middlewares de segurança (Helmet, CORS)

#### Automação
- Cron job para fechar chats inativos (configurável)
- Execução a cada 5 minutos

#### Integrações
- AWS S3 para armazenamento de PDFs
- URLs assinadas temporárias para downloads
- Twilio para envio/recebimento de mensagens WhatsApp
- Suporte para templates e mensagens com mídia

#### API REST
- **Customers**: 5 endpoints (list, get, create, update, delete)
- **PhoneNumbers**: 5 endpoints (list, get, create, update, delete)
- **Reports**: 5 endpoints (list, get, create, update, delete)
- **Messages**: 3 endpoints (list, get, create/webhook, delete)
- **Chats**: 4 endpoints (list, get, close, send-template)

#### Regras de Negócio
- Chat fechado não aceita mensagens
- Apenas um chat aberto por cliente/número
- Soft delete para preservar histórico
- Validação de formato de números internacionais

#### Documentação
- README.md completo com todas as funcionalidades
- QUICKSTART.md para início rápido
- API_EXAMPLES.md com exemplos de requisições
- Comentários detalhados no código
- Schema do banco documentado

#### DevEx (Developer Experience)
- Script de setup automatizado
- Docker Compose com PgAdmin
- Variáveis de ambiente documentadas
- Suporte a desenvolvimento local

### 🔒 Segurança
- Rate limiting (100 req/15min)
- Helmet.js para headers seguros
- CORS configurado
- Validação de entrada
- Logs de auditoria

### 📦 Dependências
- express: ^4.18.2
- @prisma/client: ^5.7.0
- twilio: ^4.19.0
- @aws-sdk/client-s3: ^3.478.0
- winston: ^3.11.0
- node-cron: ^3.0.3
- helmet: ^7.1.0
- cors: ^2.8.5

### 🗄️ Banco de Dados
- 5 tabelas: Customers, PhoneNumbers, Reports, Chats, ChatMessages
- Relacionamentos com cascade delete
- Índices para performance
- Enum para tipos de mensagem

---

## [1.1.0] - 2025-10-17

### ✨ Adicionado

#### 🤖 Integração com IA Anthropic Claude
- Respostas automáticas inteligentes via WhatsApp
- Contextualização baseada em relatórios do cliente (últimos 5)
- Memória de conversas (últimas 10 mensagens)
- Processamento assíncrono de mensagens para não bloquear webhook
- Fallback automático se IA falhar ou não estiver configurada
- Suporte a múltiplos modelos Claude (3.5 Sonnet, Opus, Haiku)

#### Novos Services e Métodos
- **`aiService.js`** - Service completo para integração Anthropic
  - `generateResponse()` - Gera respostas via Claude AI
  - `getCustomerContext()` - Busca contexto completo do cliente
  - `getChatHistory()` - Formata histórico para IA
  - `summarizeReport()` - Resume relatórios para contexto
  - `analyzeSentiment()` - Análise de sentimento (preparado para futuro)
  - `testConnection()` - Testa conexão com Anthropic API
  - `isConfigured()` - Verifica se IA está configurada

- **Métodos no `chatService.js`**
  - `processMessageWithAI()` - Processa mensagem com IA (síncrono com fallback)
  - `processMessageAsync()` - Processa mensagem com IA em background

#### Configuração
- **Variáveis de Ambiente**
  - `ANTHROPIC_API_KEY` - Chave da API Anthropic
  - `ANTHROPIC_MODEL` - Modelo do Claude (default: claude-3-5-sonnet-20241022)
  - `ANTHROPIC_MAX_TOKENS` - Limite de tokens por resposta (default: 1024)

#### 📝 Documentação Extensa
- **`AI_INTEGRATION.md`** - Documentação completa (500+ linhas)
  - Guia de configuração passo a passo
  - Exemplos de conversas reais
  - Personalização do system prompt
  - Custos estimados e otimização
  - Troubleshooting específico para IA
  - Recursos futuros planejados

- **`docs/README.md`** - Índice completo de documentação
  - Navegação rápida entre documentos
  - Tabelas de referência
  - Guias por tipo de usuário

- **README.md Melhorado**
  - Badges de tecnologias (Node, Express, PostgreSQL, Anthropic, etc)
  - Seção "Integração com IA" detalhada
  - Seção "Início Rápido com IA" com exemplos práticos
  - Seção "Recursos Futuros" com roadmap
  - Troubleshooting específico para IA
  - Links para documentação completa

#### Dependências
- `@anthropic-ai/sdk@^0.27.0` - SDK oficial Anthropic

### 🔄 Modificado

- **`messageController.js`**
  - Webhook agora chama `processMessageAsync()` após salvar mensagem
  - Retorna resposta imediata (200) ao Twilio para evitar timeout
  - IA processa em background sem bloquear webhook

- **Arquitetura de Services**
  - `src/services/aiService.js` adicionado à estrutura
  - Separação de responsabilidades: chat vs IA

- **`docker-compose.yml`**
  - Adicionadas variáveis de ambiente Anthropic
  - Valores default para facilitar setup

### 📊 Estatísticas

- **Código**: ~250 linhas de código IA
- **Documentação**: ~700 linhas de documentação IA
- **Custo por mensagem**: ~$0.03 - $0.05 (claude-3-5-sonnet)
- **Tempo de resposta**: 2-5 segundos (API Anthropic)

### 🎯 Funcionalidades da IA

1. **Análise de Relatórios**
   - IA lê e entende métricas de marketing
   - Responde perguntas sobre resultados de campanhas
   - Compara períodos diferentes

2. **Contextualização**
   - Acessa nome do cliente e empresa
   - Consulta últimos 5 relatórios
   - Mantém contexto de últimas 10 mensagens

3. **Personalidade**
   - Age como "Nexus", assistente da WN7
   - Tom profissional e prestativo
   - Usa emojis ocasionalmente
   - Foco em métricas e resultados

4. **Segurança**
   - API key em variável de ambiente
   - Nunca exposta em logs
   - Validação antes de usar
   - Tratamento de erros robusto

---

## [Unreleased]

### 🎯 Planejado para próximas versões

#### v1.2.0
- [ ] Cache de contexto para reduzir custos Anthropic
- [ ] Análise de sentimento ativa com alertas
- [ ] Processamento de PDF para extração automática de métricas
- [ ] Sistema de notificações por email
- [ ] Dashboard administrativo

#### v1.2.0
- [ ] Autenticação JWT
- [ ] Multi-tenancy (múltiplas agências)
- [ ] Analytics e métricas
- [ ] Suporte a múltiplos idiomas

#### v2.0.0
- [ ] GraphQL API
- [ ] WebSocket para mensagens em tempo real
- [ ] Sistema de templates personalizáveis
- [ ] Integração com outras plataformas (Telegram, etc)

### 🐛 Bugs Conhecidos
- Nenhum no momento

---

## Como Ler Este Changelog

### Tipos de Mudanças
- `✨ Adicionado` para novas funcionalidades
- `🔄 Modificado` para mudanças em funcionalidades existentes
- `🗑️ Depreciado` para funcionalidades que serão removidas
- `❌ Removido` para funcionalidades removidas
- `🐛 Corrigido` para correções de bugs
- `🔒 Segurança` para vulnerabilidades corrigidas

### Versionamento
- **MAJOR** (X.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (1.X.0): Novas funcionalidades compatíveis
- **PATCH** (1.0.X): Correções de bugs

---

**Desenvolvido para WN7 Agência de Marketing Digital**
