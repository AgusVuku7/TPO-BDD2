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
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando estudiante con Neo4j:', error.message);
    }

    return estudianteMongo;
  }
  async actualizarEstudiante(id, datos) {
    const estudianteMongo = await StudentRepository.update(id, datos);
    //Chequeamos que estudianteMongo no sea null
    if (estudianteMongo) {
      try {
        await GraphRepository.actualizarEstudiante(
          id,                       //Pasamos el ID
          estudianteMongo.nombre,   //Pasamos el Nombre
        );
      } catch (error) {
        console.error('⚠️ Error actualizando estudiante en Neo4j:', error.message);
      }
    }
  }

  async eliminarEstudiante(id) { 
    const resultadoMongo = await StudentRepository.delete(id); 
    // Si se borró en Mongo con éxito, procedemos a borrar en Neo4j
    if (resultadoMongo) {
      try {
        await GraphRepository.eliminarEstudiante(id);
      } catch (error) {
        console.error('⚠️ Error eliminando estudiante en Neo4j:', error.message);
      }
    }
    return resultadoMongo;
  }

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

  async actualizarInstitucion(id, datos) { 
    const institucionMongo = await InstitutionRepository.update(id, datos); 
    //Chequeamos que la institucion no sea null
    if (institucionMongo) {
      try {
        await GraphRepository.actualizarInstitucion(id, institucionMongo.nombre, institucionMongo.pais);
      } catch (error) {
        console.error('⚠️ Error actualizando institución en Neo4j:', error.message);
      }
    }
    return institucionMongo;
  }

  async eliminarInstitucion(id) { 
    const resultadoMongo = await InstitutionRepository.delete(id); 
    if (resultadoMongo) {
      try {
        await GraphRepository.eliminarInstitucion(id);
      } catch (error) {
        console.error('⚠️ Error eliminando institución en Neo4j:', error.message);
      }
    }
    return resultadoMongo;
  }

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

  async agregarCorrelatividad(idMateria, idCorrelativa) {
    //Primero verificamos que las materias existan en mongodb
    const [materia, correlativa] = await Promise.all([ //Usamos 'Promise.all' para ejecutar las consultas en paralelo
      SubjectRepository.findById(idMateria),
      SubjectRepository.findById(idCorrelativa)
    ])

    //Si alguna de las materias no existe, lanzamos un error
    if (!materia || !correlativa) throw new Error("una o ambas materias no existen en la base de datos principal");

    //Replicamos en Neo4j
    try {
      await GraphRepository.agregarCorrelatividad(idMateria, idCorrelativa);
    } catch (error) {
      console.error('⚠️ Error sincronizando correlatividad con Neo4j:', error);
      throw new Error("No se pudo registrar la correlatividad en el sistema de grafos.")
    }

    return { mensaje: "Correlatividad registrada con exito" };
  }

  //Obtiene las materias necesarias para cursar otra materia
  async obtenerCorrelativas(idMateria) {
    try {
      // Pedimos directo al grafo
      const correlativas = await GraphRepository.obtenerCorrelativas(idMateria);
      return correlativas;
    } catch (error) {
      console.error('⚠️ Error obteniendo correlativas:', error);
      return []; // Si falla, devolvemos un array vacío para no romper el front
    }
  }

  async registrarEquivalencia(idOrigen, idDestino, porcentaje) {
    // Podrías agregar validaciones extra acá si quisieras
    return await GraphRepository.crearEquivalencia(idOrigen, idDestino, porcentaje);
  }

  async buscarEquivalencia(idMateria, sistema) {
    return await GraphRepository.buscarEquivalencia(idMateria, sistema);
  }

  async actualizarMateria(id, datos) { 
    const materiaMongo = await SubjectRepository.update(id, datos); 
    
    if (materiaMongo) {
      try {
        // Para actualizar la materia en Neo4j necesitamos saber su país.
        // Como el país viene de la institución a la que pertenece, lo buscamos:
        const inst = await InstitutionRepository.findById(materiaMongo.institucion);
        const pais = inst ? inst.pais : 'Desconocido';

        await GraphRepository.actualizarMateria(id, materiaMongo.nombre, pais);
      } catch (error) {
        console.error('⚠️ Error actualizando materia en Neo4j:', error.message);
      }
    }
    return materiaMongo;
  }

  async eliminarMateria(id) { 
    const resultadoMongo = await SubjectRepository.delete(id); 
    if (resultadoMongo) {
      try {
        await GraphRepository.eliminarMateria(id);
      } catch (error) {
        console.error('⚠️ Error eliminando materia en Neo4j:', error.message);
      }
    }
    return resultadoMongo;
  }

  async buscarMateriaPorNombre(nombre, limit, skip) { return await SubjectRepository.findByName(nombre, limit, skip); }
  async obtenerMateriasPaginadas(limit, skip) { return await SubjectRepository.findPaged(limit, skip); }

}

module.exports = new OnboardingService();