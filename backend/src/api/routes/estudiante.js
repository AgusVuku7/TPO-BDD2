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

module.exports = router;