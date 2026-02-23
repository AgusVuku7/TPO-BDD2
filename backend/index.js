require('dotenv').config();
const app = require('./src/app');

//Importamos la funcion que inicializa todas las bases
const { connectAll } = require('./src/utils/DatabaseManager');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Iniciando sistema EduGrade Global...');

    // Conectamos todas las bases juntas (Mongo + Neo4j + Redis + Cassandra)
    await connectAll(); 

    // Levantamos el servidor
    app.listen(PORT, () => {
      console.log(`📡 Servidor API escuchando en puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error fatal al iniciar el sistema:', error);
    process.exit(1);
  }
}

startServer();