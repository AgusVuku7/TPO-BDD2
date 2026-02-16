const express = require('express');
const router = express.Router();
const ConversionService = require('../../services/ConversionService');

// RUTA PARA CARGAR UNA REGLA (Uso administrativo/seeding)
router.post('/regla', async (req, res) => {
  try {
    const key = await ConversionService.guardarRegla(req.body);
    res.json({ mensaje: "Regla guardada con éxito", redisKey: key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA PARA CONVERTIR UNA NOTA (Uso académico)
// GET /api/conversion/convertir?origen=AR&destino=ZA&nota=9.5
router.get('/convertir', async (req, res) => {
  try {
    const { origen, destino, nota, version } = req.query;
    const resultado = await ConversionService.convertirNota(origen, destino, nota, version);
    res.json(resultado);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;