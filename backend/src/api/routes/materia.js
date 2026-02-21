const express = require('express');
const router = express.Router();
const OnboardingService = require('../../services/OnboardingService');

// GET /api/materia (Listado y Búsqueda)
router.get('/', async (req, res) => {
  try {
    const { buscar, institucionId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Si se pide por institución, omitimos paginación general
    if (institucionId) {
      const materias = await OnboardingService.obtenerMateriasPorInstitucion(institucionId);
      return res.json({
        materias,
        total: materias.length
      });
    }

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

// POST: Crear una nueva equivalencia
router.post('/equivalencia', async (req, res) => {
  try {
    // Extraemos el porcentaje (default 100 si no viene dado)
    const { idOrigen, idDestino, porcentaje } = req.body;
    
    if (!idOrigen || !idDestino) {
      return res.status(400).json({ error: "Se requieren idOrigen y idDestino" });
    }

    const repoGrafo = require('../../repositories/repositorioGrafo');
    const resultado = await repoGrafo.crearEquivalencia(idOrigen, idDestino, porcentaje);
    
    res.status(201).json({ message: "Equivalencia creada", data: resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Consultar equivalencia
router.get('/:id/equivalencia', async (req, res) => {
  try {
    const { id } = req.params;
    const { sistema } = req.query; // Ej: ?sistema=DE

    if (!sistema) {
      return res.status(400).json({ error: "Falta el parámetro 'sistema'" });
    }

    const repoGrafo = require('../../repositories/repositorioGrafo');
    const resultado = await repoGrafo.buscarEquivalencia(id, sistema);

    if (!resultado) {
      return res.status(404).json({ message: "No se encontró equivalencia." });
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;