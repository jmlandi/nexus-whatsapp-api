# Guia Rápido de Inicialização - Nexus API

Este guia mostra como colocar o projeto em funcionamento rapidamente.

## 🚀 Início Rápido (5 minutos)

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha pelo menos:
- Credenciais Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
- Credenciais AWS (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME)

### 2. Inicie com Docker

```bash
# Inicia todos os serviços
docker-compose up -d

# Aguarde ~30 segundos para os serviços subirem

# Execute as migrations do banco
docker-compose exec api npx prisma migrate dev --name init

# Verifique os logs
docker-compose logs -f api
```

### 3. Teste a API

```bash
# Health check
curl http://localhost:3000/health

# Deve retornar: {"status":"ok","timestamp":"...","uptime":...}
```

### 4. Crie seu primeiro cliente

```bash
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "firstName": "João",
      "lastName": "Silva",
      "nickname": "Joãozinho",
      "phoneNumbers": ["+5511999999999"]
    }]
  }'
```

## 📱 Acesse as Interfaces

- **API**: http://localhost:3000
- **PgAdmin** (gerenciar banco): http://localhost:5050
  - Login: admin@nexus.com / admin
  - Para conectar ao PostgreSQL:
    - Host: postgres
    - Port: 5432
    - Database: nexus_db
    - Username: nexus_user
    - Password: nexus_password

- **Prisma Studio** (visualizar dados):
```bash
docker-compose exec api npx prisma studio
```
Acesse: http://localhost:5555

## 🔧 Comandos Úteis

### Docker

```bash
# Parar tudo
docker-compose down

# Reconstruir API
docker-compose build api

# Ver logs em tempo real
docker-compose logs -f

# Executar comando dentro do container
docker-compose exec api sh
```

### Prisma

```bash
# Dentro do container
docker-compose exec api npx prisma studio          # Interface visual
docker-compose exec api npx prisma migrate dev     # Nova migration
docker-compose exec api npx prisma generate        # Gerar cliente
docker-compose exec api npx prisma db push         # Sync schema (dev)
```

### Desenvolvimento

```bash
# Instalar dependências localmente (para IDE)
npm install

# Rodar sem Docker (necessita PostgreSQL local)
npm run dev

# Rodar em produção
npm start
```

## 📝 Próximos Passos

1. **Configure o Webhook do Twilio**
   - Acesse console.twilio.com
   - Vá em Messaging > WhatsApp
   - Configure webhook: `https://seu-dominio.com/api/message`
   - Use ngrok para testes locais: `ngrok http 3000`

2. **Teste o fluxo completo**
   - Crie um cliente via API
   - Envie template via `/api/chat/send-template`
   - Responda no WhatsApp
   - Veja a mensagem gravada no banco

3. **Personalize**
   - Ajuste timeout de chats em `.env` (CHAT_TIMEOUT_MINUTES)
   - Adicione templates customizados no Twilio
   - Integre com seu agente de IA

## 🐛 Problemas Comuns

### "Conexão recusada ao banco"
```bash
# Aguarde o banco inicializar completamente
docker-compose logs postgres

# Ou reinicie os serviços
docker-compose restart
```

### "Erro ao rodar migrations"
```bash
# Limpe o banco e rode novamente
docker-compose down -v
docker-compose up -d
# Aguarde 30s
docker-compose exec api npx prisma migrate dev --name init
```

### "Erro no Twilio/S3"
- Verifique se as credenciais estão corretas no `.env`
- Verifique se o bucket S3 existe e tem permissões
- Verifique se o número Twilio está ativo

## 📚 Documentação Completa

Veja README.md para documentação detalhada de todas as rotas e funcionalidades.

## 🎯 Estrutura do Primeiro Teste

1. **Criar Cliente** → POST `/api/customer`
2. **Criar Relatório** → POST `/api/report` (com PDF em base64)
3. **Enviar Template** → POST `/api/chat/send-template`
4. **Cliente responde no WhatsApp** → Webhook chama POST `/api/message`
5. **Ver mensagens** → GET `/api/message?chat_id={id}`
6. **Fechar chat** → POST `/api/chat/close-chat`

---

**Dica**: Use o PgAdmin ou Prisma Studio para visualizar os dados enquanto testa!
