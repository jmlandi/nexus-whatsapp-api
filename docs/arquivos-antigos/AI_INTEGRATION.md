# 🤖 Integração com IA - Anthropic Claude

## Visão Geral

O Nexus agora inclui integração completa com **Anthropic Claude** para gerar respostas automáticas inteligentes e contextualizadas aos clientes via WhatsApp.

### Como Funciona

```
Cliente envia mensagem → WhatsApp
                          ↓
                       Twilio
                          ↓
            Webhook (POST /api/message)
                          ↓
              Salva mensagem no banco
                          ↓
        Claude analisa contexto do cliente
        (relatórios, histórico, etc)
                          ↓
           Gera resposta personalizada
                          ↓
            Salva resposta no banco
                          ↓
              Envia via Twilio
                          ↓
            Cliente recebe no WhatsApp
```

---

## 🔑 Configuração

### 1. Obter API Key da Anthropic

1. Acesse https://console.anthropic.com/
2. Crie uma conta ou faça login
3. Vá em **API Keys**
4. Clique em **Create Key**
5. Copie a chave (formato: `sk-ant-...`)

### 2. Configurar Variáveis de Ambiente

Edite seu arquivo `.env`:

```bash
# Anthropic AI (Claude)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024
```

### 3. Instalar Dependência

```bash
npm install @anthropic-ai/sdk
```

### 4. Reiniciar Aplicação

```bash
# Com Docker
docker-compose restart api

# Sem Docker
npm run dev
```

---

## 🧠 Modelos Disponíveis

| Modelo | Descrição | Custo | Recomendado |
|--------|-----------|-------|-------------|
| `claude-3-5-sonnet-20241022` | Mais recente, equilibrado | $$$ | ✅ Sim |
| `claude-3-opus-20240229` | Mais inteligente, mais lento | $$$$ | Para casos complexos |
| `claude-3-sonnet-20240229` | Rápido e eficiente | $$ | Para economia |
| `claude-3-haiku-20240307` | Mais rápido, mais barato | $ | Para respostas simples |

### Como Trocar de Modelo

```bash
# No .env
ANTHROPIC_MODEL=claude-3-opus-20240229
```

---

## 💬 Contexto Fornecido à IA

A IA recebe automaticamente:

### 1. Informações do Cliente
- Nome completo e nickname
- Lista dos últimos 5 relatórios
- Data e observações de cada relatório

### 2. Histórico da Conversa
- Últimas 8-10 mensagens
- Contexto completo da conversa atual

### 3. System Prompt Customizado
```
Você é o Nexus, assistente de IA da agência WN7.
Especializado em marketing digital.
Ajuda clientes a entender relatórios e métricas.
Linguagem amigável e profissional.
Respostas concisas (2-3 parágrafos).
```

---

## 🎯 Exemplos de Uso

### Exemplo 1: Cliente Pergunta Sobre Relatório

**Cliente:**
> "Olá! Gostaria de entender melhor os resultados de Janeiro"

**Claude Responde:**
> Olá! 😊 Analisando seu relatório de Janeiro/2024, posso te ajudar!
> 
> O relatório mostra um crescimento significativo no engajamento das suas campanhas. Suas publicações tiveram um alcance 35% maior comparado ao mês anterior.
> 
> Tem alguma métrica específica que gostaria de entender melhor?

### Exemplo 2: Cliente Pede Explicação de Métrica

**Cliente:**
> "O que significa CTR?"

**Claude Responde:**
> CTR significa "Click-Through Rate" (Taxa de Cliques) 📊
> 
> É a porcentagem de pessoas que viram seu anúncio e clicaram nele. Por exemplo, se 100 pessoas viram e 5 clicaram, o CTR é 5%.
> 
> No seu caso, o CTR de 3.2% está acima da média do mercado! Isso significa que seus anúncios estão bem atrativos 🎯

### Exemplo 3: Cliente Não Tem Relatório Ainda

**Cliente:**
> "Cadê meu relatório?"

**Claude Responde:**
> Olá! 😊 Vejo aqui que ainda não temos relatórios cadastrados para você.
> 
> Os relatórios são enviados mensalmente pela equipe WN7. Se você já deveria ter recebido, recomendo entrar em contato direto com seu gerente de conta.
> 
> Posso ajudar com mais alguma coisa?

---

## ⚙️ Funcionalidades Avançadas

### 1. Análise de Sentimento (Futuro)

```javascript
const sentiment = await aiService.analyzeSentiment(userMessage);
// Retorna: 'positive', 'neutral', 'negative'
```

### 2. Resumo de Relatórios (Futuro)

```javascript
const summary = await aiService.summarizeReport(reportText);
// Gera resumo executivo do relatório
```

### 3. Teste de Conexão

```javascript
const isWorking = await aiService.testConnection();
console.log('IA funcionando:', isWorking);
```

---

## 🔧 Personalização

### Ajustar Tamanho das Respostas

```bash
# No .env
ANTHROPIC_MAX_TOKENS=512   # Respostas mais curtas
ANTHROPIC_MAX_TOKENS=2048  # Respostas mais longas
```

**Referência:**
- 512 tokens ≈ 380 palavras ≈ 1-2 parágrafos
- 1024 tokens ≈ 750 palavras ≈ 2-3 parágrafos
- 2048 tokens ≈ 1500 palavras ≈ 4-5 parágrafos

### Customizar System Prompt

Edite `src/services/aiService.js`, método `generateResponse()`:

```javascript
const systemPrompt = `Você é o Nexus...
[Seu prompt customizado aqui]
`;
```

### Adicionar Mais Contexto

Modifique `getCustomerContext()` para incluir:
- Histórico de pagamentos
- Preferências do cliente
- Dados de campanhas ativas
- Etc.

---

## 📊 Custos Estimados

