# Dockerfile para Frontend React/TypeScript do CRM JT Telecom
FROM node:18-alpine

# Aumentar limite de memória para o Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --verbose

# Copiar código fonte
COPY . .

# Construir aplicação para produção (com mais verbosidade para debug)
RUN npm run build --verbose

# Instalar servidor estático
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Comando para iniciar aplicação
CMD ["serve", "-s", "dist", "-l", "3000"]
