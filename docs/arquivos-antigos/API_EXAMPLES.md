# Exemplos de Requisições - Nexus API

Este arquivo contém exemplos práticos de todas as requisições da API.

## 🔍 Variáveis

Para facilitar, defina estas variáveis:

```bash
export API_URL="http://localhost:3000/api"
export CUSTOMER_ID="seu-customer-id-aqui"
export PHONE_NUMBER_ID="seu-phone-number-id-aqui"
export REPORT_ID="seu-report-id-aqui"
export CHAT_ID="seu-chat-id-aqui"
```

---

## 👥 CUSTOMERS

### Criar clientes

```bash
curl -X POST $API_URL/customer \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Listar clientes (paginado)

```bash
curl "$API_URL/customer?page=1&limit=20"
```

### Buscar cliente específico

```bash
curl "$API_URL/customer?id=$CUSTOMER_ID"
```

### Atualizar cliente

```bash
curl -X PUT "$API_URL/customer?id=$CUSTOMER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João Atualizado",
    "nickname": "João"
  }'
```

### Desativar cliente

```bash
curl -X DELETE "$API_URL/customer?id=$CUSTOMER_ID"
```

---

## 📱 PHONE NUMBERS

### Criar números

```bash
curl -X POST $API_URL/phone_number \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": [
      {
        "customerId": "'$CUSTOMER_ID'",
        "phoneNumber": "+5511955555555"
      }
    ]
  }'
```

### Listar números

```bash
curl "$API_URL/phone_number?page=1&limit=20"
```

### Buscar número específico

```bash
curl "$API_URL/phone_number?id=$PHONE_NUMBER_ID"
```

### Atualizar número

```bash
curl -X PUT "$API_URL/phone_number?id=$PHONE_NUMBER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+5511944444444"
  }'
```

### Desativar número

```bash
curl -X DELETE "$API_URL/phone_number?id=$PHONE_NUMBER_ID"
```

---

## 📄 REPORTS

### Criar relatório (com PDF em base64)

```bash
# Primeiro, converta um PDF para base64
BASE64_PDF=$(base64 -i relatorio.pdf)

curl -X POST $API_URL/report \
  -H "Content-Type: application/json" \
  -d '{
    "reports": [
      {
        "customerId": "'$CUSTOMER_ID'",
        "reportTimestamp": "2024-01-15T10:00:00.000Z",
        "observations": "Relatório de Janeiro 2024",
        "file": "'$BASE64_PDF'",
        "fileName": "relatorio_janeiro.pdf"
      }
    ]
  }'
```

### Criar relatório (exemplo simplificado para teste)

```bash
curl -X POST $API_URL/report \
  -H "Content-Type: application/json" \
  -d '{
    "reports": [
      {
        "customerId": "'$CUSTOMER_ID'",
        "reportTimestamp": "2024-01-15T10:00:00.000Z",
        "observations": "Teste de relatório",
        "file": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvVGltZXMtUm9tYW4+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggNDQ+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKFRlc3RlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzMzIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDI1CiUlRU9G",
        "fileName": "teste.pdf"
      }
    ]
  }'
```

### Listar relatórios

```bash
# Todos
curl "$API_URL/report?page=1&limit=20"

# Por cliente
curl "$API_URL/report?customerId=$CUSTOMER_ID&page=1&limit=10"
```

### Buscar relatório (com URL assinada para download)

```bash
curl "$API_URL/report?id=$REPORT_ID"
```

### Atualizar relatório

```bash
curl -X PUT "$API_URL/report?id=$REPORT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "observations": "Relatório atualizado com novas informações"
  }'
```

### Deletar relatório (soft delete)

```bash
curl -X DELETE "$API_URL/report?id=$REPORT_ID"
```

### Deletar relatório (incluindo do S3)

```bash
curl -X DELETE "$API_URL/report?id=$REPORT_ID&deleteFromS3=true"
```

---

## 💭 CHATS

### Listar chats

```bash
# Todos
curl "$API_URL/chat?page=1&limit=20"

# Apenas abertos
curl "$API_URL/chat?isOpen=true"

# Por cliente
curl "$API_URL/chat?customerId=$CUSTOMER_ID"
```

### Buscar chat específico

```bash
curl "$API_URL/chat/$CHAT_ID"
```

### Enviar template e iniciar chat

```bash
curl -X POST $API_URL/chat/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "'$CUSTOMER_ID'",
    "phoneNumberId": "'$PHONE_NUMBER_ID'",
    "templateId": "HX1234567890abcdef",
    "variables": {
      "name": "João",
      "month": "Janeiro"
    }
  }'
