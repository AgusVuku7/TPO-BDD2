# 1. Usar una imagen base de Node.js (versión ligera)
FROM node:20-alpine

# 2. Crear carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar solo los archivos de dependencias primero (para aprovechar caché)
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Instalar nodemon globalmente para que se reinicie al guardar cambios
RUN npm install -g nodemon

# 6. Copiar el resto del código
COPY . .

# 7. Exponer el puerto que usa Express
EXPOSE 3000

# 8. Comando para iniciar en modo desarrollo
CMD ["nodemon", "index.js"]