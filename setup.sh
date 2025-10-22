#!/bin/bash

# Script de inicialização do Nexus API
# Configura e inicia o projeto completo

echo "🚀 Nexus API - Inicialização"
echo "=============================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo "Instale Docker em: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo "Instale Docker Compose em: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker instalado${NC}"

# Verifica se .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ Arquivo .env não encontrado${NC}"
    echo "Copiando .env.example para .env..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ IMPORTANTE: Edite o arquivo .env com suas credenciais!${NC}"
    echo "Pressione Enter para continuar após configurar o .env..."
    read
fi

echo -e "${GREEN}✓ Arquivo .env configurado${NC}"

# Para containers existentes
echo ""
echo "Parando containers existentes..."
docker-compose down

# Inicia serviços
echo ""
echo "Iniciando serviços..."
docker-compose up -d

# Aguarda PostgreSQL inicializar
echo ""
echo "Aguardando PostgreSQL inicializar..."
sleep 10

# Verifica status dos serviços
echo ""
echo "Verificando status dos serviços..."
docker-compose ps

# Executa migrations
echo ""
echo "Executando migrations do Prisma..."
docker-compose exec -T api npx prisma generate
docker-compose exec -T api npx prisma migrate dev --name init

echo ""
echo -e "${GREEN}=============================="
echo "✓ Inicialização concluída!"
echo "==============================${NC}"
echo ""
echo "📡 Serviços disponíveis:"
echo "  - API: http://localhost:3000"
echo "  - PgAdmin: http://localhost:5050 (admin@nexus.com / admin)"
echo ""
echo "🧪 Teste a API:"
echo "  curl http://localhost:3000/health"
echo ""
echo "📖 Documentação:"
echo "  - README.md - Documentação completa"
echo "  - QUICKSTART.md - Guia rápido"
echo "  - API_EXAMPLES.md - Exemplos de requisições"
echo ""
echo "📝 Ver logs:"
echo "  docker-compose logs -f api"
echo ""
echo "🛑 Parar serviços:"
echo "  docker-compose down"
echo ""