```

### Fechar chat

```bash
curl -X POST $API_URL/chat/close-chat \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "'$CHAT_ID'"
  }'
```

---

## 💬 MESSAGES

### Listar mensagens de um chat

```bash
curl "$API_URL/message?chat_id=$CHAT_ID&page=1&limit=50"
```

### Buscar mensagem específica

```bash
curl "$API_URL/message?id=MESSAGE_ID"
```

### Simular webhook Twilio (mensagem recebida)

```bash
curl -X POST $API_URL/message \
  -H "Content-Type: application/json" \
  -d '{
    "From": "whatsapp:+5511999999999",
    "Body": "Olá! Gostaria de ver meus relatórios",
    "MessageSid": "SM1234567890abcdef"
  }'
```

### Deletar mensagem

```bash
curl -X DELETE "$API_URL/message?id=MESSAGE_ID"
```

---

## 🔄 FLUXO COMPLETO DE TESTE

Execute este fluxo para testar toda a aplicação:

```bash
#!/bin/bash

# 1. Criar cliente
echo "1. Criando cliente..."
RESPONSE=$(curl -s -X POST $API_URL/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "firstName": "Teste",
      "lastName": "Completo",
      "phoneNumbers": ["+5511999887766"]
    }]
  }')

CUSTOMER_ID=$(echo $RESPONSE | jq -r '.data[0].id')
PHONE_NUMBER_ID=$(echo $RESPONSE | jq -r '.data[0].phoneNumbers[0].id')

echo "Cliente ID: $CUSTOMER_ID"
echo "Phone ID: $PHONE_NUMBER_ID"

# 2. Criar relatório
echo "2. Criando relatório..."
REPORT_RESPONSE=$(curl -s -X POST $API_URL/report \
  -H "Content-Type: application/json" \
  -d '{
    "reports": [{
      "customerId": "'$CUSTOMER_ID'",
      "reportTimestamp": "2024-01-15T10:00:00.000Z",
      "observations": "Relatório de teste",
      "file": "JVBERi0xLjQKJeLjz9MK...",
      "fileName": "teste.pdf"
    }]
  }')

echo "Relatório criado!"

# 3. Listar clientes
echo "3. Listando clientes..."
curl -s "$API_URL/customer" | jq '.data[] | {id, firstName, lastName}'

# 4. Ver relatórios do cliente
echo "4. Relatórios do cliente..."
curl -s "$API_URL/report?customerId=$CUSTOMER_ID" | jq '.data[] | {id, observations}'

echo "Teste completo!"
```

---

## 🔧 Utilitários

### Converter PDF para Base64

```bash
# Linux/Mac
base64 -i arquivo.pdf -o arquivo.txt

# Ou em uma linha
base64 -i arquivo.pdf | tr -d '\n' > arquivo.txt
```

### Testar com arquivo real

```bash
# Cria variável com PDF em base64
PDF_BASE64=$(base64 -i relatorio.pdf | tr -d '\n')

# Usa na requisição
curl -X POST $API_URL/report \
  -H "Content-Type: application/json" \
  -d '{
    "reports": [{
      "customerId": "'$CUSTOMER_ID'",
      "reportTimestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "file": "'$PDF_BASE64'",
      "fileName": "relatorio.pdf"
    }]
  }'
```

### Formatar respostas JSON

```bash
# Adicione | jq no final das requisições
curl "$API_URL/customer" | jq '.'

# Extrair campos específicos
curl "$API_URL/customer" | jq '.data[] | {id, firstName, lastName}'

# Contar resultados
curl "$API_URL/customer" | jq '.data | length'
```

---

## 🧪 Testes com Postman

### Importar coleção

Crie uma coleção no Postman com estas variáveis de ambiente:

```json
{
  "api_url": "http://localhost:3000/api",
  "customer_id": "",
  "phone_number_id": "",
  "report_id": "",
  "chat_id": ""
}
```

Use `{{api_url}}`, `{{customer_id}}`, etc. nas requisições.

### Scripts úteis

**Tests tab - Salvar IDs automaticamente:**

```javascript
// Para POST /customer
const response = pm.response.json();
if (response.data && response.data[0]) {
    pm.environment.set("customer_id", response.data[0].id);
    pm.environment.set("phone_number_id", response.data[0].phoneNumbers[0].id);
}
```

---

Boa sorte com seus testes! 🚀
