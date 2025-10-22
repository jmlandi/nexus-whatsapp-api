FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm install

# Gera cliente Prisma
RUN npx prisma generate

# Copia código da aplicação
COPY . .

# Cria diretório de logs
RUN mkdir -p logs

# Expõe porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
