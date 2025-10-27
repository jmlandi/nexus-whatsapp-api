# 🚀 Guia Rápido - Migração WhatsApp Business API

## ⚡ Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do WhatsApp Business:

```bash
# WhatsApp Business API (Meta)
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=escolha_um_token_secreto
```

### 3. Como Obter as Credenciais

1. Acesse: https://developers.facebook.com/
2. Crie/selecione um App
3. Adicione o produto "WhatsApp"
4. Em "WhatsApp > API Setup":
   - Copie o **Phone Number ID**
   - Gere um **Access Token** (permanente)
5. Em "WhatsApp > Getting Started":
   - Copie o **WhatsApp Business Account ID**

### 4. Configurar Database

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 5. Iniciar Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

---

## 📡 Configurar Webhook

### Passo 1: Expor servidor localmente (desenvolvimento)

Use ngrok ou similar:
```bash
ngrok http 3000
```

Copie a URL HTTPS gerada (ex: `https://abc123.ngrok.io`)

### Passo 2: Configurar no Meta

1. Vá em "WhatsApp > Configuration" no Meta for Developers
2. Clique em "Edit" no Callback URL
3. Cole: `https://sua-url.ngrok.io/api/message`
4. Verify Token: use o valor de `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
5. Clique em "Verify and Save"
6. Inscreva-se em: `messages`

---

## 🎯 Testar a API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Criar Template

```bash
curl -X POST http://localhost:3000/api/template/create-report-template \
  -H "Content-Type: application/json" \
  -d '{
    "name": "wn7_relatorio_mensal"
  }'
```

### 3. Listar Templates

```bash
curl http://localhost:3000/api/template
```

### 4. Criar Cliente

```bash
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "João"
    }]
  }'
```

### 5. Adicionar Número de Telefone

```bash
# Salve o ID do cliente da resposta anterior
curl -X POST http://localhost:3000/api/phone_number \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": [{
      "customerId": "uuid-do-cliente",
      "phoneNumber": "5511999999999"
    }]
  }'
```

### 6. Enviar Template (Iniciar Chat)

```bash
curl -X POST http://localhost:3000/api/chat/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid-do-cliente",
    "phoneNumberId": "uuid-do-numero",
    "templateName": "wn7_relatorio_mensal",
    "languageCode": "pt_BR",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "João" },
          { "type": "text", "text": "Janeiro 2024" }
        ]
      }
    ]
  }'
```

---

## 📱 Testar Conversa

1. **Envie uma mensagem** do WhatsApp para o número configurado
2. **Verifique os logs** do servidor
3. **A IA deve responder** automaticamente
4. **Visualize o chat** em: `GET /api/chat`

---

## 🛠️ Comandos Úteis

```bash
# Ver logs em tempo real
npm run dev

# Abrir Prisma Studio (ver banco de dados)
npm run prisma:studio

# Gerar nova migration
npm run prisma:migrate

# Ver estrutura do projeto
tree src/
```

---

## 📂 Estrutura Principal

```
src/
├── services/
│   ├── whatsappService.js   # ✅ NOVO - API do WhatsApp
│   ├── aiService.js
│   ├── chatService.js
│   └── s3Service.js
├── controllers/
│   ├── templateController.js # ✅ NOVO - Gerencia templates
│   ├── chatController.js
│   ├── messageController.js
│   └── ...
└── routes/
    ├── templateRoutes.js     # ✅ NOVO - Rotas de templates
    └── ...
```

---

## 🔗 Endpoints da API

### Templates
- `POST /api/template` - Criar template
- `GET /api/template` - Listar templates
- `DELETE /api/template/:name` - Deletar template
- `POST /api/template/create-report-template` - Template padrão

### Chats
- `POST /api/chat/send-template` - Iniciar chat com template
- `GET /api/chat` - Listar chats
- `GET /api/chat/:id` - Ver chat específico
- `POST /api/chat/close-chat` - Fechar chat

### Mensagens (Webhook)
- `GET /api/message` - Verificação do webhook
- `POST /api/message` - Receber mensagens do WhatsApp

### Clientes
- `POST /api/customer` - Criar clientes
- `GET /api/customer` - Listar clientes
- `PUT /api/customer?id=uuid` - Atualizar cliente
- `DELETE /api/customer?id=uuid` - Deletar cliente

### Números de Telefone
- `POST /api/phone_number` - Adicionar números
- `GET /api/phone_number` - Listar números
- `PUT /api/phone_number?id=uuid` - Atualizar número
- `DELETE /api/phone_number?id=uuid` - Deletar número

### Relatórios
- `POST /api/report` - Upload de relatório
- `GET /api/report` - Listar relatórios

---

## ⚠️ Problemas Comuns

### "Invalid access token"
✅ Gere um token permanente no Meta for Developers

### "Phone number not found"
✅ Verifique o `WHATSAPP_PHONE_NUMBER_ID` no .env

### Webhook não funciona
✅ Use HTTPS (ngrok em desenvolvimento)  
✅ Verifique o `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

### Template rejeitado
✅ Templates MARKETING precisam aprovação (pode demorar 24h)  
✅ Use categoria UTILITY para aprovação mais rápida

---

## 📚 Documentação

- [Documentação Completa da Migração](docs/MIGRACAO_WHATSAPP.md)
- [WhatsApp Business API - Meta](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Documentação da API](docs/03-API.md)

---

## 🆘 Suporte

Em caso de dúvidas:
1. Consulte a [documentação completa](docs/MIGRACAO_WHATSAPP.md)
2. Verifique os logs do servidor
3. Teste os endpoints com curl/Postman

---

**Pronto para usar! 🎉**

Para mais detalhes sobre a migração do Twilio, veja: [MIGRACAO_WHATSAPP.md](docs/MIGRACAO_WHATSAPP.md)
