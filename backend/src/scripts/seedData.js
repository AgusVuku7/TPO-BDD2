require('dotenv').config();

// IMPORTAMOS EL DATABASE MANAGER
const { connectAll, getNeo4jDriver } = require('../utils/DatabaseManager');

// Importamos los Modelos y Servicios
const Institution = require('../models/institucion');
const Subject = require('../models/materia');
const Student = require('../models/estudiante');
const OnboardingService = require('../services/OnboardingService');
const TrayectoriaService = require('../services/TrayectoriaService');

// ==========================================
// 1. DATOS DE PRUEBA (MOCK DATA)
// ==========================================

const institucionesData = [
    { nombre: "Universidad de Buenos Aires", pais: "Argentina", region: "AR", sistema_educativo: "AR", metadata: { fundacion: 1821, tipo: "Pública", sedes: 13 } },
    { nombre: "Massachusetts Institute of Technology", pais: "Estados Unidos", region: "US", sistema_educativo: "US", metadata: { tipo: "Privada", campus: "Tecnológico", presupuesto: "Alto" } },
    { nombre: "University of Oxford", pais: "Reino Unido", region: "UK", sistema_educativo: "UK", metadata: { fundacion: 1096, colegios_afiliados: 39 } },
    { nombre: "Technical University of Munich", pais: "Alemania", region: "DE", sistema_educativo: "DE", metadata: { tipo: "Pública", idioma_principal: "Alemán", enfoque: "Investigación" } },
    { nombre: "Universidad Tecnológica Nacional", pais: "Argentina", region: "AR", sistema_educativo: "AR", metadata: { fundacion: 1948, facultades_regionales: 30, tipo: "Pública" } }
];

