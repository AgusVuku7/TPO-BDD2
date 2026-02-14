# 1. Usar imagen base
FROM node:20-alpine

# 2. Carpeta de trabajo
WORKDIR /app

# 3. Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# 4. Copiar código fuente
COPY . .

# 5. Exponer el puerto de Vite (por defecto 5173)
EXPOSE 5173

# 6. Iniciar servidor de desarrollo exponiendo a la red de Docker (--host)
CMD ["npm", "run", "dev", "--", "--host"]