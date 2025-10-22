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

## � Documentação Completa

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

## � Stack Tecnológica

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
2. Configure permissões de leitura/escrita
3. Gere credenciais de acesso (Access Key ID e Secret Access Key)

## 🐳 Executando o Projeto

### Com Docker (Recomendado)

O Docker Compose sobe toda a infraestrutura necessária:

```bash
# Inicia todos os serviços
docker-compose up -d

# Verifica logs
docker-compose logs -f api

# Para os serviços
docker-compose down
```

**Serviços disponíveis:**
- API: http://localhost:3000
- PostgreSQL: localhost:5432
- PgAdmin: http://localhost:5050 (admin@nexus.com / admin)

### Executar migrations do Prisma

```bash
# Dentro do container
docker-compose exec api npx prisma migrate dev

# Ou localmente
npx prisma migrate dev
```

### Sem Docker

```bash
# Certifique-se de ter PostgreSQL rodando localmente

# Execute as migrations
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate

# Inicie o servidor em desenvolvimento
npm run dev

# Ou em produção
npm start
```

## 🎬 Início Rápido com IA

Para testar a integração com IA rapidamente:

### 1. Configure a chave da Anthropic

```bash
# Obtenha sua chave em: https://console.anthropic.com/
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" >> .env.local
```

### 2. Crie um cliente de teste

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste",
    "email": "teste@exemplo.com",
    "companyName": "Empresa Teste LTDA"
  }'
```

### 3. Adicione um número ao cliente

```bash
curl -X POST http://localhost:3000/api/phone-numbers \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "phoneNumber": "+5511999999999",
    "label": "WhatsApp Principal"
  }'
```

### 4. Envie uma mensagem de teste

Envie uma mensagem do WhatsApp configurado no Twilio para o número de sandbox. A IA responderá automaticamente! 🤖

**O que a IA faz:**
- ✅ Recebe sua mensagem via webhook Twilio
- ✅ Busca contexto do cliente (relatórios e histórico)
- ✅ Gera resposta inteligente usando Claude
- ✅ Envia resposta automaticamente via WhatsApp

**Exemplo de conversa:**
```
Cliente: Olá! Como foram os resultados da última campanha?

