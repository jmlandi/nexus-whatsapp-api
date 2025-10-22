# 🧪 Guia de Testes - Integração IA

Este guia contém testes práticos para validar a integração com Anthropic Claude.

## 📋 Checklist de Testes

### ✅ Pré-requisitos

- [ ] Node.js 18+ instalado
- [ ] Docker e Docker Compose instalados (opcional)
- [ ] Conta Twilio com WhatsApp configurado
- [ ] Bucket S3 criado e configurado
- [ ] **API Key da Anthropic** ([console.anthropic.com](https://console.anthropic.com))

### ✅ Configuração

```bash
# 1. Verifique se todas as variáveis estão no .env.local
cat .env.local | grep ANTHROPIC

# Deve mostrar:
# ANTHROPIC_API_KEY=sk-ant-xxxxx
# ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
# ANTHROPIC_MAX_TOKENS=1024
```

### ✅ Instalação

```bash
# 1. Instale dependências
npm install

# 2. Verifique se @anthropic-ai/sdk foi instalado
npm list @anthropic-ai/sdk

# Deve mostrar: @anthropic-ai/sdk@0.27.0
```

---

## 🧪 Testes Unitários

### Teste 1: Verificar Configuração da IA

```bash
# Execute Node.js no console
node

# Cole este código:
const aiService = require('./src/services/aiService');

console.log('IA configurada?', aiService.isConfigured());
// Deve retornar: IA configurada? true

process.exit();
```

**✅ Resultado esperado:** `true`  
**❌ Se falhar:** Verifique `ANTHROPIC_API_KEY` no .env.local

---

### Teste 2: Testar Conexão com Anthropic

```bash
node
```

```javascript
const aiService = require('./src/services/aiService');

(async () => {
  try {
    const result = await aiService.testConnection();
    console.log('✅ Teste bem-sucedido!', result);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  process.exit();
})();
```

**✅ Resultado esperado:**
```json
{
  "success": true,
  "model": "claude-3-5-sonnet-20241022",
  "message": "Hello! I'm Claude..."
}
```

**❌ Se falhar:**
- Verifique API key
- Verifique conexão com internet
- Verifique rate limits no console Anthropic

---

### Teste 3: Gerar Resposta Simples

```javascript
const aiService = require('./src/services/aiService');

(async () => {
  const context = {
    customer: { name: 'João', companyName: 'Empresa Teste' },
    chatHistory: []
  };
  
  const response = await aiService.generateResponse('Olá!', context);
  console.log('Resposta da IA:', response);
  process.exit();
})();
```

**✅ Resultado esperado:** Uma mensagem de saudação profissional da IA

---

## 🌐 Testes de Integração

### Teste 4: Webhook Twilio (Mock)

Crie um arquivo `test-webhook.js`:

```javascript
const axios = require('axios');

async function testWebhook() {
  try {
    const response = await axios.post('http://localhost:3000/api/message', {
      From: 'whatsapp:+5511999999999',
      To: 'whatsapp:+14155238886', // Twilio sandbox
      Body: 'Olá! Como foram os resultados?',
      MessageSid: 'SM' + Date.now(),
      AccountSid: process.env.TWILIO_ACCOUNT_SID
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    console.log('✅ Webhook respondeu:', response.status);
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testWebhook();
```

Execute:
```bash
# Inicie a API primeiro
npm run dev

# Em outro terminal
node test-webhook.js
```

**✅ Resultado esperado:** Status 200  
**⏰ Aguarde 2-5 segundos** e verifique logs:

```bash
docker-compose logs -f api | grep "AI Service"
```

---

### Teste 5: Fluxo Completo End-to-End

#### 1. Crie um cliente

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Teste IA",
    "email": "ia@teste.com",
    "companyName": "IA Test Corp"
  }'

# Anote o ID retornado (ex: 1)
```

#### 2. Adicione um número

```bash
curl -X POST http://localhost:3000/api/phone-numbers \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "phoneNumber": "+5511999999999",
    "label": "WhatsApp Teste"
  }'
```

#### 3. Crie um relatório

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "period": "2024-01",
    "metrics": {
      "impressions": 10000,
      "clicks": 800,
      "conversions": 40,
      "spent": 2000,
      "revenue": 5000
    },
    "analysis": "Campanha teve bom desempenho com ROI de 150%"
  }'
```

#### 4. Simule mensagem do cliente

```bash
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+5511999999999" \
  -d "To=whatsapp:+14155238886" \
  -d "Body=Como foi minha campanha de janeiro?" \
  -d "MessageSid=SM12345678" \
  -d "AccountSid=AC12345678"
```

#### 5. Verifique logs da IA

```bash
# Logs em tempo real
docker-compose logs -f api

# Buscar especificamente IA
docker-compose logs api | grep -i "ai\|anthropic\|claude"
```

**✅ Resultado esperado:**
- Webhook responde 200 OK imediatamente
- Logs mostram processamento em background
- Após 2-5 segundos, IA gera resposta
- Resposta é enviada via Twilio
- Resposta menciona métricas do relatório de janeiro

---

## 📊 Testes de Performance

### Teste 6: Tempo de Resposta

