#!/bin/bash

# Script para parar o banco de dados

echo "🛑 Parando banco de dados..."
docker-compose -f docker-compose.db.yml down

echo "✅ Banco de dados parado"
