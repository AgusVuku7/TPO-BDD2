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
        estudianteMongo.mail       //Pasamos el Mail
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando estudiante con Neo4j:', error.message);
    }

    return estudianteMongo;
  }

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
}

module.exports = new OnboardingService();