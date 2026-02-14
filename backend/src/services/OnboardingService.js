const StudentRepository = require('../repositories/repositorioEstudiante');
const InstitutionRepository = require('../repositories/repositorioInstitucion');
const SubjectRepository = require('../repositories/repositorioMateria');

class OnboardingService {
  async registrarEstudiante(datos) {
    // Aquí podrías agregar validaciones de negocio antes de guardar
    return await StudentRepository.create(datos);
  }

  async registrarInstitucion(datos) {
    // Las instituciones tienen metadatos variables (RF1)
    return await InstitutionRepository.create(datos);
  }

  async registrarMateria(datos) {
    // Validar que la institución exista antes de crear la materia
    const inst = await InstitutionRepository.findById(datos.institucion);
    if (!inst) throw new Error("La institución no existe");
    return await SubjectRepository.create(datos);
  }
}

module.exports = new OnboardingService();