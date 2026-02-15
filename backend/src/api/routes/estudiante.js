const express = require('express');
const router = express.Router();
const OnboardingService = require('../../services/OnboardingService');

// POST /api/estudiante
router.post('/', async (req, res) => {
  try {
    const nuevoEstudiante = await OnboardingService.registrarEstudiante(req.body);
    res.status(201).json(nuevoEstudiante);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { buscar } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let resultado;

    if (buscar) {
      // Si hay un término, usamos la lógica de búsqueda
      resultado = await OnboardingService.buscarEstudiantePorNombre(buscar, limit, skip);
    } else {
      // Si no, traemos el listado general
      resultado = await OnboardingService.obtenerEstudiantesPaginados(limit, skip);
    }

    res.json({
      estudiantes: resultado.data,
      total: resultado.total,
      page,
      pages: Math.ceil(resultado.total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const actualizado = await OnboardingService.actualizarEstudiante(req.params.id, req.body);
  res.json(actualizado);
});

router.delete('/:id', async (req, res) => {
  await OnboardingService.eliminarEstudiante(req.params.id);
  res.status(204).send();
});

module.exports = router;