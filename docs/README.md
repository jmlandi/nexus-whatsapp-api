# Nexus API - Documentação

API de automação WhatsApp com IA para relatórios de marketing.

## � Índice da Documentação

| Documento | Descrição |
|-----------|-----------|
| **[01-INTRODUCAO.md](./01-INTRODUCAO.md)** | O que é o Nexus e principais funcionalidades |
| **[02-INSTALACAO.md](./02-INSTALACAO.md)** | Como instalar e configurar o projeto |
| **[03-API.md](./03-API.md)** | Documentação completa da API e exemplos |
| **[04-DEPLOY.md](./04-DEPLOY.md)** | Guia de deploy em produção |

## 🚀 Início Rápido

### Pré-requisitos
- Docker e Docker Compose
- Contas: Twilio, AWS S3, Anthropic (opcional)

### 3 Passos para Rodar

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 2. Inicie com Docker
docker-compose up -d

# 3. Execute as migrations
docker-compose exec api npx prisma migrate dev --name init
```

Acesse: http://localhost:3000/health

## � Links Úteis

- **PgAdmin**: http://localhost:5050 (admin@nexus.com / admin)
- **Prisma Studio**: `docker-compose exec api npx prisma studio`
- **Logs**: `docker-compose logs -f api`

## 💡 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação específica acima
2. Verifique os logs da aplicação
3. Abra uma issue no repositório

### Para Integração com IA

1. Siga o **[README Principal](../README.md)** até a seção "Início Rápido com IA"
2. Configure sua chave Anthropic no `.env.local`
3. Leia **[AI_INTEGRATION.md](./AI_INTEGRATION.md)** para personalização avançada

### Para Deploy em Produção

1. Revise **[DEPLOY.md](./DEPLOY.md)** completamente
2. Configure variáveis de ambiente de produção
3. Siga o checklist de segurança

### Para Troubleshooting

1. Verifique **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** primeiro
2. Consulte logs em `logs/app.log` e `logs/error.log`
3. Use o suporte técnico se necessário

---

## 🔍 Busca Rápida

### Endpoints da API

| Recurso | Documento | Descrição |
|---------|-----------|-----------|
| Clientes | [API_REFERENCE.md](./API_REFERENCE.md#customers) | CRUD de clientes |
| Números | [API_REFERENCE.md](./API_REFERENCE.md#phone-numbers) | Gestão de números WhatsApp |
| Relatórios | [API_REFERENCE.md](./API_REFERENCE.md#reports) | Upload e envio de PDFs |
| Chats | [API_REFERENCE.md](./API_REFERENCE.md#chats) | Gestão de conversas |
| Mensagens | [API_REFERENCE.md](./API_REFERENCE.md#messages) | Histórico de mensagens |

### Integrações

| Serviço | Documento | O que faz |
|---------|-----------|-----------|
| Twilio | [TWILIO_INTEGRATION.md](./TWILIO_INTEGRATION.md) | Envio/recebimento WhatsApp |
| AWS S3 | [AWS_INTEGRATION.md](./AWS_INTEGRATION.md) | Armazenamento de PDFs |
| Anthropic | [AI_INTEGRATION.md](./AI_INTEGRATION.md) | Respostas automáticas com IA |

### Componentes do Sistema

| Componente | Documento | Responsabilidade |
|------------|-----------|------------------|
| Controllers | [ARCHITECTURE.md](./ARCHITECTURE.md#controllers) | Rotas e validação |
| Services | [ARCHITECTURE.md](./ARCHITECTURE.md#services) | Lógica de negócio |
| Database | [DATABASE.md](./DATABASE.md) | Prisma e PostgreSQL |
| Cron Jobs | [ARCHITECTURE.md](./ARCHITECTURE.md#jobs) | Tarefas agendadas |

---

## 🤖 Recursos de IA

### Capacidades da IA Nexus

- ✅ Respostas contextualizadas baseadas em relatórios do cliente
- ✅ Memória de conversas (últimas 10 mensagens)
- ✅ Acesso a métricas e análises de marketing
- ✅ Processamento assíncrono (não bloqueia webhooks)
- ✅ Fallback automático se IA falhar

### Custos Estimados

- **Modelo recomendado**: `claude-3-5-sonnet-20241022`
- **Custo por mensagem**: ~$0.03 - $0.05
- **Input**: $3 / 1M tokens
- **Output**: $15 / 1M tokens

Veja mais em: **[AI_INTEGRATION.md](./AI_INTEGRATION.md#custos)**

---

## 📊 Diagramas e Esquemas

### Diagrama de Relacionamentos

```
Customer (1) ──┬─→ (N) PhoneNumber
               │
               ├─→ (N) Report
               │
               └─→ (N) Chat ──→ (N) ChatMessage
```

Detalhes completos em: **[DATABASE.md](./DATABASE.md)**

### Fluxo de Mensagens com IA

```
1. Cliente → WhatsApp
2. Twilio → Webhook (/api/message)
3. Sistema → Salva mensagem no BD
4. Sistema → Processa com IA (async)
5. IA → Gera resposta contextualizada
6. Sistema → Envia via Twilio
7. Cliente ← Recebe resposta automática
```

Detalhes completos em: **[AI_INTEGRATION.md](./AI_INTEGRATION.md#fluxo)**

---

## 🔐 Segurança

### Variáveis Sensíveis

Nunca commite estas variáveis:
- `ANTHROPIC_API_KEY`
- `TWILIO_AUTH_TOKEN`
- `AWS_SECRET_ACCESS_KEY`
- `DATABASE_URL` (produção)

### Checklist de Segurança

- [ ] Usar HTTPS em produção
- [ ] Rate limiting configurado
- [ ] CORS restrito ao domínio
- [ ] Helmet.js habilitado
- [ ] Variáveis em ambiente seguro
- [ ] Logs não expõem secrets

Guia completo em: **[DEPLOY.md](./DEPLOY.md#segurança)**

---

## 🆘 Suporte

### Documentação Externa

- [Twilio Docs](https://www.twilio.com/docs)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3)
- [Anthropic Docs](https://docs.anthropic.com)
- [Prisma Docs](https://www.prisma.io/docs)

### Contato

- Email: suporte@wn7.com
- Docs: Este diretório `/docs`

---

**Última atualização:** 2024  
**Versão da API:** 1.0.0  
**Desenvolvido para:** WN7 Agência de Marketing Digital
