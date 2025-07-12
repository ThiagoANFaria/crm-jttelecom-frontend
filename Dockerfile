# Dockerfile para Frontend React - Versão Corrigida
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Construir aplicação para produção
RUN npm run build:prod

# Instalar servidor estático
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Comando para servir arquivos estáticos
CMD ["serve", "-s", "dist", "-l", "3000"]
