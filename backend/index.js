require('dotenv').config();
const app = require('./src/app');
const { connectMongo } = require('./src/utils/DatabaseManager');
// const { connectNeo4j } = require('./src/utils/GraphManager');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Conectar Bases de Datos (Requisito Políglota)
    await connectMongo(); // Tu conexión actual
    // await connectNeo4j(); // Próximo paso

    // 2. Iniciar Servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor EduGrade corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el sistema:', error);
    process.exit(1);
  }
}

startServer();