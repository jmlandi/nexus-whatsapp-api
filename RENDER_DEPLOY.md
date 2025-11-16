# 🚀 Deploy Nexus no Render

Guia completo para fazer deploy da API Nexus no Render com PostgreSQL gerenciado.

## 📋 Pré-requisitos

Antes de começar, você precisa:

1. **Conta no Render**: Criar conta gratuita em [render.com](https://render.com)
2. **Repositório Git**: Seu código deve estar em GitHub, GitLab ou Bitbucket
3. **Credenciais necessárias**:
   - WhatsApp Business API (Meta)
   - AWS S3 (Access Key e Secret Key)
   - Anthropic API Key (Claude)

## 🎯 Métodos de Deploy

### Método 1: Deploy Automático com Blueprint (Recomendado)

Este método usa o arquivo `render.yaml` para criar todos os serviços automaticamente.

#### Passo 1: Preparar o Repositório

```bash
# Certifique-se de que os arquivos de configuração estão commitados
git add render.yaml build.sh .renderignore
git commit -m "Add Render deployment configuration"
git push origin main
```

#### Passo 2: Conectar ao Render

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório (GitHub/GitLab/Bitbucket)
4. Selecione o repositório `nexus-whatsapp-api`
5. O Render detectará automaticamente o arquivo `render.yaml`

#### Passo 3: Configurar Variáveis de Ambiente Secretas

Durante a criação, o Render pedirá para você configurar as variáveis marcadas como `sync: false`:

**Variáveis Obrigatórias:**

```bash
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id_aqui
WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui

# AWS S3
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_S3_BUCKET_NAME=seu_bucket_name_aqui

# Anthropic AI
ANTHROPIC_API_KEY=sua_anthropic_api_key_aqui
```

#### Passo 4: Aplicar o Blueprint

1. Revise as configurações
2. Clique em **"Apply"**
3. O Render criará automaticamente:
   - Banco de dados PostgreSQL
   - Web Service (API)
   - Variáveis de ambiente
   - Disco persistente para logs

#### Passo 5: Aguardar o Deploy

- O processo leva de 5-10 minutos
- Acompanhe os logs em tempo real
- Aguarde a mensagem "Build successful" e "Deploy live"

---

### Método 2: Deploy Manual (Passo a Passo)

Se preferir criar os serviços manualmente:

#### Passo 1: Criar Banco de Dados PostgreSQL

1. No Dashboard do Render, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `nexus-postgres`
   - **Database**: `nexus_db`
   - **User**: `nexus_user`
   - **Region**: `Ohio` (ou sua preferência)
   - **Plan**: `Starter` (Free) ou `Standard`
3. Clique em **"Create Database"**
4. **IMPORTANTE**: Copie a **Internal Database URL** (será usada depois)

#### Passo 2: Criar Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório Git
3. Configure:

**Configurações Básicas:**
- **Name**: `nexus-api`
- **Region**: `Ohio` (mesma do banco)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `./build.sh`
- **Start Command**: `npm start`

**Configurações Avançadas:**
- **Plan**: `Starter` (Free) ou `Standard`
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes`

#### Passo 3: Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```bash
# Node Configuration
NODE_ENV=production
PORT=10000

# Database (cole a URL copiada do Passo 1)
DATABASE_URL=postgresql://nexus_user:senha@dpg-xxx.ohio.render.com/nexus_db

# WhatsApp Business API
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=token_seguro_aleatorio

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_S3_BUCKET_NAME=seu_bucket_name

# Anthropic AI
ANTHROPIC_API_KEY=sua_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=1024

# JWT
JWT_SECRET=gere_um_token_seguro_aleatorio
JWT_EXPIRES_IN=24h

# Application
CHAT_TIMEOUT_MINUTES=15
MAX_PAGE_SIZE=100
DEFAULT_PAGE_SIZE=20
```

**Dica**: Para gerar tokens seguros:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Passo 4: Adicionar Disco Persistente (Opcional)

Para persistir logs:

1. Na página do Web Service, vá em **"Disks"**
2. Clique em **"Add Disk"**
3. Configure:
   - **Name**: `nexus-logs`
   - **Mount Path**: `/app/logs`
   - **Size**: `1 GB`
4. Salve

#### Passo 5: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build e deploy (5-10 minutos)
3. Acompanhe os logs

---

## ✅ Verificação Pós-Deploy

### 1. Testar Health Check

```bash
curl https://seu-app.onrender.com/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T...",
  "uptime": 123.45
}
```

### 2. Testar Banco de Dados

Acesse o shell do serviço no Render:

```bash
npx prisma migrate status
```

Deve mostrar que todas as migrações foram aplicadas.

### 3. Criar Usuário Admin

Execute no shell do Render:

```bash
npm run create-admin
```

Siga as instruções para criar o primeiro usuário administrador.

### 4. Testar Login

```bash
curl -X POST https://seu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@exemplo.com",
    "password": "sua-senha"
  }'
