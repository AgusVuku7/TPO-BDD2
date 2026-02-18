const express = require('express');
const router = express.Router();
const TrayectoriaService = require('../../services/TrayectoriaService');

// --- RUTAS PARA MATERIAS ---
router.post('/:id/materia', async (req, res) => {
    try {
        const { materiaId, nota, anio } = req.body;
        await TrayectoriaService.registrarTrayectoriaMateria(req.params.id, { materiaId, nota, anio });
        res.status(201).json({ mensaje: "Materia registrada en la trayectoria del estudiante" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id/materias', async (req, res) => {
    try {
        const historial = await TrayectoriaService.obtenerTrayectoriaMateria(req.params.id);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/materia/:materiaId', async (req, res) => {
    try {
        await TrayectoriaService.actualizarTrayectoriaMateria(req.params.id, req.params.materiaId, req.body);
        res.json({ mensaje: "Materia actualizada en la trayectoria" });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/:id/materia/:materiaId', async (req, res) => {
    try {
        await TrayectoriaService.eliminarTrayectoriaMateria(req.params.id, req.params.materiaId);
        res.status(204).send();
    } catch (error) { res.status(500).json({ error: error.message }); }
});


// --- RUTAS PARA INSTITUCIONES ---
router.post('/:id/institucion', async (req, res) => {
    try {
        // req.params.id es el ID del estudiante
        const resultado = await TrayectoriaService.registrarTrayectoriaInstitucion(req.params.id, req.body);
        res.status(201).json({ mensaje: "Asistencia a institución registrada en el grafo" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id/instituciones', async (req, res) => {
    try {
        const historial = await TrayectoriaService.obtenerTrayectoriaInstitucion(req.params.id);
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/institucion/:institucionId', async (req, res) => {
    try {
        await TrayectoriaService.actualizarTrayectoriaInstitucion(req.params.id, req.params.institucionId, req.body);
        res.json({ mensaje: "Historial institucional actualizado" });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/:id/institucion/:institucionId', async (req, res) => {
    try {
        await TrayectoriaService.eliminarTrayectoriaInstitucion(req.params.id, req.params.institucionId);
        res.status(204).send();
    } catch (error) { res.status(500).json({ error: error.message }); }
});


module.exports = router;