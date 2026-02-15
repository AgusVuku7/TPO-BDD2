const express = require('express');
const router = express.Router();
const OnboardingService = require('../../services/OnboardingService');

// GET /api/institucion (Listado y Búsqueda)
router.get('/', async (req, res) => {
  try {
    const { buscar } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let resultado;

    if (buscar) {
      // Usa el nuevo método con parámetros de paginación
      resultado = await OnboardingService.buscarInstitucionPorNombre(buscar, limit, skip);
    } else {
      // Listado general paginado
      resultado = await OnboardingService.obtenerInstitucionesPaginadas(limit, skip);
    }

    res.json({
      instituciones: resultado.data,
      total: resultado.total,
      page,
      pages: Math.ceil(resultado.total / limit)
    });
  } catch (error) {
    console.error("Error en GET institucion:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/institucion (Creación)
router.post('/', async (req, res) => {
  try {
    const nueva = await OnboardingService.registrarInstitucion(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/institucion/:id (Actualización)
router.put('/:id', async (req, res) => {
  try {
    const actualizada = await OnboardingService.actualizarInstitucion(req.params.id, req.body);
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/institucion/:id (Eliminación)
router.delete('/:id', async (req, res) => {
  try {
    await OnboardingService.eliminarInstitucion(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;