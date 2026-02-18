const GraphRepository = require('../repositories/repositorioGrafoTrayectoria');

class TrayectoriaService {

    // Materias
    async registrarTrayectoriaMateria(estudianteId, datos) {
        const { materiaId, nota, anio } = datos;
        // Habría que validar si el estudiante existe en Mongo primero
        return await GraphRepository.registrarCursada(estudianteId, materiaId, nota, anio);
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