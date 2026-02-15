const StudentRepository = require('../repositories/repositorioEstudiante');
const InstitutionRepository = require('../repositories/repositorioInstitucion');
const SubjectRepository = require('../repositories/repositorioMateria');

class OnboardingService {
  async registrarEstudiante(datos) {
    // Aquí podrías agregar validaciones de negocio antes de guardar
    return await StudentRepository.create(datos);
  }
  async actualizarEstudiante(id, datos) { return await StudentRepository.update(id, datos); }
  async eliminarEstudiante(id) { return await StudentRepository.delete(id); }
  async buscarEstudiantePorNombre(nombre, limit, skip) { return await StudentRepository.findByName(nombre, limit, skip); }
  async obtenerEstudiantesPaginados(limit, skip) { return await StudentRepository.findPaged(limit, skip); }

  async registrarInstitucion(datos) {
    // Las instituciones tienen metadatos variables (RF1)
    return await InstitutionRepository.create(datos);
  }
  async actualizarInstitucion(id, datos) { return await InstitutionRepository.update(id, datos); }
  async eliminarInstitucion(id) { return await InstitutionRepository.delete(id); }
  async buscarInstitucionPorNombre(nombre, limit, skip) { return await InstitutionRepository.findByName(nombre, limit, skip); }
  async obtenerInstitucionesPaginadas(limit, skip) { return await InstitutionRepository.findPaged(limit, skip); }

  async registrarMateria(datos) {
    // Validar que la institución exista antes de crear la materia
    const inst = await InstitutionRepository.findById(datos.institucion);
    if (!inst) throw new Error("La institución no existe");
    return await SubjectRepository.create(datos);
  }
  async actualizarMateria(id, datos) { return await SubjectRepository.update(id, datos); }
  async eliminarMateria(id) { return await SubjectRepository.delete(id); }
  async buscarMateriaPorNombre(nombre, limit, skip) { return await SubjectRepository.findByName(nombre, limit, skip); }
  async obtenerMateriasPaginadas(limit, skip) { return await SubjectRepository.findPaged(limit, skip); }
}

module.exports = new OnboardingService();