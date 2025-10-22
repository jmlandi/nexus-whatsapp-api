# Documentação da API

Base URL: `http://localhost:3000/api`

## 📑 Índice

- [Health Check](#health-check)
- [Customers](#customers)
- [Phone Numbers](#phone-numbers)
- [Reports](#reports)
- [Messages](#messages)
- [Chats](#chats)

---

## Health Check

### GET /health

Verifica se a API está funcionando.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-21T10:30:00.000Z",
  "uptime": 12345
}
```

---

## Customers

### POST /api/customer

Cria um ou mais clientes.

**Body:**
```json
{
  "customers": [
    {
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "Joãozinho",
      "phoneNumbers": ["+5511999999999", "+5511888888888"]
    },
    {
      "firstName": "Maria",
      "lastName": "Santos",
      "phoneNumbers": ["+5511777777777"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 customers created successfully",
  "data": [
    {
      "id": "uuid-123",
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "Joãozinho",
      "isActive": true,
      "createdAt": "2024-10-21T10:00:00.000Z",
      "phoneNumbers": [
        {
          "id": "uuid-456",
          "phoneNumber": "+5511999999999",
          "isActive": true
        }
      ]
    }
  ]
}
```

### GET /api/customer

Lista clientes com paginação ou busca específica.

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20, máx: 100)
- `id` (opcional): ID específico do cliente

**Exemplos:**

```bash
# Listar todos (paginado)
curl "http://localhost:3000/api/customer?page=1&limit=20"

# Buscar cliente específico
curl "http://localhost:3000/api/customer?id=uuid-123"
```

**Response (Lista):**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "uuid-123",
        "firstName": "João",
        "lastName": "Silva",
        "nickname": "Joãozinho",
        "isActive": true,
        "phoneNumbers": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### PUT /api/customer?id={id}

Atualiza um cliente.

**Query Parameters:**
- `id` (obrigatório): ID do cliente

**Body:**
```json
{
  "firstName": "João Atualizado",
  "nickname": "João"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": "uuid-123",
    "firstName": "João Atualizado",
    "lastName": "Silva",
    "nickname": "João",
    "isActive": true
  }
}
```

### DELETE /api/customer?id={id}

Desativa um cliente (soft delete).

**Query Parameters:**
- `id` (obrigatório): ID do cliente

**Response:**
```json
{
  "success": true,
  "message": "Customer deactivated successfully"
}
```

---

## Phone Numbers

### POST /api/phone_number

Adiciona números de telefone a clientes existentes.

**Body:**
```json
{
  "phoneNumbers": [
    {
      "customerId": "uuid-123",
      "phoneNumber": "+5511955555555"
    },
    {
      "customerId": "uuid-456",
      "phoneNumber": "+5511944444444"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 phone numbers created successfully",
  "data": [
    {
      "id": "uuid-789",
      "customerId": "uuid-123",
      "phoneNumber": "+5511955555555",
      "isActive": true,
      "createdAt": "2024-10-21T10:00:00.000Z"
    }
  ]
}
```

### GET /api/phone_number

Lista números de telefone.

**Query Parameters:**
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página
- `id` (opcional): ID específico do número
- `phoneNumber` (opcional): Busca por número específico

**Exemplos:**

```bash
# Listar todos
curl "http://localhost:3000/api/phone_number"

# Buscar por número
curl "http://localhost:3000/api/phone_number?phoneNumber=%2B5511999999999"
```

### PUT /api/phone_number?id={id}

Atualiza um número de telefone.

**Body:**
```json
{
  "phoneNumber": "+5511966666666"
}
```

### DELETE /api/phone_number?id={id}

Desativa um número de telefone.

---

## Reports

### POST /api/report

Faz upload de um relatório PDF para o S3.

**Headers:**
- `Content-Type: multipart/form-data`

**Form Data:**
- `customerId`: ID do cliente (string)
- `reportTimestamp`: Data do relatório (ISO 8601)
- `observations`: Observações (opcional)
- `file`: Arquivo PDF

**Exemplo (curl):**
```bash
curl -X POST http://localhost:3000/api/report \
  -F "customerId=uuid-123" \
  -F "reportTimestamp=2024-10-01T00:00:00.000Z" \
  -F "observations=Relatório mensal de outubro" \
  -F "file=@/path/to/report.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Report uploaded successfully",
  "data": {
    "id": "uuid-report-123",
    "customerId": "uuid-123",
    "reportUrl": "https://s3.amazonaws.com/nexus-reports/...",
    "reportTimestamp": "2024-10-01T00:00:00.000Z",
    "observations": "Relatório mensal de outubro",
    "isActive": true,
    "createdAt": "2024-10-21T10:00:00.000Z"
  }
}
```

### GET /api/report

Lista relatórios de um cliente.

**Query Parameters:**
- `customerId` (obrigatório): ID do cliente
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página

**Exemplo:**
```bash
curl "http://localhost:3000/api/report?customerId=uuid-123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid-report-123",
        "customerId": "uuid-123",
        "reportUrl": "https://s3.amazonaws.com/...",
        "reportTimestamp": "2024-10-01T00:00:00.000Z",
        "observations": "Relatório mensal",
        "isActive": true,
        "createdAt": "2024-10-21T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### GET /api/report/presigned-url?reportId={id}

Gera URL presignada para download do relatório (válida por 1 hora).

**Query Parameters:**
- `reportId` (obrigatório): ID do relatório

**Response:**
```json
{
  "success": true,
  "data": {
    "presignedUrl": "https://s3.amazonaws.com/nexus-reports/...?signature=...",
    "expiresIn": 3600
  }
}
```

### DELETE /api/report?id={id}

Desativa um relatório.

---

## Messages

### POST /api/message (Webhook Twilio)

Recebe mensagens do webhook do Twilio. Este endpoint é chamado automaticamente quando uma mensagem chega via WhatsApp.

**Body (enviado pelo Twilio):**
```
From=whatsapp:+5511999999999
To=whatsapp:+14155238886
Body=Olá, gostaria de saber sobre meu relatório
```

**Response:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>
```

**Processamento Interno:**
1. Identifica o cliente pelo número de telefone
2. Cria ou localiza chat ativo
3. Salva mensagem no banco de dados
4. Processa resposta com IA (assíncrono)
5. Envia resposta via Twilio

### POST /api/message/send

Envia mensagem manual via WhatsApp.

**Body:**
```json
{
  "to": "+5511999999999",
  "message": "Olá! Seu relatório está disponível."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageSid": "SM1234567890abcdef",
    "status": "queued",
    "to": "+5511999999999"
  }
}
```

### POST /api/message/template

Envia template aprovado do WhatsApp.

**Body:**
```json
{
  "phoneNumbers": ["+5511999999999", "+5511888888888"],
  "templateName": "report_available",
  "variables": ["João", "Outubro"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template messages sent successfully",
  "data": {
    "sent": 2,
    "failed": 0,
    "results": [
      {
        "to": "+5511999999999",
        "status": "queued",
        "messageSid": "SM123..."
      }
    ]
  }
}
```

---

## Chats

### GET /api/chat

Lista chats de um cliente.

**Query Parameters:**
- `customerId` (obrigatório): ID do cliente
- `isOpen` (opcional): `true` ou `false` para filtrar chats abertos/fechados

**Exemplo:**
```bash
# Todos os chats do cliente
curl "http://localhost:3000/api/chat?customerId=uuid-123"

# Apenas chats abertos
curl "http://localhost:3000/api/chat?customerId=uuid-123&isOpen=true"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-chat-123",
      "customerId": "uuid-123",
      "phoneNumberId": "uuid-phone-456",
      "isOpen": true,
      "createdAt": "2024-10-21T10:00:00.000Z",
      "updatedAt": "2024-10-21T12:30:00.000Z",
      "messages": [
        {
          "id": "uuid-msg-789",
          "message": "Olá, gostaria de saber sobre meu relatório",
          "type": "user",
          "createdAt": "2024-10-21T10:00:00.000Z"
        },
        {
          "id": "uuid-msg-790",
          "message": "Olá! Posso te ajudar com isso...",
          "type": "agent",
          "createdAt": "2024-10-21T10:00:15.000Z"
        }
      ]
    }
  ]
}
```

### GET /api/chat/:id

Busca chat específico com todas as mensagens.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-chat-123",
    "customerId": "uuid-123",
    "phoneNumberId": "uuid-phone-456",
    "isOpen": true,
    "messages": [...]
  }
}
```

### PUT /api/chat/:id/close

Fecha um chat manualmente.

**Response:**
```json
{
  "success": true,
  "message": "Chat closed successfully",
  "data": {
    "id": "uuid-chat-123",
    "isOpen": false
  }
}
```

---

## 🔐 Códigos de Resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Erro de validação ou requisição inválida |
| 404 | Recurso não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

## 📝 Estrutura de Resposta Padrão

### Sucesso
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error detail"
    }
  ]
}
```

## 🚀 Exemplos de Fluxo Completo

### 1. Criar Cliente e Enviar Relatório

```bash
# 1. Criar cliente
CUSTOMER_ID=$(curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "Joãozinho",
      "phoneNumbers": ["+5511999999999"]
    }]
  }' | jq -r '.data[0].id')

echo "Customer ID: $CUSTOMER_ID"

# 2. Upload de relatório
curl -X POST http://localhost:3000/api/report \
  -F "customerId=$CUSTOMER_ID" \
  -F "reportTimestamp=2024-10-01T00:00:00.000Z" \
  -F "observations=Relatório de outubro" \
  -F "file=@./report.pdf"

# 3. Enviar mensagem
curl -X POST http://localhost:3000/api/message/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5511999999999",
    "message": "Olá João! Seu relatório de outubro está disponível."
  }'
```

### 2. Consultar Histórico de Conversas

```bash
# Listar chats do cliente
curl "http://localhost:3000/api/chat?customerId=$CUSTOMER_ID"

# Ver detalhes de um chat específico
CHAT_ID="uuid-chat-123"
curl "http://localhost:3000/api/chat/$CHAT_ID"
```

## 🔄 Rate Limiting

A API possui rate limiting configurado:

- **Limite**: 100 requisições por 15 minutos por IP
- **Header de resposta**: `X-RateLimit-Remaining`

Quando exceder o limite, receberá:

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```
