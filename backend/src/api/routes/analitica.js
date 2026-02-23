const express = require('express');
const router = express.Router();
const AnaliticaService = require('../../services/AnaliticaService');

// Reporte por institución
router.get('/institucion/:id/:anio', async (req, res) => {
    try {
        const data = await AnaliticaService.getReporteInstitucion(req.params.id, req.params.anio);
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Detección de desvíos
router.get('/desvios/:contexto/:anio', async (req, res) => {
    try {
        const data = await AnaliticaService.analizarDesvios(req.params.contexto, req.params.anio);
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Reporte de eventos de auditoría
router.get('/auditoria/eventos', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const data = await AnaliticaService.getAuditoria(limit);
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;