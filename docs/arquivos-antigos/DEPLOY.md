# Guia de Deploy - Nexus API

Este guia mostra como fazer deploy da aplicação em ambiente de produção.

## 📋 Pré-requisitos

- Servidor com Docker e Docker Compose instalados
- Domínio configurado (ex: api.nexus.com)
- Certificado SSL/TLS (recomendado: Let's Encrypt)
- Contas configuradas:
  - AWS S3
  - Twilio WhatsApp
  - Servidor PostgreSQL (ou usar container)

## 🚀 Deploy com Docker

### 1. Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Clonar Projeto

```bash
cd /var/www
git clone <seu-repositorio> nexus
cd nexus
```

### 3. Configurar Ambiente

```bash
# Copiar e editar .env
cp .env.example .env
nano .env

# Configurar variáveis de produção:
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@postgres:5432/nexus_db
# ... demais variáveis
```

### 4. Build e Start

```bash
# Build da imagem
docker-compose build

# Iniciar serviços
docker-compose up -d

# Executar migrations
docker-compose exec api npx prisma migrate deploy

# Verificar logs
docker-compose logs -f api
```

### 5. Configurar Nginx (Proxy Reverso)

```nginx
# /etc/nginx/sites-available/nexus

server {
    listen 80;
    server_name api.nexus.com;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.nexus.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/api.nexus.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nexus.com/privkey.pem;

    # Logs
    access_log /var/log/nginx/nexus_access.log;
    error_log /var/log/nginx/nexus_error.log;

    # Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Webhook Twilio (sem rate limit)
    location /api/message {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # IP Whitelist Twilio (opcional)
        # allow 54.172.60.0/23;
        # allow 54.244.51.0/24;
        # deny all;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d api.nexus.com

# Renovação automática (já configurado pelo Certbot)
sudo certbot renew --dry-run
```

## 🔐 Segurança em Produção

### 1. Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 2. Variáveis Sensíveis

```bash
# Nunca commite .env
# Use secrets manager em produção (AWS Secrets Manager, etc)

# Restringir permissões
chmod 600 .env
```

### 3. Rate Limiting

Já implementado na aplicação, mas ajuste conforme necessário em `src/server.js`.

### 4. Validação Webhook Twilio

Adicione validação de assinatura Twilio no webhook (recomendado para produção).

## 📊 Monitoramento

### 1. Logs

```bash
# Logs da aplicação
docker-compose logs -f api

# Logs do Nginx
tail -f /var/log/nginx/nexus_access.log
tail -f /var/log/nginx/nexus_error.log

# Logs do Docker
docker logs nexus-api --tail 100 -f
```

### 2. Health Check

Configure monitoring externo (ex: UptimeRobot, Pingdom):
- Endpoint: https://api.nexus.com/health
- Intervalo: 5 minutos

### 3. Alertas

Configure alertas para:
- API offline
- Uso alto de memória/CPU
- Erros no log
- Falhas no banco de dados

## 🔄 Atualizações

### Processo de Update

```bash
# 1. Pull código atualizado
cd /var/www/nexus
git pull origin main

# 2. Rebuild (se houve mudanças no Dockerfile/deps)
docker-compose build api

# 3. Executar migrations (se houver)
docker-compose exec api npx prisma migrate deploy

# 4. Restart sem downtime
docker-compose up -d --no-deps --build api

# 5. Verificar
docker-compose logs -f api
curl https://api.nexus.com/health
```

### Zero Downtime Deploy

Para deploys sem downtime, use:
- Blue-Green deployment
- Rolling updates
- Load balancer

## 💾 Backup

### 1. Backup Banco de Dados

```bash
# Script de backup diário
#!/bin/bash
# /usr/local/bin/backup-nexus.sh

BACKUP_DIR="/backups/nexus"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar backup
docker exec nexus-postgres pg_dump -U nexus_user nexus_db | gzip > "$BACKUP_DIR/nexus_$DATE.sql.gz"

# Manter apenas últimos 30 dias
find "$BACKUP_DIR" -name "nexus_*.sql.gz" -mtime +30 -delete

echo "Backup concluído: nexus_$DATE.sql.gz"
```

```bash
# Agendar com cron (diário às 3h)
sudo crontab -e
0 3 * * * /usr/local/bin/backup-nexus.sh
```

### 2. Backup Aplicação

```bash
# Backup do código e configurações
tar -czf nexus_app_$(date +%Y%m%d).tar.gz \
  /var/www/nexus \
  --exclude=node_modules \
  --exclude=.git
```

### 3. Restore

```bash
# Restore do banco
gunzip < backup.sql.gz | docker exec -i nexus-postgres psql -U nexus_user nexus_db
```

## 🔧 Configuração Twilio em Produção

1. Acesse https://console.twilio.com
2. Vá em Messaging > Settings > WhatsApp
3. Configure webhook:
   - **URL**: `https://api.nexus.com/api/message`
   - **Método**: POST
4. Configure fallback URL
5. Adicione IP whitelist se necessário

## ☁️ Deploy em Cloud Providers

### AWS (ECS/Fargate)

1. Push imagem para ECR
2. Crie Task Definition
3. Configure Service com Load Balancer
4. Configure RDS PostgreSQL
5. Use Parameter Store para secrets

### Digital Ocean (App Platform)

1. Conecte repositório GitHub
2. Configure variáveis de ambiente
3. Configure banco gerenciado
4. Deploy automático

### Heroku

```bash
# Login
heroku login

# Criar app
heroku create nexus-api

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configure variáveis
heroku config:set TWILIO_ACCOUNT_SID=xxx
heroku config:set AWS_ACCESS_KEY_ID=xxx
# ... outras variáveis

# Deploy
git push heroku main

# Executar migrations
heroku run npx prisma migrate deploy
```

## 📈 Escalabilidade

### Horizontal Scaling

```yaml
# docker-compose.yml para produção
version: '3.8'

services:
  api:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Load Balancer

Use Nginx, HAProxy ou ALB (AWS) para distribuir carga entre múltiplas instâncias.

## 🐛 Troubleshooting Produção

### API não responde

```bash
# Verificar status
docker-compose ps

# Verificar logs
docker-compose logs api --tail 100

# Restart
docker-compose restart api
```

### Erro de conexão DB

```bash
# Verificar PostgreSQL
docker-compose exec postgres psql -U nexus_user -d nexus_db -c "SELECT 1;"

# Verificar logs
docker-compose logs postgres
```

### Alto uso de memória

```bash
# Verificar recursos
docker stats

# Limpar recursos não usados
docker system prune -a
```

## 📞 Suporte

Para questões de produção:
- Email: devops@wn7.com
- Slack: #nexus-production

---

**Checklist de Deploy:**
- [ ] Servidor configurado
- [ ] Docker instalado
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] Migrations executadas
- [ ] SSL configurado
- [ ] Nginx configurado
- [ ] Twilio webhook configurado
- [ ] S3 bucket criado
- [ ] Backups agendados
- [ ] Monitoring configurado
- [ ] Health check funcionando
- [ ] Logs verificados
