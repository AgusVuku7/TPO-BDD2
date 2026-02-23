const StudentRepository = require('../repositories/repositorioEstudiante');
const InstitutionRepository = require('../repositories/repositorioInstitucion');
const SubjectRepository = require('../repositories/repositorioMateria');
const GraphRepository = require('../repositories/repositorioGrafo');
const AnaliticaRepo = require('../repositories/repositorioCassandraAnalitica'); // Importación necesaria

class OnboardingService {
  async registrarEstudiante(datos) {
    // MongoDB: Creamos el estudiante
    const estudianteMongo = await StudentRepository.create(datos);
    // Neo4j: Sincronizamos con el grafo
    try {
      await GraphRepository.crearEstudiante(
        estudianteMongo._id.toString(),
        estudianteMongo.nombre,
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando estudiante con Neo4j:', error.message);
    }
    // Cassandra: Registrar evento de auditoría
    await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteMongo._id, 'CREAR_ESTUDIANTE', { 
        nombre: estudianteMongo.nombre, 
        mail: estudianteMongo.mail 
    });

    return estudianteMongo;
  }

  async actualizarEstudiante(id, datos) {
    // MongoDB: Actualizamos el estudiante
    const estudianteMongo = await StudentRepository.update(id, datos);
    if (estudianteMongo) {
      try {
        // Neo4j: Sincronizamos con el grafo
        await GraphRepository.actualizarEstudiante(id, estudianteMongo.nombre);
      } catch (error) {
        console.error('⚠️ Error actualizando estudiante en Neo4j:', error.message);
      }
      // Cassandra: Registrar evento de auditoría
      await AnaliticaRepo.registrarEvento('ESTUDIANTE', id, 'ACTUALIZAR_ESTUDIANTE', { datos });
    }
    return estudianteMongo;
  }

  async eliminarEstudiante(id) { 
    // MongoDB: Eliminamos el estudiante
    const resultadoMongo = await StudentRepository.delete(id); 
    if (resultadoMongo) {
      try {
        // Neo4j: Sincronizamos con el grafo
        await GraphRepository.eliminarEstudiante(id);
      } catch (error) {
        console.error('⚠️ Error eliminando estudiante en Neo4j:', error.message);
      }
      // Cassandra: Registrar evento de auditoría
      await AnaliticaRepo.registrarEvento('ESTUDIANTE', id, 'ELIMINAR_ESTUDIANTE', {});
    }
    return resultadoMongo;
  }

  async buscarEstudiantePorNombre(nombre, limit, skip) { return await StudentRepository.findByName(nombre, limit, skip); }
  async obtenerEstudiantesPaginados(limit, skip) { return await StudentRepository.findPaged(limit, skip); }

