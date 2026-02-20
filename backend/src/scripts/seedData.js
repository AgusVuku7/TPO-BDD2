require('dotenv').config();

// IMPORTAMOS EL DATABASE MANAGER
const { connectAll, getNeo4jDriver } = require('../utils/DatabaseManager');

// Importamos los Modelos y Servicios
const Institution = require('../models/institucion');
const Subject = require('../models/materia');
const Student = require('../models/estudiante');
const OnboardingService = require('../services/OnboardingService');
const TrayectoriaService = require('../services/TrayectoriaService'); // NUEVO: Para el historial académico

// ==========================================
// 1. DATOS DE PRUEBA (MOCK DATA)
// ==========================================

// REGLA APLICADA: 'region' ahora coincide con 'sistema_educativo'
const institucionesData = [
    { _id: "INST-AR-UBA", nombre: "Universidad de Buenos Aires", pais: "Argentina", region: "AR", sistema_educativo: "AR" },
    { _id: "INST-US-MIT", nombre: "Massachusetts Institute of Technology", pais: "Estados Unidos", region: "US", sistema_educativo: "US" },
    { _id: "INST-UK-OXF", nombre: "University of Oxford", pais: "Reino Unido", region: "UK", sistema_educativo: "UK" },
    { _id: "INST-DE-TUM", nombre: "Technical University of Munich", pais: "Alemania", region: "DE", sistema_educativo: "DE" },
    { _id: "INST-AR-UTN", nombre: "Universidad Tecnológica Nacional", pais: "Argentina", region: "AR", sistema_educativo: "AR" }
];