```javascript
const aiService = require('./src/services/aiService');

async function measurePerformance() {
  const context = {
    customer: {
      name: 'João',
      companyName: 'Teste Corp',
      reports: [
        {
          period: '2024-01',
          metrics: { impressions: 10000, clicks: 800 },
          analysis: 'Boa performance'
        }
      ]
    },
    chatHistory: []
  };

  console.log('⏱️  Iniciando teste de performance...');
  const start = Date.now();
  
  const response = await aiService.generateResponse(
    'Qual foi o resultado da campanha?',
    context
  );
  
  const duration = Date.now() - start;
  console.log(`✅ Resposta gerada em ${duration}ms (${(duration/1000).toFixed(2)}s)`);
  console.log(`📝 Tamanho: ${response.length} caracteres`);
}

measurePerformance().then(() => process.exit());
```

**✅ Benchmarks esperados:**
- **claude-3-5-sonnet**: 2-5 segundos
- **claude-3-haiku**: 1-2 segundos
- **claude-3-opus**: 5-10 segundos

---

### Teste 7: Custo Estimado

```javascript
const aiService = require('./src/services/aiService');

async function estimateCost() {
  const inputText = 'Como foi minha campanha?';
  const contextSize = 2000; // ~2000 tokens de contexto médio
  
  // Estimativas do Claude 3.5 Sonnet
  const inputCostPer1M = 3; // $3 por 1M tokens
  const outputCostPer1M = 15; // $15 por 1M tokens
  const outputTokens = 500; // Média de tokens na resposta
  
  const inputCost = (contextSize / 1_000_000) * inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * outputCostPer1M;
  const totalCost = inputCost + outputCost;
  
  console.log('💰 Estimativa de Custo por Mensagem:');
  console.log(`   Input (${contextSize} tokens): $${inputCost.toFixed(4)}`);
  console.log(`   Output (${outputTokens} tokens): $${outputCost.toFixed(4)}`);
  console.log(`   Total: $${totalCost.toFixed(4)}`);
  console.log(`\n📊 Projeções:`);
  console.log(`   100 mensagens/mês: $${(totalCost * 100).toFixed(2)}`);
  console.log(`   1000 mensagens/mês: $${(totalCost * 1000).toFixed(2)}`);
}

estimateCost();
```

---

## 🐛 Testes de Erro

### Teste 8: Comportamento sem API Key

```bash
# 1. Remova temporariamente a API key
mv .env.local .env.local.backup

# 2. Inicie a API
npm run dev

# 3. Tente enviar mensagem
curl -X POST http://localhost:3000/api/message \
  -d "From=whatsapp:+5511999999999" \
  -d "Body=teste"

# 4. Verifique logs
docker-compose logs api | tail -20

# 5. Restaure a API key
mv .env.local.backup .env.local
```

**✅ Resultado esperado:** 
- Sistema continua funcionando
- Envia mensagem de fallback padrão
- Logs mostram aviso sobre IA não configurada

---

### Teste 9: Timeout da IA

```javascript
// Simule resposta lenta da IA
const aiService = require('./src/services/aiService');

async function testTimeout() {
  const start = Date.now();
  try {
    // Timeout de 10 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );
    
    const responsePromise = aiService.generateResponse('teste', {
      customer: { name: 'Test' },
      chatHistory: []
    });
    
    await Promise.race([responsePromise, timeoutPromise]);
  } catch (error) {
    console.log('⚠️  Timeout após', (Date.now() - start) / 1000, 'segundos');
  }
}

testTimeout().then(() => process.exit());
```

---

## 📋 Checklist Final

### Funcionalidade
- [ ] IA responde mensagens automaticamente
- [ ] Resposta considera relatórios do cliente
- [ ] Resposta mantém contexto da conversa
- [ ] Webhook retorna 200 OK imediatamente
- [ ] Processamento acontece em background

### Performance
- [ ] Resposta em 2-5 segundos (sonnet)
- [ ] Sem bloqueio do webhook Twilio
- [ ] Logs claros e informativos

### Custo
- [ ] Uso de modelo apropriado (sonnet recomendado)
- [ ] Max tokens configurado (1024 padrão)
- [ ] Histórico limitado (10 mensagens)

### Segurança
- [ ] API key em variável de ambiente
- [ ] Não exposta em logs
- [ ] Rate limiting ativo
- [ ] Erros tratados adequadamente

### Fallback
- [ ] Sistema funciona sem IA configurada
- [ ] Mensagem padrão se IA falhar
- [ ] Logs de erro claros

---

## 🎯 Resultados Esperados

### ✅ Sucesso Total
- Todos os testes passam
- IA responde em 2-5 segundos
- Respostas contextualizadas e relevantes
- Custo por mensagem ~$0.03-$0.05
- Sistema estável mesmo com falhas

### ⚠️ Atenção
- Respostas > 10 segundos → Verifique rate limits
- Custo alto → Reduza max_tokens ou use Haiku
- Respostas genéricas → Verifique contexto do cliente

### ❌ Problemas
Consulte:
- [AI_INTEGRATION.md](./docs/AI_INTEGRATION.md#troubleshooting)
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Logs: `docker-compose logs api`

---

## 📞 Suporte

Encontrou um problema?
1. Verifique logs: `docker-compose logs -f api`
2. Consulte [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
3. Revise [AI_INTEGRATION.md](./docs/AI_INTEGRATION.md)
4. Email: suporte@wn7.com

---

**🚀 Boa sorte com os testes!**
