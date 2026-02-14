const express = require('express');
const cors = require('cors');
const studentRoutes = require('./api/routes/estudiante');

const app = express();

// Middlewares
app.use(cors({
     origin: 'http://localhost:5173'
}));
app.use(express.json());

// Rutas base para EduGrade
app.use('/api/estudiante', studentRoutes);
// app.use('/api/institutions', institutionRoutes);

module.exports = app;