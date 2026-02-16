
cd frontend y correr npm install
Despues cd ..
cd backend y correr npm install

Abrir Docker Desktop

Abre tu terminal en la carpeta raíz (tpo-edu-grade) y ejecuta:
docker-compose up --build

Si no se añadió ninguna libreria nueva o si no se modificó el Dockerfile, solo correr:
docker-compose up


Para ver tu app:

Frontend: Abrir http://localhost:5173

Backend: Abrir http://localhost:3000

Neo4j Browser: 
Username: neo4j
Password: password
Abrir http://localhost:7474


//----------------
Entrar a mongo y ver coleccion:
docker exec -it tpo-bdd2-mongo-1 mongosh
use edugrade
db.students.find().pretty()

show collections // para ver nombre de las colecciones

//---------------
Correr script de reglas de conversion a redis

ir a cd backend y correr:
docker exec -it tpo-bdd2-backend-1 node src/scripts/seedRedis.js


//---------------
GIT:

// SUBIR
git checkout -b [nombre de la branch] // agus, lean o valen
git add .
git commit -m "[comentario]"
git push origin [nombre de la branch]

Ir a github de google y click en Compare and pull request, seguir..

// TRAER
git pull origin main


