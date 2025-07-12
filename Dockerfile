# Dockerfile para Frontend React/TypeScript do CRM JT Telecom
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Construir aplicação para produção
RUN npm run build

# Instalar servidor estático
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Comando para iniciar aplicação
CMD ["serve", "-s", "dist", "-l", "3000"]
