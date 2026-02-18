const GraphRepository = require('../repositories/repositorioGrafoTrayectoria');
const StudentRepository = require('../repositories/repositorioEstudiante');
const InstitutionRepository = require('../repositories/repositorioInstitucion');
const SubjectRepository = require('../repositories/repositorioMateria');
const AnaliticaRepo = require('../repositories/repositorioCassandraAnalitica');

class TrayectoriaService {

    // Materias
    async registrarTrayectoriaMateria(estudianteId, datos) {
        const { materiaId, nota, anio } = datos;
        // 1. Obtener contexto de Mongo para Cassandra (País, Sistema, Nivel)
        const [estudiante, materia] = await Promise.all([
            StudentRepository.findById(estudianteId),
            SubjectRepository.findById(materiaId)
        ]);
        
        if (!estudiante || !materia) throw new Error("Estudiante o Materia no encontrados");

        // Obtenemos la institución para saber el sistema educativo
        const institucion = await InstitutionRepository.findById(materia.institucion);

        // 2. Neo4j: Registrar la cursada individual
        await GraphRepository.registrarCursada(estudianteId, materiaId, nota, anio);

        // 3. Cassandra: Actualizar analítica agregada (No bloqueante)
        AnaliticaRepo.actualizarMetricasMateria({
            institucionId: institucion._id,
            materiaId: materia._id,
            materiaNombre: materia.nombre,
            anio: parseInt(anio),
            nota: parseFloat(nota),
            esAprobado: nota >= 4,
            pais: estudiante.pais,
            sistema: institucion.sistema_educativo,
            nivel: materia.nivel || "Grado"
        }).catch(err => console.error("⚠️ Error en Cassandra Analítica:", err));

        return { mensaje: "Trayectoria y analítica actualizadas" };
    }

    async obtenerTrayectoriaMateria(estudianteId) {
        return await GraphRepository.obtenerCursada(estudianteId);
    }

    async actualizarTrayectoriaMateria(estudianteId, materiaId, datos) {
        return await GraphRepository.actualizarCursada(estudianteId, materiaId, datos.nota, datos.anio);
    }

    async eliminarTrayectoriaMateria(estudianteId, materiaId) {
        return await GraphRepository.eliminarCursada(estudianteId, materiaId);
    }

    // Instituciones
    async registrarTrayectoriaInstitucion(estudianteId, datos) {
        const { institucionId, desde, hasta } = datos;
        return await GraphRepository.registrarTrayectoriaInstitucional(estudianteId, institucionId, desde, hasta);
    }

    async obtenerTrayectoriaInstitucion(estudianteId) {
        try {
            return await GraphRepository.obtenerTrayectoriaInstitucional(estudianteId);
        } catch (error) {
            console.error('⚠️ Error en servicio al obtener historial:', error);
            return [];
        }
    }

    async actualizarTrayectoriaInstitucion(estudianteId, institucionId, datos) {
        return await GraphRepository.actualizarTrayectoriaInstitucional(estudianteId, institucionId, datos.desde, datos.hasta);
    }
    
    async eliminarTrayectoriaInstitucion(estudianteId, institucionId) {
        return await GraphRepository.eliminarTrayectoriaInstitucional(estudianteId, institucionId);
    }
}

module.exports = new TrayectoriaService();