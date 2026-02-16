const StudentRepository = require('../repositories/repositorioEstudiante');
const InstitutionRepository = require('../repositories/repositorioInstitucion');
const SubjectRepository = require('../repositories/repositorioMateria');
const GraphRepository = require('../repositories/repositorioGrafo');

class OnboardingService {
  async registrarEstudiante(datos) {
    //Guardamos en MongoDB
    const estudianteMongo = await StudentRepository.create(datos);

    //Replicamos en Neo4j
    try {
      await GraphRepository.crearEstudiante(
        estudianteMongo._id,       //Pasamos el ID
        estudianteMongo.nombre,    //Pasamos el Nombre
        estudianteMongo.apellido,  //Pasamos el Apellido
        estudianteMongo.mail       //Pasamos el Mail
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando estudiante con Neo4j:', error.message);
    }

    return estudianteMongo;
  }
  async actualizarEstudiante(id, datos) { return await StudentRepository.update(id, datos); }
  async eliminarEstudiante(id) { return await StudentRepository.delete(id); }
  async buscarEstudiantePorNombre(nombre, limit, skip) { return await StudentRepository.findByName(nombre, limit, skip); }
  async obtenerEstudiantesPaginados(limit, skip) { return await StudentRepository.findPaged(limit, skip); }

  async registrarInstitucion(datos) {
    //Guardamos en Mongo
    const institucionMongo = await InstitutionRepository.create(datos);

    //Replicamos en Neo4j
    try {
      await GraphRepository.crearInstitucion(
        institucionMongo._id,
        institucionMongo.nombre,
        institucionMongo.pais
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando institución con Neo4j:', error.message);
    }

    return institucionMongo;
  }
  async actualizarInstitucion(id, datos) { return await InstitutionRepository.update(id, datos); }
  async eliminarInstitucion(id) { return await InstitutionRepository.delete(id); }
  async buscarInstitucionPorNombre(nombre, limit, skip) { return await InstitutionRepository.findByName(nombre, limit, skip); }
  async obtenerInstitucionesPaginadas(limit, skip) { return await InstitutionRepository.findPaged(limit, skip); }

  async registrarMateria(datos) {
    //Validamos que la institución exista
    const inst = await InstitutionRepository.findById(datos.institucion);
    if (!inst) throw new Error("La institución no existe");

    //Creamos en Mongo
    const materiaMongo = await SubjectRepository.create(datos);

    //Replicamos en Neo4j
    try {
      await GraphRepository.crearMateria(
        materiaMongo._id,
        materiaMongo.nombre,
        inst.pais //Sacamos el país de la institución que buscamos arriba
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando materia con Neo4j:', error.message);
    }

    return materiaMongo;
  }
  async actualizarMateria(id, datos) { return await SubjectRepository.update(id, datos); }
  async eliminarMateria(id) { return await SubjectRepository.delete(id); }
  async buscarMateriaPorNombre(nombre, limit, skip) { return await SubjectRepository.findByName(nombre, limit, skip); }
  async obtenerMateriasPaginadas(limit, skip) { return await SubjectRepository.findPaged(limit, skip); }
}

module.exports = new OnboardingService();