# 🔄 Migração: Twilio → WhatsApp Business API

## Resumo das Mudanças

Este documento detalha a migração completa do Twilio para a API oficial do WhatsApp Business (Meta Graph API).

---

## 📋 Alterações Realizadas

### 1. **Novo Serviço: `whatsappService.js`**

**Localização:** `src/services/whatsappService.js`

**Recursos implementados:**
- ✅ Envio de mensagens de texto
- ✅ Envio de templates aprovados
- ✅ Envio de mídia (imagens, documentos, PDFs, vídeos, áudio)
- ✅ Marcar mensagens como lidas
- ✅ Criar templates
- ✅ Listar templates
- ✅ Deletar templates
- ✅ Validação de números de telefone
- ✅ Health check da API

**Diferenças do Twilio:**
- Usa Graph API do Meta (axios) em vez do SDK do Twilio
- Formato de números: remove "whatsapp:" prefix
- Templates agora usam `name` e `languageCode` em vez de `contentSid`
- Suporte nativo para componentes de template (header, body, footer, buttons)

---

### 2. **Novo Controller: `templateController.js`**

**Localização:** `src/controllers/templateController.js`

**Endpoints disponíveis:**
```
POST   /api/template                      # Cria template personalizado
GET    /api/template?limit=100            # Lista todos os templates
DELETE /api/template/:name                # Deleta template
POST   /api/template/create-report-template # Cria template padrão para relatórios
```

**Exemplo de criação de template:**
```json
{
  "name": "welcome_message",
  "category": "MARKETING",
  "language": "pt_BR",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Bem-vindo {{1}}!"
    },
    {
      "type": "BODY",
      "text": "Olá {{1}}, tudo bem? Aqui está seu relatório de {{2}}."
    },
    {
      "type": "FOOTER",
      "text": "Enviado por WN7 Marketing"
    }
  ]
}
```

---

### 3. **Atualizações de Serviços e Controllers**

#### `chatService.js`
- ❌ Removido: `require('./twilioService')`
- ✅ Adicionado: `require('./whatsappService')`
- Atualizado: Todas as chamadas de `twilioService` → `whatsappService`

#### `chatController.js`
- Atualizado método `sendTemplate()` para usar:
  - `templateName` em vez de `templateId`
  - `languageCode` (opcional, padrão: pt_BR)
  - `components` para variáveis do template

#### `messageController.js`
- ✅ Novo: Suporte ao webhook do WhatsApp (formato Graph API)
- ✅ Novo: Método `verifyWebhook()` para validação GET do Meta
- Adaptado para processar payload do WhatsApp em vez do Twilio
- Marca mensagens como lidas automaticamente

**Webhook do WhatsApp:**
```
GET  /api/message?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
POST /api/message  # Recebe mensagens e eventos
```

#### `phoneNumberController.js`
- Substituído `twilioService.validatePhoneNumber()` por `whatsappService.validatePhoneNumber()`

---

### 4. **Novas Rotas**

**Arquivo:** `src/routes/templateRoutes.js`
**Registrado em:** `src/routes/index.js`

```javascript
router.use('/template', templateRoutes);
```

---

### 5. **Variáveis de Ambiente**

**Arquivo:** `.env.example`

#### ❌ Removidas (Twilio):
```bash
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

#### ✅ Adicionadas (WhatsApp):
```bash
# WhatsApp Business API (Meta)
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=nexus_verify_token
```

---

### 6. **Dependências**

**Arquivo:** `package.json`

#### ❌ Removido:
```json
"twilio": "^4.19.0"
```

#### ✅ Adicionado:
```json
"axios": "^1.6.0"
```

---

## 🚀 Como Configurar

### Passo 1: Obter Credenciais do WhatsApp Business

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie ou selecione um App
3. Adicione o produto "WhatsApp"
4. Configure o WhatsApp Business Account
5. Obtenha as credenciais:
   - **Phone Number ID**: Em "WhatsApp > API Setup"
   - **Business Account ID**: Em "WhatsApp > Getting Started"
   - **Access Token**: Gere um token permanente

### Passo 2: Configurar Variáveis

Copie `.env.example` para `.env` e preencha:

```bash
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_secreto_aqui
```

### Passo 3: Instalar Dependências

```bash
npm install
```

### Passo 4: Configurar Webhook

1. No Meta Developers, vá em "WhatsApp > Configuration"
2. Configure a URL do webhook:
   ```
   https://seu-dominio.com/api/message
   ```
3. Use o token de verificação definido em `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. Inscreva-se nos eventos:
   - `messages` (obrigatório)
   - `message_status` (opcional)

---

## 📝 Endpoints Principais

### Templates

```bash
# Criar template
POST /api/template
Content-Type: application/json
{
  "name": "relatorio_mensal",
  "category": "MARKETING",
  "language": "pt_BR",
  "components": [...]
}

# Listar templates
GET /api/template?limit=50

# Deletar template
DELETE /api/template/relatorio_mensal
```

### Enviar Template (Iniciar Chat)

```bash
POST /api/chat/send-template
Content-Type: application/json
{
  "customerId": "uuid-do-cliente",
  "phoneNumberId": "uuid-do-numero",
  "templateName": "relatorio_mensal",
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
}
```

---

## 🔍 Diferenças Importantes

### Formato de Números

**Twilio:** `whatsapp:+5511999999999`  
**WhatsApp API:** `5511999999999` (sem prefixo, apenas dígitos)

### Templates

**Twilio:**
```javascript
sendTemplate(phoneNumber, templateSid, variables)
```

**WhatsApp API:**
```javascript
sendTemplate(phoneNumber, templateName, languageCode, components)
```

### Webhook

**Twilio:** Envia `From`, `Body`, `MessageSid`  
**WhatsApp:** Envia estrutura JSON complexa com `entry > changes > value > messages`

---

## ✅ Testes Necessários

Antes de fazer o merge, teste:

1. ✅ **Envio de mensagem de texto**
   ```bash
   POST /api/chat/send-template
   ```

2. ✅ **Recebimento de mensagem via webhook**
   - Configure webhook no Meta
   - Envie mensagem do WhatsApp para o número configurado
   - Verifique se a IA responde

3. ✅ **Criação de template**
   ```bash
   POST /api/template
   ```

4. ✅ **Listagem de templates**
   ```bash
   GET /api/template
   ```

5. ✅ **Health check**
   - Verificar se o serviço consegue se conectar à API

---

## 🐛 Troubleshooting

### Erro: "Invalid access token"
- Verifique se o token está correto
- Certifique-se de usar um token permanente (não temporário)

### Erro: "Phone number not found"
- Verifique o `WHATSAPP_PHONE_NUMBER_ID`
- Certifique-se de que o número está aprovado no Meta

### Webhook não funciona
- URL deve ser HTTPS (não HTTP)
- Token de verificação deve corresponder ao configurado no Meta
- Verifique logs do servidor para erros

### Template não aprovado
- Templates de MARKETING precisam aprovação do WhatsApp
- Templates de UTILITY são aprovados mais rapidamente
- Evite usar caracteres especiais ou emojis em excesso

---

## 📚 Documentação Oficial

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Enviar Mensagens](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)

---

## ✨ Próximos Passos

Após o merge e testes:

1. [ ] Configurar ambiente de produção no Meta
2. [ ] Criar templates de mensagem necessários
3. [ ] Configurar webhook em produção (HTTPS)
4. [ ] Testar fluxo completo com clientes reais
5. [ ] Monitorar logs e erros
6. [ ] Documentar templates criados
7. [ ] Treinar equipe nos novos endpoints

---

**Migração completa realizada com sucesso! 🎉**
