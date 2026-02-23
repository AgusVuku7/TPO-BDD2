const express = require('express');
const cors = require('cors');
const studentRoutes = require('./api/routes/estudiante');
const institutionRoutes = require('./api/routes/institucion');
const materiaRoutes = require('./api/routes/materia');
const conversionRoutes = require('./api/routes/conversion');
const trajectoryRoutes = require('./api/routes/trayectoria');
const analisticaRoutes = require('./api/routes/analitica');

const app = express();

// Para permitir peticiones desde http://localhost:5173 (donde corre el frontend)
app.use(cors({
     origin: 'http://localhost:5173'
}));

// Para que el servidor pueda entender y procesar automáticamente los datos que vienen en formato JSON de las solcitudes HTTP
app.use(express.json());

// Definición de Rutas Base
app.use('/api/estudiante', studentRoutes);
app.use('/api/institucion', institutionRoutes);
app.use('/api/materia', materiaRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/trayectoria', trajectoryRoutes);
app.use('/api/analitica', analisticaRoutes);

module.exports = app;