### Modelo: claude-3-5-sonnet-20241022

**Preços da Anthropic (Out/2024):**
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens

**Estimativa por mensagem:**
- Input médio: ~1000 tokens (contexto + pergunta)
- Output médio: ~500 tokens (resposta)
- Custo por mensagem: ~$0.01

**Estimativa mensal:**
- 1.000 mensagens/mês = $10
- 5.000 mensagens/mês = $50
- 10.000 mensagens/mês = $100

💡 **Dica:** Use cache do Anthropic para reduzir custos em ~50%

---

## 🔒 Segurança e Privacidade

### Dados Enviados à Anthropic

✅ **Enviado:**
- Nome do cliente
- Datas dos relatórios
- Observações dos relatórios
- Mensagens da conversa

❌ **NÃO Enviado:**
- CPF, RG, documentos
- Dados bancários
- Informações sensíveis
- Conteúdo completo dos PDFs (por enquanto)

### Recomendações

1. **Revise o System Prompt** antes de usar em produção
2. **Não inclua dados sensíveis** no contexto
3. **Monitore os logs** para detectar problemas
4. **Configure rate limiting** específico para IA
5. **Implemente cache** para economizar

---

## 🚨 Troubleshooting

### Erro: "API Key inválida"

```bash
# Verifique se a key está correta
echo $ANTHROPIC_API_KEY

# Deve começar com sk-ant-
# Se não estiver configurada, edite .env
```

### Erro: "Model not found"

```bash
# Verifique o nome do modelo
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Modelos antigos podem ter sido depreciados
# Consulte: https://docs.anthropic.com/claude/docs/models-overview
```

### IA não está respondendo

```bash
# Verifique logs
docker-compose logs -f api

# Procure por:
# - "IA não configurada"
# - "Erro ao gerar resposta com IA"
# - Erros de API
```

### Respostas muito genéricas

**Possíveis causas:**
1. Cliente não tem relatórios cadastrados
2. Relatórios sem observações detalhadas
3. System prompt precisa de ajustes

**Solução:**
- Adicione mais observações nos relatórios
- Customize o system prompt
- Inclua mais contexto relevante

### Custo muito alto

**Reduzir custos:**
1. Diminuir `ANTHROPIC_MAX_TOKENS`
2. Usar modelo mais barato (haiku)
3. Implementar cache
4. Limitar histórico de mensagens
5. Adicionar rate limiting por usuário

---

## 📈 Métricas e Monitoramento

### Logs Gerados

A IA loga automaticamente:

```
✅ Resposta gerada pela IA para chat {id}
⚠️  IA não configurada - pulando geração
❌ Erro ao gerar resposta com IA: {erro}
✅ Resposta da IA enviada via WhatsApp
```

### Métricas Recomendadas

Adicione tracking de:
- Tempo de resposta da IA
- Taxa de sucesso/falha
- Tokens consumidos
- Custo por conversa
- Satisfação do cliente (sentimento)

---

## 🎓 Boas Práticas

### 1. Fallback Sempre

✅ **Implementado:** Se a IA falhar, envia mensagem padrão
```javascript
const fallbackMessage = 'Desculpe, estou com dificuldades técnicas...';
```

### 2. Processamento Assíncrono

✅ **Implementado:** Webhook responde imediatamente, IA processa em background
```javascript
chatService.processMessageAsync(chat, Body, phoneNumber);
```

### 3. Validação de Configuração

✅ **Implementado:** Verifica se API key está configurada
```javascript
if (!aiService.isConfigured()) {
  // Não processa com IA
}
```

### 4. Logs Estruturados

✅ **Implementado:** Todos os eventos são logados com Winston

### 5. Tratamento de Erros

✅ **Implementado:** Try/catch em todas as chamadas de IA

---

## 🔄 Integração com Workflow

### Fluxo Completo Atual

1. **Cliente envia mensagem** → Twilio → Webhook
2. **Mensagem salva** no banco como `type: 'user'`
3. **IA processa** em background (não bloqueia webhook)
4. **Resposta gerada** com contexto do cliente
5. **Resposta salva** no banco como `type: 'agent'`
6. **Resposta enviada** via Twilio para WhatsApp
7. **Cliente recebe** resposta automática

### Desabilitar IA Temporariamente

```bash
# Remova ou comente a API key no .env
# ANTHROPIC_API_KEY=

# Ou defina como vazia
ANTHROPIC_API_KEY=""

# A aplicação detecta automaticamente e não usa IA
```

---

## 📚 Documentação Adicional

### Links Úteis

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude Models Overview](https://docs.anthropic.com/claude/docs/models-overview)
- [Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [API Reference](https://docs.anthropic.com/claude/reference/)
- [Pricing](https://www.anthropic.com/pricing)

### Arquivos Relacionados

- `src/services/aiService.js` - Serviço principal de IA
- `src/services/chatService.js` - Processamento de mensagens
- `src/controllers/messageController.js` - Webhook Twilio
- `.env.example` - Configuração de variáveis

---

## 🚀 Próximos Passos

### Melhorias Planejadas

- [ ] **Cache de contexto** para reduzir custos
- [ ] **Análise de sentimento** em todas as mensagens
- [ ] **Resumo automático** de relatórios PDF
- [ ] **Extração de dados** dos PDFs para contexto
- [ ] **Dashboard de métricas** de IA
- [ ] **A/B testing** de system prompts
- [ ] **Fine-tuning** com dados da WN7
- [ ] **Integração com CRM** para mais contexto

### Como Contribuir

Veja [CONTRIBUTING.md](../CONTRIBUTING.md) para diretrizes de contribuição.

---

**Última atualização:** Outubro 2024  
**Versão:** 1.1.0 (com IA)  
**Mantido por:** Marcos / WN7