```

---

## 🔧 Configurações Importantes

### WhatsApp Webhook

Após o deploy, configure o webhook no Meta Business:

1. Acesse [Meta Business Manager](https://business.facebook.com/)
2. Vá em **WhatsApp** → **Configuration** → **Webhooks**
3. Configure:
   - **Callback URL**: `https://seu-app.onrender.com/api/webhook/whatsapp`
   - **Verify Token**: (use o valor de `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
4. Subscreva aos eventos:
   - `messages`
   - `message_status`

### AWS S3 Bucket

Configure o bucket S3 com as permissões corretas:

1. **Bucket Policy** (permissões de leitura pública para relatórios):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::seu-bucket-name/*"
    }
  ]
}
```

2. **CORS Configuration**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://seu-app.onrender.com"],
    "ExposeHeaders": []
  }
]
```

---

## 📊 Monitoramento

### Logs em Tempo Real

No Dashboard do Render:
1. Acesse seu Web Service
2. Clique na aba **"Logs"**
3. Filtre por tipo de log (build, deploy, runtime)

### Métricas

Na aba **"Metrics"**:
- CPU Usage
- Memory Usage
- Request Count
- Response Time

### Alertas

Configure alertas em **Settings** → **Notifications**:
- Deploy failures
- Health check failures
- High error rate

---

## 🔄 Atualizações e Manutenção

### Deploy Automático

Com Auto-Deploy ativado, cada push para `main` dispara um novo deploy:

```bash
git add .
git commit -m "Feature: nova funcionalidade"
git push origin main
```

### Deploy Manual

No Dashboard do Render:
1. Clique em **"Manual Deploy"** → **"Deploy latest commit"**

### Rollback

Se algo der errado:
1. Vá em **"Events"**
2. Encontre um deploy anterior bem-sucedido
3. Clique em **"Rollback to this deploy"**

### Executar Migrações

Se adicionar novas migrações:

```bash
# 1. Commit e push as migrações
git add prisma/migrations/
git commit -m "Add new migration"
git push

# 2. O build.sh executará automaticamente:
# npx prisma migrate deploy
```

---

## 🐛 Solução de Problemas

### Build Failed

**Problema**: `Error: Cannot find module 'prisma'`

**Solução**: Certifique-se de que `prisma` está em `devDependencies`:
```json
{
  "devDependencies": {
    "prisma": "^5.7.0"
  }
}
```

### Database Connection Failed

**Problema**: `Error: Can't reach database server`

**Solução**: Verifique a `DATABASE_URL`:
1. Use a **Internal Database URL** do Render
2. Deve estar no formato: `postgresql://user:pass@host.render.com/dbname`

### WhatsApp Webhook Failed

**Problema**: Webhook não recebe mensagens

**Solução**:
1. Verifique se o `WHATSAPP_WEBHOOK_VERIFY_TOKEN` está correto
2. Teste o endpoint manualmente:
```bash
curl https://seu-app.onrender.com/api/webhook/whatsapp?hub.verify_token=SEU_TOKEN&hub.challenge=123
```

### Free Plan Sleep

**Problema**: Render Free Plan desliga após 15 minutos de inatividade

**Soluções**:
1. **Upgrade para Paid Plan**: $7/mês, sempre ativo
2. **Usar Cron Job externo**: Ping a cada 10 minutos
3. **UptimeRobot**: Monitora e mantém ativo (gratuito)

---

## 💰 Custos Estimados

### Plano Gratuito (Free)
- **Web Service**: Free (750 horas/mês)
- **PostgreSQL**: Free (90 dias, depois $7/mês)
- **Total**: $0 (primeiros 3 meses), depois $7/mês

### Plano Recomendado (Produção)
- **Web Service Starter**: $7/mês (sempre ativo)
- **PostgreSQL Starter**: $7/mês (256MB RAM)
- **Total**: $14/mês

### Plano Escalável
- **Web Service Standard**: $25/mês
- **PostgreSQL Standard**: $20/mês
- **Total**: $45/mês

---

## 🔒 Segurança em Produção

### 1. Variáveis de Ambiente

✅ **NUNCA** commite arquivos `.env` no Git
✅ Use variáveis secretas do Render
✅ Rotacione tokens regularmente

### 2. HTTPS

✅ Render fornece HTTPS automaticamente
✅ Todos os requests são criptografados
✅ Certificados SSL gerenciados automaticamente

### 3. Rate Limiting

Já configurado no código (`src/server.js`):
- 100 requisições por IP a cada 15 minutos

### 4. Headers de Segurança

Configurado com Helmet.js:
- CSP (Content Security Policy)
- XSS Protection
- HSTS

---

## 📚 Recursos Adicionais

- [Render Docs](https://render.com/docs)
- [Render Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** no Dashboard do Render
2. **Consulte este guia** novamente
3. **Teste localmente** com Docker antes de fazer deploy
4. **Abra uma issue** no repositório com:
   - Logs de erro
   - Passos para reproduzir
   - Configuração (sem expor credenciais!)

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Health check retorna `200 OK`
- [ ] Banco de dados conectado
- [ ] Migrações aplicadas
- [ ] Usuário admin criado
- [ ] Login funcionando
- [ ] WhatsApp webhook configurado e testado
- [ ] S3 upload testado
- [ ] API de IA funcionando
- [ ] Logs sendo gravados
- [ ] Monitoramento configurado

---

**🎉 Parabéns! Sua API Nexus está no ar!**

URL do seu app: `https://nexus-api.onrender.com` (ou o nome que você escolheu)
