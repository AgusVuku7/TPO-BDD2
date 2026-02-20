const { connectAll } = require('../utils/DatabaseManager');
const ConversionService = require('../services/ConversionService');

/**
 * SEEDER: Matriz Global de Movilidad Estudiantil (v3.0)
 * Países: AR, US, UK, DE, ZA
 */
const cargarCombustible = async () => {
    try {
        await connectAll();

        // --- FUNCIÓN DE LIMPIEZA ---
        console.log('🧹 Limpiando datos previos en Redis...');
        await ConversionService.limpiarReglas(); 
        // ---------------------------------

        const reglasUniversales = [
        // ==========================================
        // 🇦🇷 DESTINO: ARGENTINA (Escala 1-10)
        // Enfoque: Promedios anuales e instancias de recuperación.
        // ==========================================
        { origen: "UK", destino: "AR", version: "1.0", mapping: [
            { min: "A", max: "A*", result: "10", label: "Sobresaliente" },
            { min: "B", max: "C", result: "7", label: "Bueno" },
            { min: "E", max: "E", result: "4", label: "Aprobado" },
            { min: "F", max: "U", result: "2", label: "Insuficiente" }
        ]},
        { origen: "US", destino: "AR", version: "1.0", mapping: [
            { min: 3.8, max: 4.0, result: "10", label: "Sobresaliente" },
            { min: 3.0, max: 3.79, result: "8", label: "Distinguido" },
            { min: 2.0, max: 2.99, result: "6", label: "Aprobado" },
            { min: 0.0, max: 1.99, result: "2", label: "Insuficiente" }
        ]},
        { origen: "DE", destino: "AR", version: "1.0", mapping: [
            { min: 1.0, max: 1.5, result: "10", label: "Sobresaliente" },
            { min: 1.6, max: 3.0, result: "8", label: "Distinguido" },
            { min: 3.1, max: 4.0, result: "6", label: "Aprobado" },
            { min: 4.1, max: 6.0, result: "2", label: "Reprobado" }
        ]},
        { origen: "ZA", destino: "AR", version: "1.0", mapping: [
            { min: 7, max: 7, result: "10", label: "Sobresaliente" },
            { min: 5, max: 6, result: "8", label: "Distinguido" },
            { min: 4, max: 4, result: "6", label: "Aprobado" },
            { min: 1, max: 3, result: "2", label: "Insuficiente" }
        ]},

        // ==========================================
        // 🇺🇸 DESTINO: ESTADOS UNIDOS (GPA 4.0)
        // Enfoque: Créditos por materia y Letter Grades.
        // ==========================================
        { origen: "AR", destino: "US", version: "1.0", mapping: [
            { min: 9.0, max: 10.0, result: "4.0", label: "Grade A" },
            { min: 7.0, max: 8.99, result: "3.0", label: "Grade B" },
            { min: 4.0, max: 6.99, result: "2.0", label: "Grade C" },
            { min: 0.0, max: 3.99, result: "0.0", label: "Grade F" }
        ]},
        { origen: "UK", destino: "US", version: "1.0", mapping: [
            { min: "A*", max: "A", result: "4.0", label: "Grade A" },
            { min: "B", max: "C", result: "3.0", label: "Grade B" },
            { min: "D", max: "E", result: "2.0", label: "Grade C" },
            { min: "F", max: "U", result: "0.0", label: "Grade F" }
        ]},
        { origen: "DE", destino: "US", version: "1.0", mapping: [
            { min: 1.0, max: 1.5, result: "4.0", label: "Grade A" },
            { min: 1.6, max: 2.5, result: "3.5", label: "Grade B+" },
            { min: 2.6, max: 4.0, result: "2.5", label: "Grade C" },
            { min: 4.1, max: 6.0, result: "0.0", label: "Grade F" }
        ]},
        { origen: "ZA", destino: "US", version: "1.0", mapping: [
            { min: 7, max: 7, result: "4.0", label: "Grade A" },
            { min: 5, max: 6, result: "3.0", label: "Grade B" },
            { min: 4, max: 4, result: "2.0", label: "Grade C" },
            { min: 1, max: 3, result: "0.0", label: "Grade F" }
        ]},

        // ==========================================
        // 🇬🇧 DESTINO: REINO UNIDO (GCSE / A-Levels)
        // Enfoque: Evaluación modular y distinción Coursework vs Exams.
        // ==========================================
        { origen: "AR", destino: "UK", version: "1.0", mapping: [
            { min: 9.0, max: 10.0, result: "A*", label: "Distinction" },
            { min: 7.0, max: 8.99, result: "B", label: "Merit" },
            { min: 4.0, max: 6.99, result: "C", label: "Pass" },
            { min: 0.0, max: 3.99, result: "F", label: "Fail" }
        ]},
        { origen: "US", destino: "UK", version: "1.0", mapping: [
            { min: 3.9, max: 4.0, result: "A*", label: "Excellent" },
            { min: 3.0, max: 3.89, result: "B", label: "Good" },
            { min: 2.0, max: 2.99, result: "C", label: "Pass" },
            { min: 0.0, max: 1.99, result: "F", label: "Fail" }
        ]},
        { origen: "DE", destino: "UK", version: "1.0", mapping: [
            { min: 1.0, max: 1.5, result: "A*", label: "Exceptional" },
            { min: 1.6, max: 2.5, result: "A", label: "Excellent" },
            { min: 2.6, max: 4.0, result: "C", label: "Pass" },
            { min: 4.1, max: 6.0, result: "F", label: "Fail" }
        ]},
        { origen: "ZA", destino: "UK", version: "1.0", mapping: [
            { min: 7, max: 7, result: "A", label: "Distinction" },
            { min: 5, max: 6, result: "B", label: "Merit" },
            { min: 4, max: 4, result: "C", label: "Pass" },
            { min: 1, max: 3, result: "F", label: "Fail" }
        ]},

        // ==========================================
        // 🇩🇪 DESTINO: ALEMANIA (Escala 1.0 - 6.0)
        // Enfoque: Escala numérica inversa y evaluación continua.
        // ==========================================
        { origen: "AR", destino: "DE", version: "1.0", mapping: [
            { min: 10.0, max: 10.0, result: "1.0", label: "Sehr Gut" },
            { min: 8.0, max: 9.9, result: "2.0", label: "Gut" },
            { min: 4.0, max: 7.9, result: "4.0", label: "Ausreichend" },
            { min: 0.0, max: 3.9, result: "5.0", label: "Mangelhaft" }
        ]},
        { origen: "US", destino: "DE", version: "1.0", mapping: [
            { min: 3.9, max: 4.0, result: "1.0", label: "Sehr Gut" },
            { min: 3.0, max: 3.8, result: "2.5", label: "Gut" },
            { min: 2.0, max: 2.9, result: "4.0", label: "Pass" },
            { min: 0.0, max: 1.9, result: "5.0", label: "Fail" }
        ]},
        { origen: "UK", destino: "DE", version: "1.0", mapping: [
            { min: "A*", max: "A", result: "1.0", label: "Sehr Gut" },
            { min: "B", max: "C", result: "3.0", label: "Befriedigend" },
            { min: "E", max: "E", result: "4.0", label: "Ausreichend" },
            { min: "F", max: "U", result: "5.0", label: "Ungenügend" }
        ]},
        { origen: "ZA", destino: "DE", version: "1.0", mapping: [
            { min: 7, max: 7, result: "1.0", label: "Sehr Gut" },
            { min: 4, max: 6, result: "3.5", label: "Ausreichend" },
            { min: 1, max: 3, result: "5.0", label: "Fail" }
        ]},

        // ==========================================
        // 🇿🇦 DESTINO: SUDÁFRICA (Levels 1-7)
        // Enfoque: Niveles de logro (Achievement Levels).
        // ==========================================
        { origen: "AR", destino: "ZA", version: "1.0", mapping: [
            { min: 9.0, max: 10.0, result: "Level 7", label: "Outstanding" },
            { min: 7.0, max: 8.9, result: "Level 6", label: "Meritorious" },
            { min: 4.0, max: 6.9, result: "Level 4", label: "Adequate" },
            { min: 0.0, max: 3.9, result: "Level 1", label: "Not Achieved" }
        ]},
        { origen: "US", destino: "ZA", version: "1.0", mapping: [
            { min: 3.7, max: 4.0, result: "Level 7", label: "Outstanding" },
            { min: 2.7, max: 3.6, result: "Level 5", label: "Substantial" },
            { min: 2.0, max: 2.6, result: "Level 4", label: "Adequate" },
            { min: 0.0, max: 1.9, result: "Level 1", label: "Fail" }
        ]},
        { origen: "UK", destino: "ZA", version: "1.0", mapping: [
            { min: "A*", max: "A", result: "Level 7", label: "Outstanding" },
            { min: "B", max: "C", result: "Level 5", label: "Substantial" },
            { min: "E", max: "E", result: "Level 4", label: "Adequate" },
            { min: "F", max: "U", result: "Level 1", label: "Fail" }
        ]},
        { origen: "DE", destino: "ZA", version: "1.0", mapping: [
            { min: 1.0, max: 1.5, result: "Level 7", label: "Outstanding" },
            { min: 1.6, max: 3.0, result: "Level 5", label: "Substantial" },
            { min: 3.1, max: 4.0, result: "Level 4", label: "Pass" },
            { min: 4.1, max: 6.0, result: "Level 1", label: "Fail" }
        ]}
        ];

        console.log('⛽ Cargando matriz completa de 20 reglas cruzadas en Redis...');
        
        for (const regla of reglasUniversales) {
        await ConversionService.guardarRegla(regla);
        console.log(`✅ ${regla.origen} ➔ ${regla.destino} (v${regla.version})`);
        }

        console.log('✨ Matriz de movilidad cargada con éxito.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error crítico en el seeding:', error);
        process.exit(1);
    }
};

cargarCombustible();