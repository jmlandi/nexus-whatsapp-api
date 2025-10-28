#!/bin/bash

# Script de inicialização do Nexus
# Este script sobe o banco de dados, aplica migrations e inicia o servidor

set -e

echo "🔷 Nexus - Inicialização"
echo "========================"
echo ""

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
  exit 1
fi

echo "✅ Docker está rodando"
echo ""

# Sobe o banco de dados
echo "📦 Subindo banco de dados PostgreSQL..."
docker-compose -f docker-compose.db.yml up -d

echo ""
echo "⏳ Aguardando banco de dados iniciar..."
sleep 5

# Verifica se o banco está rodando
if docker-compose -f docker-compose.db.yml ps | grep -q "postgres.*Up"; then
  echo "✅ Banco de dados está rodando"
else
  echo "❌ Erro ao iniciar banco de dados"
  exit 1
fi

echo ""
echo "🔄 Gerando Prisma Client..."
npx prisma generate

echo ""
echo "📝 Aplicando migrations..."
npx prisma migrate deploy

echo ""
echo "✨ Setup completo!"
echo ""
echo "📊 Acesse o PgAdmin em: http://localhost:5050"
echo "   Email: admin@nexus.com"
echo "   Senha: admin"
echo ""
echo "🚀 Para iniciar o servidor, execute: npm run dev"
echo ""