const nombres = ["Ana", "Carlos", "Lucía", "Miguel", "Sofía", "Juan", "Valentina", "Pedro", "Camila", "Diego", "María", "Joaquín", "Martina", "Mateo", "Laura", "Tomás", "Florencia", "Lucas", "Julieta", "Nicolás"];
const apellidos = ["García", "Fernández", "López", "Martínez", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Gómez", "Díaz", "Álvarez", "Romero", "Ruiz", "Alonso", "Torres", "Domínguez", "Vázquez", "Blanco"];
const paises = ["Argentina", "Estados Unidos", "Reino Unido", "Alemania", "España", "Colombia", "México", "Chile", "Uruguay", "Perú"];

const obtenerAbreviacion = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').toUpperCase().substring(0, 3);

// ==========================================
// 2. FUNCIÓN PRINCIPAL DE SEEDING
// ==========================================

async function seedDatabase() {
    try {
        console.log("🌱 Iniciando proceso de Data Seeding...");

        await connectAll();
        console.log("✅ Bases de datos conectadas con éxito!");

        // -----------------------------------------------------
        // FASE 0: LIMPIEZA TOTAL
        // -----------------------------------------------------
        console.log("\n🧹 Limpiando bases de datos...");
        await Institution.deleteMany({});
        await Subject.deleteMany({});
        await Student.deleteMany({});
        
        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run('MATCH (n) DETACH DELETE n');
        } finally {
            await session.close();
        }

        // -----------------------------------------------------
        // FASE 1: CREAR INSTITUCIONES
        // -----------------------------------------------------
        console.log("\n🏢 Creando 5 Instituciones...");
        const institucionesCreadas = [];
        for (const inst of institucionesData) {
            const nuevaInst = await OnboardingService.registrarInstitucion(inst);
            institucionesCreadas.push(nuevaInst);
        }

        // -----------------------------------------------------
        // FASE 2: CREAR 20 ESTUDIANTES
        // -----------------------------------------------------
        console.log("\n🎓 Creando 20 Estudiantes...");
        const estudiantesCreados = [];
        for (let i = 1; i <= 20; i++) {
            const idConsecutivo = String(i).padStart(3, '0');
            const estudiante = {
                _id: `EST-${idConsecutivo}`, 
                nombre: nombres[Math.floor(Math.random() * nombres.length)],
                apellido: apellidos[Math.floor(Math.random() * apellidos.length)],
                documento: `DOC-${Math.floor(Math.random() * 90000000) + 10000000}`,
                mail: `estudiante${idConsecutivo}@edugrade.com`,
                pais: paises[Math.floor(Math.random() * paises.length)]
            };
            const nuevoEstudiante = await OnboardingService.registrarEstudiante(estudiante);
            estudiantesCreados.push(nuevoEstudiante);
        }

        // -----------------------------------------------------
        // FASE 3: CREAR 50 MATERIAS
        // -----------------------------------------------------
        console.log("\n📚 Creando 50 Materias...");
        const materiasBase = [
            "Álgebra", "Análisis Matemático I", "Análisis Matemático II", "Física I", "Física II",
            "Programación I", "Estructuras de Datos", "Bases de Datos", "Ingeniería de Software", "Redes"
        ];

        const materiasPorInstitucion = {}; 
        let materiaContador = 1;

        for (const inst of institucionesCreadas) {
            materiasPorInstitucion[inst._id] = [];
            for (let i = 0; i < 10; i++) {
                const nombreMateria = materiasBase[i];
                const abreviacion = obtenerAbreviacion(nombreMateria);
                const numeroId = String(materiaContador).padStart(3, '0');
                
                const materiaData = {
                    _id: `MAT-${abreviacion}-${numeroId}`, // Ajustado formato MAT-000
                    nombre: `${nombreMateria} (${inst.sistema_educativo})`,
                    nivel: i < 5 ? "Básico" : "Avanzado",
                    institucion: inst._id,
                    metadata: { creditos: 5, horas: 120 }
                };
                
                const nuevaMateria = await OnboardingService.registrarMateria(materiaData);
                materiasPorInstitucion[inst._id].push(nuevaMateria);
                materiaContador++;
            }
        }

        // -----------------------------------------------------
        // FASE 4: CORRELATIVIDADES (GRAFO MÁS DENSO)
        // -----------------------------------------------------
        console.log("\n🔗 Generando relaciones de Correlatividad...");
        for (const instId in materiasPorInstitucion) {
            const m = materiasPorInstitucion[instId];
            // Índices: 0:Alg, 1:Ana1, 2:Ana2, 3:Fis1, 4:Fis2, 5:Prog1, 6:Estructuras, 7:BD, 8:IngSoft, 9:Redes
            await OnboardingService.agregarCorrelatividad(m[2]._id, m[1]._id); // Ana 2 -> Ana 1
            await OnboardingService.agregarCorrelatividad(m[4]._id, m[3]._id); // Fis 2 -> Fis 1
            await OnboardingService.agregarCorrelatividad(m[6]._id, m[5]._id); // Estructuras -> Prog 1
            await OnboardingService.agregarCorrelatividad(m[7]._id, m[5]._id); // BD -> Prog 1
            await OnboardingService.agregarCorrelatividad(m[8]._id, m[7]._id); // Ing Soft -> BD
            await OnboardingService.agregarCorrelatividad(m[9]._id, m[6]._id); // Redes -> Estructuras
        }

        // -----------------------------------------------------
        // FASE 5: EQUIVALENCIAS MASIVAS (Mismo nombre en todos los países)
        // -----------------------------------------------------
        console.log("\n🌐 Generando relaciones de Equivalencia Masivas...");
        for (let idxMateria = 0; idxMateria < materiasBase.length; idxMateria++) {
            // Cruzamos cada institución con las demás para la misma materia
            for (let i = 0; i < institucionesCreadas.length; i++) {
                for (let j = i + 1; j < institucionesCreadas.length; j++) {
                    const instA = institucionesCreadas[i]._id;
                    const instB = institucionesCreadas[j]._id;
                    
                    const matA = materiasPorInstitucion[instA][idxMateria];
                    const matB = materiasPorInstitucion[instB][idxMateria];
                    
                    const porcentaje = 80 + Math.floor(Math.random() * 21); // Random 80% - 100%
                    
                    // Ida y vuelta
                    await OnboardingService.registrarEquivalencia(matA._id, matB._id, porcentaje);
                    await OnboardingService.registrarEquivalencia(matB._id, matA._id, porcentaje);
                }
            }
        }

        // -----------------------------------------------------
        // FASE 6: TRAYECTORIAS Y CURSADAS (Historial Académico)
        // -----------------------------------------------------
        console.log("\n📈 Generando Historial Académico (ASISTE y CURSO)...");
        for (const est of estudiantesCreados) {
            // Le asignamos una institución aleatoria
            const randomInst = institucionesCreadas[Math.floor(Math.random() * institucionesCreadas.length)];
            
            await TrayectoriaService.registrarTrayectoriaInstitucion(est._id, {
                institucionId: randomInst._id,
                desde: 2021 + Math.floor(Math.random() * 2), // 2021 o 2022
                hasta: 2026
            });

            // Le aprobamos entre 3 y 5 materias aleatorias de esa institución
            const materiasInst = materiasPorInstitucion[randomInst._id];
            const cantidadMaterias = 3 + Math.floor(Math.random() * 3); 
            
            for(let k = 0; k < cantidadMaterias; k++) {
                // Agarramos materias en orden (para que tenga sentido con las correlativas)
                const mat = materiasInst[k]; 
                await TrayectoriaService.registrarTrayectoriaMateria(est._id, {
                    materiaId: mat._id,
                    nota: 6 + Math.floor(Math.random() * 5), // Notas de 6 a 10
                    anio: 2022 + k
                });
            }
        }

        console.log("\n🎉 ¡PROCESO DE SEEDING FINALIZADO CON ÉXITO!");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ Error durante el Seeding:", error);
        process.exit(1);
    }
}

seedDatabase();