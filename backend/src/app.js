const express = require('express');
const cors = require('cors');
const studentRoutes = require('./api/routes/estudiante');
const institutionRoutes = require('./api/routes/institucion');
const materiaRoutes = require('./api/routes/materia');

const app = express();

// Middlewares
app.use(cors({
     origin: 'http://localhost:5173'
}));
app.use(express.json());

// Rutas base
app.use('/api/estudiante', studentRoutes);
app.use('/api/institucion', institutionRoutes);
app.use('/api/materia', materiaRoutes);

module.exports = app;