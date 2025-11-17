FROM node:18-alpine

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl libc6-compat

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia schema do Prisma
COPY prisma ./prisma/

# Gera cliente Prisma
RUN npx prisma generate

# Copia código da aplicação e arquivos públicos
COPY src ./src
COPY public ./public
COPY scripts ./scripts

# Cria diretório de logs
RUN mkdir -p logs

# Expõe porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
