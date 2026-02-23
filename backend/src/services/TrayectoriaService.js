const GraphRepository = require('../repositories/repositorioGrafoTrayectoria');
const StudentRepository = require('../repositories/repositorioEstudiante');
const InstitutionRepository = require('../repositories/repositorioInstitucion');
const SubjectRepository = require('../repositories/repositorioMateria');
const AnaliticaRepo = require('../repositories/repositorioCassandraAnalitica');

class TrayectoriaService {

    // Materias
    async registrarTrayectoriaMateria(estudianteId, datos) {
        const { materiaId, nota, anio } = datos;
        const [estudiante, materia] = await Promise.all([
            StudentRepository.findById(estudianteId),
            SubjectRepository.findById(materiaId)
        ]);
        
        if (!estudiante || !materia) throw new Error("Estudiante o Materia no encontrados");

        const institucion = await InstitutionRepository.findById(materia.institucion);

        // Neo4j: Registrar la cursada individual
        await GraphRepository.registrarCursada(estudianteId, materiaId, nota, anio);

        // Cassandra: Actualizar analítica agregada
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

        // Cassandra: Registrar evento de auditoría
        await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteId, 'CURSAR_MATERIA', {
            materia: materia.nombre,
            nota,
            anio
        });

        return { mensaje: "Trayectoria y analítica actualizadas" };
    }

    async obtenerTrayectoriaMateria(estudianteId) {
        return await GraphRepository.obtenerCursada(estudianteId);
    }

    async actualizarTrayectoriaMateria(estudianteId, materiaId, datos) {
        const resultado = await GraphRepository.actualizarCursada(estudianteId, materiaId, datos.nota, datos.anio);
        
        // Cassandra: Registrar evento de auditoría
        await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteId, 'ACTUALIZAR_CURSADA', {
            materiaId,
            nota: datos.nota,
            anio: datos.anio
        });
        
        return resultado;
    }

    async eliminarTrayectoriaMateria(estudianteId, materiaId) {
        const resultado = await GraphRepository.eliminarCursada(estudianteId, materiaId);
        
        // Cassandra: Registrar evento de auditoría
        await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteId, 'ELIMINAR_CURSADA', { materiaId });
        
        return resultado;
    }

    // Instituciones
    async registrarTrayectoriaInstitucion(estudianteId, datos) {
        const { institucionId, desde, hasta } = datos;
        const resultado = await GraphRepository.registrarTrayectoriaInstitucional(estudianteId, institucionId, desde, hasta);
        
        // Cassandra: Registrar evento de auditoría
        await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteId, 'INGRESAR_INSTITUCION', {
            institucionId,
            desde
        });

        return resultado;
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
        const resultado = await GraphRepository.actualizarTrayectoriaInstitucional(estudianteId, institucionId, datos.desde, datos.hasta);
        
        // Cassandra: Registrar evento de auditoría
        await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteId, 'ACTUALIZAR_TRAYECTORIA_INST', {
            institucionId,
            desde: datos.desde,
            hasta: datos.hasta
        });

        return resultado;
    }
    
    async eliminarTrayectoriaInstitucion(estudianteId, institucionId) {
        const resultado = await GraphRepository.eliminarTrayectoriaInstitucional(estudianteId, institucionId);
        
        // Cassandra: Registrar evento de auditoría
        await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteId, 'ELIMINAR_TRAYECTORIA_INST', { institucionId });
        
        return resultado;
    }
}

module.exports = new TrayectoriaService();