  async registrarInstitucion(datos) {
    // MongoDB: Creamos la institución
    const institucionMongo = await InstitutionRepository.create(datos);
    try {
      // Neo4j: Sincronizamos con el grafo
      await GraphRepository.crearInstitucion(
        institucionMongo._id.toString(),
        institucionMongo.nombre,
        institucionMongo.pais
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando institución con Neo4j:', error.message);
    }
    // Cassandra: Registrar evento de auditoría
    await AnaliticaRepo.registrarEvento('INSTITUCION', institucionMongo._id, 'CREAR_INSTITUCION', { 
        nombre: institucionMongo.nombre, 
        pais: institucionMongo.pais 
    });
    return institucionMongo;
  }

  async actualizarInstitucion(id, datos) { 
    // MongoDB: Actualizamos la institución
    const institucionMongo = await InstitutionRepository.update(id, datos); 
    if (institucionMongo) {
      try {
        // Neo4j: Sincronizamos con el grafo
        await GraphRepository.actualizarInstitucion(id, institucionMongo.nombre, institucionMongo.pais);
      } catch (error) {
        console.error('⚠️ Error actualizando institución en Neo4j:', error.message);
      }
      // Cassandra: Registrar evento de auditoría
      try {
        await AnaliticaRepo.registrarEvento('INSTITUCION', id, 'ACTUALIZAR_INSTITUCION', { datos });
      } catch (error) {
        console.error('⚠️ Error CASSANDRA:', error.message);
      }
    }
    return institucionMongo;
  }

  async eliminarInstitucion(id) { 
    // MongoDB: Eliminamos la institución
    const resultadoMongo = await InstitutionRepository.delete(id); 
    if (resultadoMongo) {
      try {
        // Neo4j: Sincronizamos con el grafo
        await GraphRepository.eliminarInstitucion(id);
      } catch (error) {
        console.error('⚠️ Error eliminando institución en Neo4j:', error.message);
      }
      // Cassandra: Registrar evento de auditoría
      await AnaliticaRepo.registrarEvento('INSTITUCION', id, 'ELIMINAR_INSTITUCION', {});
    }
    return resultadoMongo;
  }

  async buscarInstitucionPorNombre(nombre, limit, skip) { return await InstitutionRepository.findByName(nombre, limit, skip); }
  async obtenerInstitucionesPaginadas(limit, skip) { return await InstitutionRepository.findPaged(limit, skip); }

  async registrarMateria(datos) {
    // Validamos que la institución exista en MongoDB antes de crear la materia
    const inst = await InstitutionRepository.findById(datos.institucion);
    if (!inst) throw new Error("La institución no existe");
    // MongoDB: Creamos la materia
    const materiaMongo = await SubjectRepository.create(datos);
    try {
      // Neo4j: Sincronizamos con el grafo
      await GraphRepository.crearMateria(
        materiaMongo._id.toString(),
        materiaMongo.nombre,
        inst.pais
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando materia con Neo4j:', error.message);
    }

    // Cassandra: Registrar evento de auditoría
    await AnaliticaRepo.registrarEvento('MATERIA', materiaMongo._id, 'CREAR_MATERIA', { 
        nombre: materiaMongo.nombre, 
        institucion: materiaMongo.institucion 
    });

    return materiaMongo;
  }

  async agregarCorrelatividad(idMateria, idCorrelativa) {
    // Validamos que ambas materias existan en MongoDB antes de crear la correlatividad
    const [materia, correlativa] = await Promise.all([
      SubjectRepository.findById(idMateria),
      SubjectRepository.findById(idCorrelativa)
    ]);
    if (!materia || !correlativa) throw new Error("una o ambas materias no existen");

    try {
      // Neo4j: Creamos la correlatividad en el grafo
      await GraphRepository.agregarCorrelatividad(idMateria, idCorrelativa);
    } catch (error) {
      console.error('⚠️ Error sincronizando correlatividad con Neo4j:', error);
      throw new Error("No se pudo registrar la correlatividad en grafos.");
    }
    // Cassandra: Registrar evento de auditoría
    await AnaliticaRepo.registrarEvento('RELACION', idMateria, 'AGREGAR_CORRELATIVIDAD', { 
        correlativaId: idCorrelativa 
    });
    return { mensaje: "Correlatividad registrada con exito" };
  }

  async obtenerCorrelativas(idMateria) {
    try {
      // Neo4j: Obtenemos las correlatividades desde el grafo
      return await GraphRepository.obtenerCorrelativas(idMateria);
    } catch (error) {
      console.error('⚠️ Error obteniendo correlativas:', error);
      return [];
    }
  }

  async registrarEquivalencia(idOrigen, idDestino, porcentaje) {
    // Neo4j: Creamos la equivalencia en el grafo
    const resultado = await GraphRepository.crearEquivalencia(idOrigen, idDestino, porcentaje);
    
    // Cassandra: Registrar evento de auditoría
    await AnaliticaRepo.registrarEvento('RELACION', idOrigen, 'REGISTRAR_EQUIVALENCIA', { 
        destino: idDestino, 
        porcentaje 
    });

    return resultado;
  }

  async buscarEquivalencia(idMateria, sistema) {
    return await GraphRepository.buscarEquivalencia(idMateria, sistema);
  }

  async actualizarMateria(id, datos) { 
    // MongoDB: Actualizamos la materia
    const materiaMongo = await SubjectRepository.update(id, datos); 
    if (materiaMongo) {
      try {
        // Neo4j: Sincronizamos con el grafo
        const inst = await InstitutionRepository.findById(materiaMongo.institucion);
        const pais = inst ? inst.pais : 'Desconocido';
        await GraphRepository.actualizarMateria(id, materiaMongo.nombre, pais);
      } catch (error) {
        console.error('⚠️ Error actualizando materia en Neo4j:', error.message);
      }

      // Cassandra: Registrar evento de auditoría
      await AnaliticaRepo.registrarEvento('MATERIA', id, 'ACTUALIZAR_MATERIA', { datos });
    }
    return materiaMongo;
  }

  async eliminarMateria(id) {
    // MongoDB: Eliminamos la materia
    const resultadoMongo = await SubjectRepository.delete(id); 
    if (resultadoMongo) {
      try {
        // Neo4j: Sincronizamos con el grafo
        await GraphRepository.eliminarMateria(id);
      } catch (error) {
        console.error('⚠️ Error eliminando materia en Neo4j:', error.message);
      }

      // Cassandra: Registrar evento de auditoría
      await AnaliticaRepo.registrarEvento('MATERIA', id, 'ELIMINAR_MATERIA', {});
    }
    return resultadoMongo;
  }

  async buscarMateriaPorNombre(nombre, limit, skip) { return await SubjectRepository.findByName(nombre, limit, skip); }
  async obtenerMateriasPaginadas(limit, skip) { return await SubjectRepository.findPaged(limit, skip); }
  async obtenerMateriasPorInstitucion(instId) { return await SubjectRepository.findByInstitution(instId); }
}

module.exports = new OnboardingService();