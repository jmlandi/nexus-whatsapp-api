# 🎯 Nexus IA - Cheat Sheet

Referência rápida para a integração com Anthropic Claude.

---

## ⚡ Quick Start (30 segundos)

```bash
# 1. Configure
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" >> .env.local

# 2. Instale
npm install

# 3. Rode
npm run dev

# 4. Teste enviando mensagem WhatsApp!
```

---

## 🔑 Variáveis de Ambiente

```bash
# Obrigatórias
ANTHROPIC_API_KEY=sk-ant-xxxxx          # Console: console.anthropic.com

# Opcionais (com defaults)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # Modelo a usar
ANTHROPIC_MAX_TOKENS=1024                   # Limite de tokens
```

---

## 🤖 Modelos Disponíveis

| Modelo | Velocidade | Custo | Quando usar |
|--------|-----------|-------|-------------|
| `claude-3-haiku-20240307` | 🚀🚀🚀 | $ | Respostas rápidas e simples |
| `claude-3-5-sonnet-20241022` | 🚀🚀 | $$ | **RECOMENDADO** - Equilibrado |
| `claude-3-sonnet-20240229` | 🚀🚀 | $$ | Alternativa ao 3.5 |
| `claude-3-opus-20240229` | 🚀 | $$$ | Máxima qualidade |

---

## 💰 Custos

### Claude 3.5 Sonnet (Recomendado)
```
Input:  $3 / 1M tokens  (~$0.003 / 1k)
Output: $15 / 1M tokens (~$0.015 / 1k)

Por mensagem: ~$0.03 - $0.05
100 msgs:     ~$3 - $5
1000 msgs:    ~$30 - $50
```

---

## 📂 Estrutura de Arquivos

```
nexus/
├── src/
│   ├── services/
│   │   └── aiService.js         ⭐ Service principal
│   ├── controllers/
│   │   └── messageController.js  ⭐ Webhook integrado
│   └── ...
├── docs/
│   └── AI_INTEGRATION.md         📚 Guia completo
├── WELCOME_AI.md                 👋 Começe aqui
├── TESTING_AI.md                 🧪 Testes
└── PROMPT_GALLERY.md             🎨 Prompts
```

---

## 🔄 Fluxo de Mensagem

```
WhatsApp → Twilio → Webhook → Salva → Responde 200
                                  ↓
                            [BACKGROUND]
                                  ↓
                    Busca contexto + histórico
                                  ↓
                           Claude AI gera resposta
                                  ↓
                          Salva + Envia via Twilio
                                  ↓
                        Cliente recebe resposta 🎉
```

---

## 🛠️ Métodos Principais

### aiService.js

```javascript
// Gerar resposta
const response = await aiService.generateResponse(message, context);

// Testar conexão
const test = await aiService.testConnection();

// Verificar configuração
const configured = aiService.isConfigured(); // true/false
```

### chatService.js

```javascript
// Processar com IA (síncrono)
const response = await chatService.processMessageWithAI(chat, message);

// Processar em background (assíncrono)
await chatService.processMessageAsync(chat, userMessage);
```

---

## 🧪 Testes Rápidos

### 1. Configuração
```bash
node -e "console.log(require('./src/services/aiService').isConfigured())"
# Deve retornar: true
```

### 2. Conexão
```javascript
const ai = require('./src/services/aiService');
ai.testConnection().then(console.log);
```

### 3. Resposta simples
```javascript
const ai = require('./src/services/aiService');
const context = {
  customer: { name: 'Teste', companyName: 'Teste Inc' },
  chatHistory: []
};
ai.generateResponse('Olá!', context).then(console.log);
```

---

## 🐛 Troubleshooting Rápido

### IA não responde
```bash
# Verificar API key
echo $ANTHROPIC_API_KEY

# Ver logs
docker-compose logs -f api | grep "AI"

# Testar API direto
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
```

### Respostas genéricas
```bash
# Verificar se cliente tem relatórios
curl http://localhost:3000/api/reports?customerId=1

# Ver contexto nos logs
docker-compose logs api | grep "Customer context"
```

### Custo alto
```bash
# Reduzir tokens
ANTHROPIC_MAX_TOKENS=512

# Usar modelo mais barato
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

---

## 🎨 Personalizar Prompt

### Localização do Prompt
```javascript
// Arquivo: src/services/aiService.js
// Linha: ~12-25

const systemPrompt = `Seu prompt aqui...`;
```

### Prompt Rápido - Tom Casual
```javascript
const systemPrompt = `Sou o Nexus 🤖, seu parceiro de marketing!
Explico seus relatórios de forma clara e descontraída.
Sempre uso dados concretos e emojis legais! 🚀`;
```

### Prompt Rápido - Tom Formal
```javascript
const systemPrompt = `Você é o Nexus, assistente executivo da WN7.
Análises precisas, dados concretos, tom profissional.
Foco em ROI e resultados mensuráveis.`;
```

Mais prompts em: **[PROMPT_GALLERY.md](./PROMPT_GALLERY.md)**

---

## 📊 Métricas e Logs

### Ver logs da IA
```bash
# Logs em tempo real
docker-compose logs -f api

