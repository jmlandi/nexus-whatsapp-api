# 🚀 NEXUS API - Início Imediato

> **API de Automação WhatsApp com IA para Relatórios de Marketing**

## ⚡ Começar AGORA (3 comandos)

```bash
# 1. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Twilio e AWS

# 2. Inicie tudo com Docker
chmod +x setup.sh
./setup.sh

# 3. Teste
curl http://localhost:3000/health
```

✅ **Pronto!** API rodando em http://localhost:3000

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| **[README.md](README.md)** | 📖 Documentação completa da API |
| **[QUICKSTART.md](QUICKSTART.md)** | ⚡ Guia rápido de 5 minutos |
| **[API_EXAMPLES.md](API_EXAMPLES.md)** | 💻 Exemplos de todas as requisições |
| **[DEPLOY.md](DEPLOY.md)** | 🚀 Como fazer deploy em produção |
| **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** | 🏗️ Estrutura e arquitetura |

---

## 🎯 O que esta API faz?

1. **Gerencia clientes** e números de telefone WhatsApp
2. **Armazena relatórios PDF** de marketing no AWS S3
3. **Envia mensagens** via Twilio WhatsApp
4. **Recebe e processa mensagens** dos clientes
5. **Gerencia chats** com abertura/fechamento automático
6. Pronto para **integração com IA** (próxima fase)

---

## 🔑 Rotas Principais

### Clientes
```bash
GET    /api/customer              # Listar todos
POST   /api/customer              # Criar clientes
GET    /api/customer?id={id}      # Buscar um
PUT    /api/customer?id={id}      # Atualizar
DELETE /api/customer?id={id}      # Remover
```

### Chats
```bash
GET    /api/chat                     # Listar chats
POST   /api/chat/send-template      # Iniciar chat com template
POST   /api/chat/close-chat         # Fechar chat
```

### Mensagens
```bash
GET    /api/message?chat_id={id}    # Mensagens de um chat
POST   /api/message                 # Webhook Twilio (automático)
```

### Relatórios
```bash
GET    /api/report                  # Listar relatórios
POST   /api/report                  # Upload de PDF para S3
```

📖 **Veja [API_EXAMPLES.md](API_EXAMPLES.md) para exemplos completos**

---

## 🛠️ Tecnologias

- **Node.js** + Express
- **PostgreSQL** + Prisma ORM
- **Twilio** (WhatsApp)
- **AWS S3** (Armazenamento)
- **Docker** + Docker Compose

---

## 📋 Pré-requisitos

Você precisa de:
- ✅ Docker e Docker Compose instalados
- ✅ Conta Twilio com WhatsApp configurado
- ✅ Conta AWS com bucket S3
- ✅ Node.js 18+ (opcional, para desenvolvimento)

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f api

# Parar tudo
docker-compose down

# Reconstruir após mudanças
docker-compose build api
docker-compose up -d

# Abrir interface visual do banco
docker-compose exec api npx prisma studio
# Acesse: http://localhost:5555

# Executar migrations
docker-compose exec api npx prisma migrate dev
```

---

## 🧪 Testar Rapidamente

```bash
# 1. Criar um cliente
curl -X POST http://localhost:3000/api/customer \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [{
      "firstName": "João",
      "lastName": "Silva",
      "phoneNumbers": ["+5511999999999"]
    }]
  }'

# 2. Listar clientes
curl http://localhost:3000/api/customer

# 3. Verificar logs
docker-compose logs -f api
```

---

## 🌐 Interfaces Disponíveis

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **API** | http://localhost:3000 | - |
| **PgAdmin** | http://localhost:5050 | admin@nexus.com / admin |
| **Prisma Studio** | http://localhost:5555 | - |

---

## 🐛 Problemas Comuns

### "Conexão recusada"
```bash
# Aguarde ~30s para serviços iniciarem
docker-compose ps

# Ou reinicie
docker-compose restart
```

### "Erro ao rodar migrations"
```bash
# Limpe e reinicie
docker-compose down -v
docker-compose up -d
sleep 30
docker-compose exec api npx prisma migrate dev --name init
```

### "Twilio/S3 não funciona"
- Verifique credenciais no arquivo `.env`
- Certifique-se que bucket S3 existe
- Verifique se número Twilio está ativo

---

## 🚀 Próximos Passos

1. ✅ **Configure o webhook do Twilio**
   - URL: `https://seu-dominio.com/api/message`
   - Use [ngrok](https://ngrok.com) para testes locais

2. ✅ **Teste o fluxo completo**
   - Crie cliente
   - Envie template
   - Responda no WhatsApp
   - Veja mensagem no banco

3. ✅ **Integre com IA**
   - OpenAI, Anthropic, etc.
   - Processe PDFs dos relatórios
   - Gere respostas contextualizadas

---

## 📞 Suporte

- 📧 Email: suporte@wn7.com
- 📖 Documentação: Veja arquivos `.md` neste projeto
- 🐛 Issues: Abra issue no repositório

---

## 📄 Licença

MIT License - Livre para uso comercial e pessoal

---

## 🎉 Pronto para começar?

```bash
./setup.sh
```

**Desenvolvido com ❤️ para WN7 Agência de Marketing Digital**

---

## 📊 Status do Projeto

- ✅ MVP Completo
- ✅ CRUD de todas entidades
- ✅ Integração Twilio funcional
- ✅ Integração S3 funcional
- ✅ Chat com auto-fechamento
- ✅ Docker configurado
- ✅ Documentação completa
- 🚧 Integração com IA (próxima fase)
- 📅 Dashboard web (planejado)
- 📅 Analytics (planejado)

**Versão:** 1.0.0 | **Data:** Outubro 2024
