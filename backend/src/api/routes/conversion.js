const express = require('express');
const router = express.Router();
const ConversionService = require('../../services/ConversionService');

// RUTA PARA CARGAR UNA REGLA
router.post('/regla', async (req, res) => {
  try {
    const key = await ConversionService.guardarRegla(req.body);
    res.json({ mensaje: "Regla guardada con éxito", redisKey: key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA PARA CONVERTIR UNA NOTA (Uso académico)
router.get('/convertir', async (req, res) => {
  try {
    const { origen, destino, nota } = req.query;

    // Validación de presencia de datos
    if (!origen || !destino || !nota) {
      return res.status(400).json({ error: "Faltan parámetros requeridos: origen, destino y nota." });
    }

    const resultado = await ConversionService.convertirNota(origen, destino, nota);
    res.json(resultado);
  } catch (error) {
    const status = error.message.includes("No existe") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

// RUTA PARA OBTENER TODAS LAS REGLAS (Para el Accordion del Front)
router.get('/', async (req, res) => {
  try {
    const reglas = await ConversionService.obtenerTodas();
    res.json(reglas);
  } catch (error) {
    res.status(500).json({ error: "Error al recuperar la matriz de conversión" });
  }
});

module.exports = router;