# Filtrar IA
docker-compose logs api | grep -i "ai\|anthropic\|claude"

# Logs de erro
tail -f logs/error.log | grep AI
```

### Métricas importantes
```javascript
// Em aiService.js, adicione logs:
logger.info('AI Response', {
  inputTokens: context.length,
  outputTokens: response.length,
  duration: Date.now() - start,
  cost: calculateCost(inputTokens, outputTokens)
});
```

---

## 🔐 Segurança Checklist

- [ ] API key em `.env.local` (não commitar)
- [ ] `.env.local` no `.gitignore`
- [ ] HTTPS em produção
- [ ] Rate limiting ativo (100 req/15min)
- [ ] Logs não expõem secrets
- [ ] Erros tratados sem vazamento de info

---

## 📱 Exemplo de Conversa

```
Cliente: Como foram os resultados de janeiro?

Nexus: Olá! Sua campanha de janeiro teve ótimos resultados! 📊
• Impressões: 15.000
• Cliques: 1.200 (CTR de 8%)
• Conversões: 45
• ROI: 250%
Investimento: R$ 3.000 → Retorno: R$ 7.500
Gostaria de mais detalhes? 🚀

Cliente: Melhor que dezembro?

Nexus: Sim! Janeiro foi 30% melhor que dezembro:
• Dezembro: 980 cliques (CTR 6.5%)
• Janeiro: 1.200 cliques (CTR 8%)
Principais melhorias:
✅ Otimização de anúncios
✅ Segmentação mais precisa
Posso sugerir próximos passos? 💡
```

---

## 🚀 Deploy Rápido

```bash
# Produção
docker-compose up -d

# Configure variáveis
docker-compose exec api sh -c 'echo $ANTHROPIC_API_KEY'

# Ver status
docker-compose ps

# Logs
docker-compose logs -f api
```

---

## 📚 Documentação

| Documento | Quando Usar |
|-----------|-------------|
| [WELCOME_AI.md](./WELCOME_AI.md) | 👋 Primeiro contato |
| [AI_INTEGRATION.md](./docs/AI_INTEGRATION.md) | 📖 Guia completo |
| [TESTING_AI.md](./TESTING_AI.md) | 🧪 Testar integração |
| [PROMPT_GALLERY.md](./PROMPT_GALLERY.md) | 🎨 Personalizar respostas |
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | 🐛 Resolver problemas |

---

## 🆘 Suporte Rápido

### Links Úteis
- [Anthropic Console](https://console.anthropic.com/) - API keys
- [Anthropic Docs](https://docs.anthropic.com/) - Documentação oficial
- [Model Pricing](https://www.anthropic.com/pricing) - Custos

### Comandos Úteis
```bash
# Status da API
curl http://localhost:3000/health

# Testar webhook
curl -X POST http://localhost:3000/api/message \
  -d "From=whatsapp:+5511999999999" \
  -d "Body=teste"

# Ver configuração
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.ANTHROPIC_MODEL)"
```

---

## 💡 Dicas Pro

### Performance
- Use `claude-3-haiku` para respostas simples
- Cache contexto quando possível (futuro)
- Limite histórico a 5-10 mensagens

### Custo
- Monitore uso no console Anthropic
- Defina alertas de custo
- Use `ANTHROPIC_MAX_TOKENS` baixo inicial

### Qualidade
- Teste diferentes system prompts
- Ajuste baseado em feedback real
- Monitore satisfação dos clientes

### Debug
- Sempre verifique logs primeiro
- Use `testConnection()` regularmente
- Teste com dados reais

---

## 🎯 Checklist de Produção

Antes de ir pra produção:

- [ ] API key configurada
- [ ] Modelo escolhido (sonnet recomendado)
- [ ] Max tokens ajustado
- [ ] Logs configurados
- [ ] Rate limiting ativo
- [ ] HTTPS configurado
- [ ] Backup do banco
- [ ] Alertas de custo Anthropic
- [ ] Monitoramento ativo
- [ ] Testes end-to-end passando

---

## 📞 Contatos

- **Email**: suporte@wn7.com
- **Docs**: Pasta `/docs`
- **Emergency**: Ver TROUBLESHOOTING.md

---

**🚀 Nexus v1.1.0 - Powered by Anthropic Claude**  
**Desenvolvido para WN7 Agência de Marketing Digital**

---

> 💡 **Dica**: Imprima ou salve este cheat sheet para referência rápida!
