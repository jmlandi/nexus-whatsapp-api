# Deploy em Produção

Guia para fazer deploy da Nexus API em ambiente de produção.

## 📋 Pré-requisitos

- Servidor com Docker e Docker Compose
- Domínio configurado (ex: api.nexus.com)
- Certificado SSL/TLS (Let's Encrypt recomendado)
- Contas configuradas: AWS S3, Twilio, Anthropic

## 🚀 Deploy com Docker

### 1. Preparar Servidor

```bash
# Atualizar sistema (Ubuntu/Debian)
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

### 2. Clonar e Configurar

```bash
# Criar diretório
sudo mkdir -p /var/www
cd /var/www

# Clonar repositório
git clone <seu-repositorio> nexus
cd nexus

# Configurar ambiente de produção
cp .env.example .env
nano .env
```

**Variáveis importantes para produção:**

```bash
NODE_ENV=production
PORT=3000

# Database (considere usar RDS ou servidor externo)
DATABASE_URL=postgresql://user:pass@postgres:5432/nexus_db

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=xxxxxx
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# AWS S3
AWS_ACCESS_KEY_ID=AKIAxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxx
AWS_S3_BUCKET_NAME=nexus-reports-prod
AWS_REGION=us-east-1

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxxx

# Segurança
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Cron
INACTIVE_CHAT_HOURS=72
```

### 3. Iniciar Serviços

```bash
# Build da imagem
docker-compose build

# Iniciar em background
docker-compose up -d

# Aplicar migrations (IMPORTANTE!)
docker-compose exec api npx prisma migrate deploy

# Verificar logs
docker-compose logs -f api
```

### 4. Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/nexus
```

**Configuração do Nginx:**

```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name api.nexus.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name api.nexus.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/api.nexus.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nexus.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logs
    access_log /var/log/nginx/nexus_access.log;
    error_log /var/log/nginx/nexus_error.log;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy para API
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

    # Health check sem log
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 5. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d api.nexus.com

# Certbot configura automaticamente o Nginx
# Certificado será renovado automaticamente
```

## 🔧 Configurações Adicionais

### Webhook do Twilio

Configure o webhook do Twilio para apontar para seu domínio:

```
URL: https://api.nexus.com/api/message
Method: POST
```

### Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Backup Automático do Banco

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-nexus-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/nexus"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose -f /var/www/nexus/docker-compose.yml exec -T postgres \
  pg_dump -U nexus_user nexus_db | gzip > $BACKUP_DIR/nexus_$DATE.sql.gz

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "nexus_*.sql.gz" -mtime +7 -delete
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-nexus-db.sh

# Adicionar ao crontab (diariamente às 2h)
sudo crontab -e
# Adicionar linha:
0 2 * * * /usr/local/bin/backup-nexus-db.sh
```

### Monitoramento com Logs

```bash
# Ver logs em tempo real
docker-compose logs -f api

# Últimas 100 linhas
docker-compose logs --tail=100 api

# Logs específicos
docker-compose logs api | grep ERROR
```

### Restart Automático

O Docker já está configurado para restart automático (`restart: unless-stopped` no docker-compose.yml).

Para garantir que os containers iniciem no boot:

```bash
sudo systemctl enable docker
```

## 🔄 Atualizar a Aplicação

```bash
cd /var/www/nexus

# 1. Backup do banco (precaução)
/usr/local/bin/backup-nexus-db.sh

# 2. Pull das mudanças
git pull origin main

# 3. Rebuild da imagem
docker-compose build api

# 4. Aplicar migrations (se houver)
docker-compose exec api npx prisma migrate deploy

# 5. Restart
docker-compose restart api

# 6. Verificar
docker-compose logs -f api
```

## 🗄 Banco de Dados em Produção

### Opção 1: PostgreSQL em Container (atual)

Já configurado no `docker-compose.yml`. Para produção, configure volumes persistentes:

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/nexus/postgres
```

### Opção 2: PostgreSQL Externo (recomendado)

Use serviços gerenciados como:
- **AWS RDS** (PostgreSQL)
- **DigitalOcean Managed Database**
- **Heroku Postgres**
- **Supabase**

Vantagens:
- Backups automáticos
- Alta disponibilidade
- Escalabilidade
- Monitoramento

Configure no `.env`:

```bash
DATABASE_URL=postgresql://user:pass@host.rds.amazonaws.com:5432/nexus_db
```

## 📊 Monitoramento e Saúde

### Verificar Status

```bash
# Health check
curl https://api.nexus.com/health

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats
```

### Métricas Importantes

- Uptime da aplicação
- Tempo de resposta da API
- Taxa de erros (logs)
- Uso de memória/CPU
- Espaço em disco

### Ferramentas Recomendadas

- **Uptimerobot**: Monitoramento de uptime
- **Sentry**: Rastreamento de erros
- **Datadog/New Relic**: APM completo
- **Prometheus + Grafana**: Métricas customizadas

## 🐛 Troubleshooting

### API não responde

```bash
# Verificar se container está rodando
docker-compose ps

# Reiniciar API
docker-compose restart api

# Ver logs de erro
docker-compose logs api | grep -i error
```

### Erro de conexão com banco

```bash
# Verificar PostgreSQL
docker-compose ps postgres

# Verificar conexão
docker-compose exec postgres psql -U nexus_user -d nexus_db -c "SELECT 1;"

# Reiniciar banco
docker-compose restart postgres
```

### Erro 502 Bad Gateway (Nginx)

```bash
# Verificar se API está rodando
curl http://localhost:3000/health

# Ver logs do Nginx
sudo tail -f /var/log/nginx/nexus_error.log

# Testar configuração Nginx
sudo nginx -t
```

### Disco cheio

```bash
# Ver uso de disco
df -h

# Limpar containers antigos
docker system prune -a

# Limpar logs antigos
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

## 🔐 Segurança em Produção

### Checklist

- [ ] Firewall configurado (apenas portas necessárias)
- [ ] SSL/TLS configurado (HTTPS)
- [ ] Senhas fortes no .env
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Backups automáticos configurados
- [ ] Logs sendo monitorados
- [ ] Atualizações de segurança automáticas
- [ ] Variáveis de ambiente seguras (não no código)
- [ ] Webhook do Twilio com validação

### Manter Sistema Atualizado

```bash
# Atualizações automáticas (Ubuntu)
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 Escalabilidade

Para escalar a aplicação:

1. **Load Balancer**: Nginx ou AWS ELB
2. **Múltiplas Instâncias**: Docker Swarm ou Kubernetes
3. **Cache**: Redis para sessões/cache
4. **CDN**: CloudFront para assets estáticos
5. **Banco Escalável**: RDS com read replicas

## ✅ Checklist de Deploy

- [ ] Servidor configurado com Docker
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Containers iniciados (docker-compose up -d)
- [ ] Migrations aplicadas (prisma migrate deploy)
- [ ] Nginx configurado e testado
- [ ] SSL configurado (Let's Encrypt)
- [ ] Webhook Twilio configurado
- [ ] Firewall configurado
- [ ] Backups configurados
- [ ] Monitoramento configurado
- [ ] Teste end-to-end realizado
- [ ] Documentação atualizada

## 🎉 Deploy Concluído!

Após seguir todos os passos, sua API estará rodando em produção.

**Testes finais:**

```bash
# 1. Health check
curl https://api.nexus.com/health

# 2. Criar cliente
curl -X POST https://api.nexus.com/api/customer \
  -H "Content-Type: application/json" \
  -d '{"customers":[{"firstName":"Test","lastName":"User","phoneNumbers":["+5511999999999"]}]}'

# 3. Enviar mensagem de teste via WhatsApp
# O webhook deve processar automaticamente
```

Monitorar logs por alguns dias para garantir estabilidade:

```bash
docker-compose logs -f api
```