Nexus (IA): Olá! Pelos dados do seu último relatório de janeiro/2024, 
sua campanha teve excelentes resultados: 15.000 impressões, 1.200 cliques 
(CTR de 8%) e 45 conversões. O investimento de R$ 3.000 gerou um ROI de 
250%. Gostaria de detalhes sobre alguma métrica específica? 📊
```

## 📚 Documentação da API

### Base URL

```
http://localhost:3000/api
```

### Health Check

```http
GET /health
```

Verifica se a API está respondendo.

---

## 👥 Customers (Clientes)

### Listar todos os clientes

```http
GET /api/customer?page=1&limit=20
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máximo: 100)

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "Joãozinho",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "phoneNumbers": [...],
      "_count": {
        "reports": 5,
        "chats": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Buscar cliente específico

```http
GET /api/customer?id={customer_id}
```

**Resposta:**
```json
{
  "id": "uuid",
  "firstName": "João",
  "lastName": "Silva",
  "nickname": "Joãozinho",
  "isActive": true,
  "phoneNumbers": [...],
  "reports": [...],
  "chats": [...]
}
```

### Criar clientes

```http
POST /api/customer
```

**Body:**
```json
{
  "customers": [
    {
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "Joãozinho",
      "phoneNumbers": ["+5511999999999", "+5511888888888"]
    }
  ]
}
```

**Resposta:**
```json
{
  "message": "1 cliente(s) criado(s)",
  "data": [...]
}
```

### Atualizar cliente

```http
PUT /api/customer?id={customer_id}
```

**Body:**
```json
{
  "firstName": "João Atualizado",
  "lastName": "Silva",
  "nickname": "João",
  "isActive": true
}
```

### Remover cliente

```http
DELETE /api/customer?id={customer_id}
```

Realiza soft delete (marca como inativo).

---

## 📱 Phone Numbers (Números de Telefone)

### Listar todos os números

```http
GET /api/phone_number?page=1&limit=20
```

### Buscar número específico

```http
GET /api/phone_number?id={phone_number_id}
```

### Criar números

```http
POST /api/phone_number
```

**Body:**
```json
{
  "phoneNumbers": [
    {
      "customerId": "uuid",
      "phoneNumber": "+5511999999999"
    }
  ]
}
```

### Atualizar número

```http
PUT /api/phone_number?id={phone_number_id}
```

**Body:**
```json
{
  "phoneNumber": "+5511888888888",
  "isActive": true
}
```

### Remover número

```http
DELETE /api/phone_number?id={phone_number_id}
```

---

## 📄 Reports (Relatórios)

### Listar todos os relatórios

```http
GET /api/report?page=1&limit=20&customerId={customer_id}
```

**Query Parameters:**
- `customerId` (opcional): Filtra por cliente específico

### Buscar relatório específico

```http
GET /api/report?id={report_id}
```

Retorna o relatório com URL assinada para download.

### Criar relatórios

```http
POST /api/report
```

**Body:**
```json
{
  "reports": [
    {
      "customerId": "uuid",
      "reportTimestamp": "2024-01-01T00:00:00.000Z",
      "observations": "Relatório mensal de Janeiro",
      "file": "base64_encoded_pdf_or_buffer",
      "fileName": "relatorio_janeiro.pdf"
    }
  ]
}
```

O arquivo pode ser enviado como:
- String base64 (com ou sem prefixo `data:application/pdf;base64,`)
- Buffer direto

### Atualizar relatório

```http
PUT /api/report?id={report_id}
```

**Body:**
```json
{
  "reportTimestamp": "2024-01-15T00:00:00.000Z",
  "observations": "Relatório atualizado",
  "isActive": true
}
```

### Remover relatório

```http
DELETE /api/report?id={report_id}&deleteFromS3=true
```

**Query Parameters:**
- `deleteFromS3` (opcional): Se `true`, remove também do S3

---

## 💬 Messages (Mensagens)

### Listar mensagens de um chat

```http
GET /api/message?chat_id={chat_id}&page=1&limit=20
```

### Buscar mensagem específica

```http
GET /api/message?id={message_id}
```

### Webhook Twilio (receber mensagens)

```http
POST /api/message
```

**Body (enviado pelo Twilio):**
```json
{
  "From": "whatsapp:+5511999999999",
  "Body": "Olá, gostaria de ver meus relatórios",
  "MessageSid": "SMxxxxx..."
}
```

Este endpoint é chamado automaticamente pelo Twilio quando uma mensagem é recebida.

### Remover mensagem

```http
DELETE /api/message?id={message_id}
```

---

## 💭 Chats

### Listar todos os chats

```http
GET /api/chat?page=1&limit=20&isOpen=true&customerId={customer_id}
```

**Query Parameters:**
- `isOpen` (opcional): Filtra por chats abertos/fechados (`true`/`false`)
- `customerId` (opcional): Filtra por cliente

### Buscar chat específico

```http
GET /api/chat/{chat_id}
```

### Fechar chat

```http
POST /api/chat/close-chat
```

**Body:**
```json
{
  "chatId": "uuid"
}
```

### Enviar template e iniciar chat

```http
POST /api/chat/send-template
```

**Body:**
```json
{
  "customerId": "uuid",
  "phoneNumberId": "uuid",
  "templateId": "template_sid_from_twilio",
  "variables": {
    "name": "João",
    "month": "Janeiro"
  }
}
```

---

## 🗄 Banco de Dados

### Modelo de Dados

```
Customer (Cliente)
├── id: UUID
├── firstName: String
├── lastName: String
├── nickname: String (opcional)
├── isActive: Boolean
├── createdAt: DateTime
├── updatedAt: DateTime
├── phoneNumbers: PhoneNumber[]
├── reports: Report[]
└── chats: Chat[]

PhoneNumber (Número de Telefone)
├── id: UUID
├── customerId: UUID → Customer
├── phoneNumber: String
├── isActive: Boolean
├── createdAt: DateTime
├── updatedAt: DateTime
└── chats: Chat[]

Report (Relatório)
├── id: UUID
├── customerId: UUID → Customer
├── reportUrl: String (URL no S3)
├── reportTimestamp: DateTime
├── observations: String (opcional)
├── isActive: Boolean
├── createdAt: DateTime
└── updatedAt: DateTime

Chat
├── id: UUID
├── customerId: UUID → Customer
├── phoneNumberId: UUID → PhoneNumber
├── isOpen: Boolean
├── createdAt: DateTime
├── updatedAt: DateTime
└── messages: ChatMessage[]

ChatMessage (Mensagem)
├── id: UUID
├── chatId: UUID → Chat
├── message: String
├── type: Enum (user, agent, wa_template)
├── createdAt: DateTime
└── updatedAt: DateTime
```

### Comandos Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npx prisma migrate deploy

# Abrir Prisma Studio (interface visual)
npx prisma studio
```

## 📋 Regras de Negócio

### Chats

1. **Um chat fechado não pode receber mensagens**
   - Validação no `chatService.addMessage()`
   - Retorna erro se tentar adicionar mensagem em chat fechado

2. **Um usuário só pode ter um chat aberto por número de telefone**
   - Validação no `chatService.createChat()`
   - Verifica existência antes de criar novo

3. **Chats inativos são fechados automaticamente**
   - Cron job executa a cada 5 minutos
   - Fecha chats sem atualização há mais de 15 minutos (configurável)

### Clientes e Números

1. **Números devem seguir formato internacional**
   - Validação: `+[código_país][número]`
   - Ex: `+5511999999999`

2. **Soft delete para clientes e números**
   - Não remove do banco, apenas marca `isActive = false`
   - Mantém histórico e integridade referencial

### Relatórios

1. **PDFs armazenados no S3 com estrutura organizada**
   - Path: `reports/{customerId}/{uuid}.pdf`
   - URLs assinadas com expiração de 1 hora

2. **Soft delete opcional no S3**
   - Por padrão, apenas marca como inativo no BD
   - Parâmetro `deleteFromS3=true` remove também do S3

## 🤖 Integração com IA (Anthropic Claude)

### Visão Geral

O Nexus utiliza a API da Anthropic (Claude AI) para gerar respostas automáticas e inteligentes às mensagens dos clientes no WhatsApp. A IA tem acesso ao contexto completo do cliente, incluindo seus relatórios de marketing e histórico de conversas.

### Funcionalidades

**Respostas Automáticas Contextualizadas**
- Responde automaticamente quando cliente envia mensagem no WhatsApp
- Acessa histórico de relatórios do cliente (últimos 5)
- Considera histórico da conversa (últimas 10 mensagens)
- Mantém contexto sobre métricas, resultados e campanhas do cliente

**Processamento Assíncrono**
- Webhook do Twilio responde imediatamente (não bloqueia)
- IA processa mensagem em background
- Resposta é gerada e enviada automaticamente via WhatsApp

**Fallback Inteligente**
- Se IA não estiver configurada ou falhar, envia mensagem padrão
- Sistema continua funcionando mesmo sem API key da Anthropic

### Configuração

Configure no arquivo `.env`:

```bash
# Anthropic API Configuration
ANTHROPIC_API_KEY=sua-chave-aqui
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024
```

**Modelos disponíveis:**
- `claude-3-5-sonnet-20241022` (Recomendado) - Equilíbrio entre performance e custo
- `claude-3-opus-20240229` - Máxima qualidade, maior custo
- `claude-3-sonnet-20240229` - Boa performance, custo moderado
- `claude-3-haiku-20240307` - Mais rápido e econômico

### Fluxo de Funcionamento

1. **Cliente envia mensagem** → Webhook Twilio recebe
2. **Mensagem salva no BD** → Registrada na tabela `ChatMessage`
3. **IA processa em background**:
   - Busca relatórios recentes do cliente
   - Busca histórico do chat
   - Monta contexto completo
   - Gera resposta via Claude AI
4. **Resposta automática** → Enviada via Twilio WhatsApp
5. **Resposta salva no BD** → Registrada como mensagem do assistente

### Contexto Fornecido à IA

A IA recebe automaticamente:

```javascript
{
  customer: {
    name: "Nome do Cliente",
    companyName: "Empresa LTDA",
    reports: [
      {
        period: "2024-01",
        metrics: { ... },
        analysis: "..."
      }
    ]
  },
  chatHistory: [
    { role: "user", content: "Mensagem anterior" },
    { role: "assistant", content: "Resposta anterior" }
  ]
}
```

### Personalização

**System Prompt** (em `aiService.js`):
```javascript
const systemPrompt = `Você é o Nexus, assistente de IA da WN7...`;
```

Pode ser customizado para:
- Alterar personalidade do agente
- Adicionar regras específicas de resposta
- Definir formato das respostas
- Adicionar conhecimento sobre produtos/serviços

### Custo e Limites

**Estimativas (claude-3-5-sonnet):**
- Input: ~$3 por 1M tokens
- Output: ~$15 por 1M tokens
- Mensagem típica: ~1000-2000 tokens (contexto + resposta)
- **Custo por mensagem: ~$0.03 - $0.05**

**Otimizações:**
- Limita histórico a 10 mensagens recentes
- Usa apenas últimos 5 relatórios
- Define max_tokens para controlar tamanho das respostas

### Segurança

- ✅ API key armazenada em variável de ambiente
- ✅ Nunca exposta em logs ou respostas
- ✅ Validação de configuração antes de usar
- ✅ Tratamento de erros para evitar vazamento de informações
- ✅ Rate limiting do Express protege contra abuso

### Documentação Completa

Para documentação detalhada, consulte: **[AI_INTEGRATION.md](./docs/AI_INTEGRATION.md)**

Incluindo:
- Exemplos de conversas
- Personalização avançada
- Troubleshooting
- Melhores práticas
- Recursos futuros

## 📲 Integração Twilio

### Configuração do Webhook

1. Acesse o console Twilio
2. Vá em Messaging > Settings > WhatsApp Sandbox (ou seu número)
3. Configure o webhook:
   - **URL**: `https://seu-dominio.com/api/message`
   - **Método**: POST
   - **Content Type**: application/x-www-form-urlencoded

### Envio de Mensagens

O serviço `twilioService` oferece três métodos:

```javascript
// Mensagem simples
await twilioService.sendMessage('+5511999999999', 'Olá!');

// Template aprovado
await twilioService.sendTemplate('+5511999999999', 'template_sid', { var1: 'valor' });

// Mensagem com mídia (PDF)
await twilioService.sendMediaMessage('+5511999999999', 'Seu relatório', 'https://url-do-pdf');
```

### Tipos de Mensagem

- `user`: Mensagem enviada pelo usuário via WhatsApp
- `agent`: Mensagem enviada pelo agente de IA
- `wa_template`: Template aprovado do WhatsApp

## ☁️ Integração AWS S3

### Configuração do Bucket

1. Crie um bucket na AWS S3
2. Configure permissões:
   - Leitura/escrita para a aplicação
   - Opcional: Public read para relatórios

3. Configure CORS se necessário:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Operações Disponíveis

```javascript
// Upload de relatório
const result = await s3Service.uploadReport(buffer, customerId, fileName);
// Retorna: { success, url, key }

// Gerar URL assinada (1 hora de validade)
const url = await s3Service.getSignedDownloadUrl(key, 3600);

// Deletar relatório
await s3Service.deleteReport(key);

// Extrair chave de URL
const key = s3Service.extractKeyFromUrl(url);
```

## 🔄 Cron Jobs

### Job: Fechar Chats Inativos

- **Frequência**: A cada 5 minutos
- **Função**: Fecha chats abertos há mais de 15 minutos
- **Configurável**: Via `CHAT_TIMEOUT_MINUTES`

```javascript
// Executado automaticamente ao iniciar o servidor
// src/jobs/cronJobs.js
```

Para adicionar novos jobs, edite `src/jobs/cronJobs.js`:

```javascript
cron.schedule('0 9 * * 1', async () => {
  // Executa toda segunda às 9h
  // Seu código aqui
});
```

## 🔒 Segurança

### Implementado

- ✅ Helmet.js - Headers de segurança
- ✅ CORS configurado
- ✅ Rate limiting (100 req/15min por IP)
- ✅ Validação de entrada
- ✅ Soft delete (preserva dados)
- ✅ Logs estruturados

### Recomendações Adicionais

- 🔐 Implementar autenticação JWT
- 🔐 Usar HTTPS em produção
- 🔐 Validar webhook Twilio com signature
- 🔐 Criptografar dados sensíveis
- 🔐 Implementar rate limiting por usuário

## 📝 Logs

Logs são salvos em `logs/`:
- `error.log` - Apenas erros
- `combined.log` - Todos os logs

Em desenvolvimento, logs também aparecem no console.

Formato:
```json
{
  "level": "info",
  "message": "Mensagem do log",
  "service": "nexus-api",
  "timestamp": "2024-01-01 12:00:00"
}
```

## 🧪 Testando a API

### Com cURL

```bash
# Criar cliente
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "firstName": "João",
      "lastName": "Silva",
      "phoneNumbers": ["+5511999999999"]
    }]
  }'

# Listar clientes
curl http://localhost:3000/api/customer

# Buscar cliente específico
curl "http://localhost:3000/api/customer?id=uuid-do-cliente"
```

### Com Postman/Insomnia

Importe as rotas usando a documentação acima como referência.

## 🐛 Troubleshooting

### Erro de conexão com banco

```bash
# Verifique se o PostgreSQL está rodando
docker-compose ps

# Verifique logs
docker-compose logs postgres

# Recrie o container
docker-compose down
docker-compose up -d
```

### Erro no Prisma

```bash
# Regenere o cliente
npx prisma generate

# Execute migrations novamente
npx prisma migrate dev
```

### Erro de permissão S3

- Verifique se as credenciais AWS estão corretas
- Verifique se o bucket existe
- Verifique permissões IAM

### Erro no Twilio

- Verifique credenciais (SID e Token)
- Verifique webhook configurado corretamente
- Verifique formato do número de telefone

### Erro na IA (Anthropic)

```bash
# Verifique se a API key está configurada
echo $ANTHROPIC_API_KEY

# Teste a conexão com Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**Problemas comuns:**
- ❌ **API key inválida**: Verifique no console Anthropic (console.anthropic.com)
- ❌ **Rate limit excedido**: Aguarde alguns segundos entre requisições
- ❌ **Modelo não existe**: Verifique nome do modelo no `.env`
- ⚠️ **Resposta lenta**: Normal, Claude pode levar 2-5 segundos
- ⚠️ **Custo alto**: Reduza `ANTHROPIC_MAX_TOKENS` ou limite histórico

**Logs úteis:**
```bash
# Veja logs da aplicação
docker-compose logs -f api

# Procure por erros da IA
grep "AI Service" logs/app.log
grep "Anthropic" logs/error.log
```

## 🚀 Recursos Futuros

Possíveis melhorias e funcionalidades planejadas:

### IA e Inteligência

- 💾 **Cache de contexto**: Reduzir custos com Anthropic usando cache para relatórios
- 😊 **Análise de sentimento**: Detectar insatisfação e alertar equipe
- 📄 **Extração de dados de PDFs**: IA extrair automaticamente métricas dos relatórios
- 🎓 **Fine-tuning**: Treinar modelo customizado com conversas da WN7

### Experiência do Usuário

- 🌍 **Multi-idioma**: Suporte para respostas em diferentes idiomas
- 📊 **Dashboard de analytics**: Métricas de conversas e satisfação
- 📱 **Notificações proativas**: Alertas sobre métricas importantes

### Integrações

- 🔗 **Integração com CRM**: Sincronizar dados de clientes
- 📈 **Google Analytics**: Conectar métricas do GA com relatórios
- 📧 **Email marketing**: Notificações via email além do WhatsApp

## �📞 Suporte

Para questões e suporte:
- Email: suporte@wn7.com
- Documentação Twilio: https://www.twilio.com/docs
- Documentação AWS S3: https://docs.aws.amazon.com/s3
- Documentação Anthropic: https://docs.anthropic.com
- Documentação Prisma: https://www.prisma.io/docs

## 📄 Licença

MIT License - Desenvolvido para WN7 Agência de Marketing Digital

---

**Desenvolvido por Marcos** - 2024
