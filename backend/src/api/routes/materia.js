const express = require('express');
const router = express.Router();
const OnboardingService = require('../../services/OnboardingService');

// GET /api/materia (Listado y Búsqueda)
router.get('/', async (req, res) => {
  try {
    const { buscar } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let resultado;
    if (buscar) {
      resultado = await OnboardingService.buscarMateriaPorNombre(buscar, limit, skip);
    } else {
      resultado = await OnboardingService.obtenerMateriasPaginadas(limit, skip);
    }

    res.json({
      materias: resultado.data,
      total: resultado.total,
      page,
      pages: Math.ceil(resultado.total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST, PUT y DELETE (Siguen el mismo patrón que Institución)
router.post('/', async (req, res) => {
  try {
    const nueva = await OnboardingService.registrarMateria(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const actualizada = await OnboardingService.actualizarMateria(req.params.id, req.body);
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await OnboardingService.eliminarMateria(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//implementamos la correlativad
router.post('/:id/correlativas', async (req, res) => {
  try {
    const { idCorrelativa } = req.body; // Obtenemos el idCorrelativa del cuerpo de la solicitud
    
    //Llamo al servicio con los IDs sueltos
    const resultado = await OnboardingService.agregarCorrelatividad(req.params.id, idCorrelativa);
    res.status(201).json(resultado); //'201' significa "created", indicando que se creo el recurso
  } catch (error) {
    res.status(400).json({ error: error.message }); //si falla, enviamos un error '400' (ej. si no existe la materia)
  }
});

//Mostramos las correlativas a una materia
router.get('/:id/correlativas', async (req, res) => {
  try {
    const correlativas = await OnboardingService.obtenerCorrelativas(req.params.id);
    res.json(correlativas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;