const nombres = ["Ana", "Carlos", "Lucía", "Miguel", "Sofía", "Juan", "Valentina", "Pedro", "Camila", "Diego", "María", "Joaquín", "Martina", "Mateo", "Laura", "Tomás", "Florencia", "Lucas", "Julieta", "Nicolás"];
const apellidos = ["García", "Fernández", "López", "Martínez", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Gómez", "Díaz", "Álvarez", "Romero", "Ruiz", "Alonso", "Torres", "Domínguez", "Vázquez", "Blanco"];
const paises = ["Argentina", "Estados Unidos", "Reino Unido", "Alemania", "España", "Colombia", "México", "Chile", "Uruguay", "Perú"];

const tiposBeca = ["Media Beca", "Beca Completa", "Beca Deportiva", "Ayuda Económica"];
const modalidadesMateria = ["Presencial", "Virtual", "Híbrida"];

const generarMetadataEstudiante = () => {
    const meta = {};
    if (Math.random() > 0.4) meta.beca = tiposBeca[Math.floor(Math.random() * tiposBeca.length)];
    if (Math.random() > 0.2) meta.anio_ingreso = 2020 + Math.floor(Math.random() * 4);
    if (Math.random() > 0.3) meta.promedio_secundario = parseFloat((7 + Math.random() * 3).toFixed(2));
    if (Math.random() > 0.5) meta.hace_deportes = Math.random() > 0.5 ? "Sí" : "No";
    if (Math.random() > 0.6) meta.trabaja = Math.random() > 0.5 ? "Part-time" : "Full-time";
    return meta;
};

const generarMetadataMateria = () => {
    const meta = {};
    const creditos = 3 + Math.floor(Math.random() * 6);
    if (Math.random() > 0.1) meta.creditos = creditos;
    if (Math.random() > 0.3) meta.horas_totales = creditos * 16 + (Math.floor(Math.random() * 5) * 4);
    if (Math.random() > 0.4) meta.modalidad = modalidadesMateria[Math.floor(Math.random() * modalidadesMateria.length)];
    if (Math.random() > 0.5) meta.cupo_maximo = 30 + Math.floor(Math.random() * 70);
    if (Math.random() > 0.7) meta.requiere_laboratorio = "Sí";
    return meta;
};

// ==========================================
// 2. FUNCIÓN PRINCIPAL DE SEEDING
// ==========================================

async function seedDatabase() {
    try {
        console.log("🌱 Iniciando proceso de Data Seeding...");

        await connectAll();
        console.log("✅ Bases de datos conectadas con éxito!");

        // FASE 0: LIMPIEZA TOTAL
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

        // FASE 1: CREAR INSTITUCIONES
        console.log("\n🏢 Creando 5 Instituciones...");
        const institucionesCreadas = [];
        for (const inst of institucionesData) {
            const nuevaInst = await OnboardingService.registrarInstitucion(inst);
            institucionesCreadas.push(nuevaInst); 
        }

        // FASE 2: CREAR 20 ESTUDIANTES
        console.log("\n🎓 Creando 20 Estudiantes...");
        const estudiantesCreados = [];
        for (let i = 1; i <= 20; i++) {
            const estudiante = {
                nombre: nombres[Math.floor(Math.random() * nombres.length)],
                apellido: apellidos[Math.floor(Math.random() * apellidos.length)],
                documento: `DOC-${Math.floor(Math.random() * 90000000) + 10000000}`,
                mail: `estudiante${i}@edugrade.com`,
                pais: paises[Math.floor(Math.random() * paises.length)],
                metadata: generarMetadataEstudiante() 
            };
            const nuevoEstudiante = await OnboardingService.registrarEstudiante(estudiante);
            estudiantesCreados.push(nuevoEstudiante);
        }

        // FASE 3: CREAR 50 MATERIAS
        console.log("\n📚 Creando 50 Materias...");
        const materiasBase = [
            "Álgebra", "Análisis Matemático I", "Análisis Matemático II", "Física I", "Física II",
            "Programación I", "Estructuras de Datos", "Bases de Datos", "Ingeniería de Software", "Redes"
        ];

        const materiasPorInstitucion = {}; 

        for (const inst of institucionesCreadas) {
            materiasPorInstitucion[inst._id] = []; 
            for (let i = 0; i < 10; i++) {
                const nombreMateria = materiasBase[i];
                
                const materiaData = {
                    nombre: `${nombreMateria} (${inst.sistema_educativo})`,
                    nivel: i < 5 ? "Básico" : "Avanzado",
                    institucion: inst._id,
                    metadata: generarMetadataMateria() 
                };
                
                const nuevaMateria = await OnboardingService.registrarMateria(materiaData);
                materiasPorInstitucion[inst._id].push(nuevaMateria);
            }
        }

        // FASE 4: CORRELATIVIDADES 
        console.log("\n🔗 Generando relaciones de Correlatividad...");
        for (const instId in materiasPorInstitucion) {
            const m = materiasPorInstitucion[instId];
            await OnboardingService.agregarCorrelatividad(m[2]._id, m[1]._id); 
            await OnboardingService.agregarCorrelatividad(m[4]._id, m[3]._id); 
            await OnboardingService.agregarCorrelatividad(m[6]._id, m[5]._id); 
            await OnboardingService.agregarCorrelatividad(m[7]._id, m[5]._id); 
            await OnboardingService.agregarCorrelatividad(m[8]._id, m[7]._id); 
            await OnboardingService.agregarCorrelatividad(m[9]._id, m[6]._id); 
        }

        // FASE 5: EQUIVALENCIAS MASIVAS 
        console.log("\n🌐 Generando relaciones de Equivalencia Masivas (Unidireccionales)...");
        for (let idxMateria = 0; idxMateria < materiasBase.length; idxMateria++) {
            for (let i = 0; i < institucionesCreadas.length; i++) {
                for (let j = i + 1; j < institucionesCreadas.length; j++) {
                    const instA = institucionesCreadas[i]._id;
                    const instB = institucionesCreadas[j]._id;
                    
                    const matA = materiasPorInstitucion[instA][idxMateria];
                    const matB = materiasPorInstitucion[instB][idxMateria];
                    
                    const porcentaje = 80 + Math.floor(Math.random() * 21); 
                    
                    await OnboardingService.registrarEquivalencia(matA._id, matB._id, porcentaje);
                }
            }
        }

        // FASE 6: TRAYECTORIAS Y CURSADAS 
        console.log("\n📈 Generando Historial Académico (ASISTE y CURSO)...");
        for (const est of estudiantesCreados) {
            const randomInst = institucionesCreadas[Math.floor(Math.random() * institucionesCreadas.length)];
            
            await TrayectoriaService.registrarTrayectoriaInstitucion(est._id, {
                institucionId: randomInst._id,
                desde: 2021 + Math.floor(Math.random() * 2), // 2021 o 2022
                hasta: 2026
            });

            const materiasInst = materiasPorInstitucion[randomInst._id];
            
            // Cada alumno cursa entre 8 y 10 materias de su institución para maximizar el cruce de estudiantes
            const cantidadMaterias = 8 + Math.floor(Math.random() * 3); 
            
            // Mezclamos el array para que no cursen la misma materia dos veces por accidente
            const materiasMezcladas = [...materiasInst].sort(() => 0.5 - Math.random());
            const materiasElegidas = materiasMezcladas.slice(0, cantidadMaterias);
            
            for(const mat of materiasElegidas) {
                await TrayectoriaService.registrarTrayectoriaMateria(est._id, {
                    materiaId: mat._id,
                    nota: 1 + Math.floor(Math.random() * 10), // Notas de 1 a 10 (aprobados y desaprobados)
                    anio: 2022 + Math.floor(Math.random() * 5) // Año random: 2022 a 2026
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