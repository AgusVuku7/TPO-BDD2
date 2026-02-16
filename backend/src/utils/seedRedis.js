const { connectAll } = require('./DatabaseManager');
const ConversionService = require('../services/ConversionService');

const cargarCombustible = async () => {
  try {
    // 1. Iniciamos la conexión (Redis debe estar en Docker)
    await connectAll();

    const reglasUniversales = [
      // REGLA: ARGENTINA (AR) -> SUDÁFRICA (ZA)
      {
        origen: "AR", destino: "ZA", version: "1.0", fecha: "2026-02-15",
        mapping: [
          { min: 9.0, max: 10.0, result: "Level 7", label: "Outstanding" },
          { min: 8.0, max: 8.99, result: "Level 6", label: "Meritorious" },
          { min: 7.0, max: 7.99, result: "Level 5", label: "Substantial" },
          { min: 6.0, max: 6.99, result: "Level 4", label: "Adequate" },
          { min: 0.0, max: 5.99, result: "Level 1", label: "Not Achieved" }
        ]
      },
      // REGLA: ALEMANIA (DE) -> SUDÁFRICA (ZA) (Sistema Inverso)
      {
        origen: "DE", destino: "ZA", version: "1.0", fecha: "2026-02-15",
        mapping: [
          { min: 1.0, max: 1.5, result: "Level 7", label: "Outstanding (1.0 is best)" },
          { min: 1.6, max: 2.5, result: "Level 6", label: "Meritorious" },
          { min: 2.6, max: 3.5, result: "Level 5", label: "Substantial" },
          { min: 3.6, max: 4.0, result: "Level 4", label: "Adequate (Pass)" },
          { min: 4.1, max: 6.0, result: "Level 1", label: "Fail" }
        ]
      },
      // REGLA: ESTADOS UNIDOS (US) -> SUDÁFRICA (ZA)
      {
        origen: "US", destino: "ZA", version: "1.0", fecha: "2026-02-15",
        mapping: [
          { min: 3.7, max: 4.0, result: "Level 7", label: "A (Excellent)" },
          { min: 3.0, max: 3.69, result: "Level 6", label: "B (Good)" },
          { min: 0.0, max: 1.99, result: "Level 1", label: "F (Fail)" }
        ]
      },

      // REGLA: REINO UNIDO (UK) -> SUDÁFRICA (ZA)
      {
        origen: "UK", destino: "ZA", version: "1.0", fecha: "2026-02-15",
        mapping: [
          { min: 8.0, max: 9.99, result: "Level 7", label: "Outstanding" },
          { min: 7.0, max: 7.99, result: "Level 6", label: "Meritorious" },
          { min: 5.0, max: 6.99, result: "Level 5", label: "Substantial" },
          { min: 4.0, max: 4.99, result: "Level 4", label: "Adequate" },
          { min: 0.0, max: 3.99, result: "Level 1", label: "Not Achieved" }
        ]
      },
      // Podes agregar UK (GB) y combinaciones cruzadas siguiendo el mismo patrón
    ];

    console.log('⛽ Cargando reglas de conversión en Redis...');
    
    for (const regla of reglasUniversales) {
      const key = await ConversionService.guardarRegla(regla);
      console.log(`✅ Combustible cargado para trayectoria: ${regla.origen} -> ${regla.destino} (Key: ${key})`);
    }

    console.log('✨ Sistema listo para procesar movilidad estudiantil.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error cargando el combustible:', error);
    process.exit(1);
  }
};

cargarCombustible();