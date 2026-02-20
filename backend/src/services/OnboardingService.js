const StudentRepository = require('../repositories/repositorioEstudiante');
const InstitutionRepository = require('../repositories/repositorioInstitucion');
const SubjectRepository = require('../repositories/repositorioMateria');
const GraphRepository = require('../repositories/repositorioGrafo');
const AnaliticaRepo = require('../repositories/repositorioCassandraAnalitica'); // Importación necesaria

class OnboardingService {
  async registrarEstudiante(datos) {
    // Guardamos en MongoDB
    const estudianteMongo = await StudentRepository.create(datos);

    // Replicamos en Neo4j
    try {
      await GraphRepository.crearEstudiante(
        estudianteMongo._id.toString(),
        estudianteMongo.nombre,
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando estudiante con Neo4j:', error.message);
    }

    // REGISTRO EN CASSANDRA
    await AnaliticaRepo.registrarEvento('ESTUDIANTE', estudianteMongo._id, 'CREAR_ESTUDIANTE', { 
        nombre: estudianteMongo.nombre, 
        mail: estudianteMongo.mail 
    });

    return estudianteMongo;
  }

  async actualizarEstudiante(id, datos) {
    const estudianteMongo = await StudentRepository.update(id, datos);
    if (estudianteMongo) {
      try {
        await GraphRepository.actualizarEstudiante(id, estudianteMongo.nombre);
      } catch (error) {
        console.error('⚠️ Error actualizando estudiante en Neo4j:', error.message);
      }

      // REGISTRO EN CASSANDRA
      await AnaliticaRepo.registrarEvento('ESTUDIANTE', id, 'ACTUALIZAR_ESTUDIANTE', { datos });
    }
    return estudianteMongo;
  }

  async eliminarEstudiante(id) { 
    const resultadoMongo = await StudentRepository.delete(id); 
    if (resultadoMongo) {
      try {
        await GraphRepository.eliminarEstudiante(id);
      } catch (error) {
        console.error('⚠️ Error eliminando estudiante en Neo4j:', error.message);
      }

      // REGISTRO EN CASSANDRA
      await AnaliticaRepo.registrarEvento('ESTUDIANTE', id, 'ELIMINAR_ESTUDIANTE', {});
    }
    return resultadoMongo;
  }

  async buscarEstudiantePorNombre(nombre, limit, skip) { return await StudentRepository.findByName(nombre, limit, skip); }
  async obtenerEstudiantesPaginados(limit, skip) { return await StudentRepository.findPaged(limit, skip); }

  async registrarInstitucion(datos) {
    const institucionMongo = await InstitutionRepository.create(datos);
    try {
      await GraphRepository.crearInstitucion(
        institucionMongo._id.toString(),
        institucionMongo.nombre,
        institucionMongo.pais
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando institución con Neo4j:', error.message);
    }

    // REGISTRO EN CASSANDRA
    await AnaliticaRepo.registrarEvento('INSTITUCION', institucionMongo._id, 'CREAR_INSTITUCION', { 
        nombre: institucionMongo.nombre, 
        pais: institucionMongo.pais 
    });

    return institucionMongo;
  }

  async actualizarInstitucion(id, datos) { 
    const institucionMongo = await InstitutionRepository.update(id, datos); 
    if (institucionMongo) {
      try {
        await GraphRepository.actualizarInstitucion(id, institucionMongo.nombre, institucionMongo.pais);
      } catch (error) {
        console.error('⚠️ Error actualizando institución en Neo4j:', error.message);
      }

      // REGISTRO EN CASSANDRA
      try {
        await AnaliticaRepo.registrarEvento('INSTITUCION', id, 'ACTUALIZAR_INSTITUCION', { datos });
      } catch (error) {
        console.error('⚠️ Error CASSANDRA:', error.message);
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

      // REGISTRO EN CASSANDRA
      await AnaliticaRepo.registrarEvento('INSTITUCION', id, 'ELIMINAR_INSTITUCION', {});
    }
    return resultadoMongo;
  }

  async buscarInstitucionPorNombre(nombre, limit, skip) { return await InstitutionRepository.findByName(nombre, limit, skip); }
  async obtenerInstitucionesPaginadas(limit, skip) { return await InstitutionRepository.findPaged(limit, skip); }

  async registrarMateria(datos) {
    const inst = await InstitutionRepository.findById(datos.institucion);
    if (!inst) throw new Error("La institución no existe");

    const materiaMongo = await SubjectRepository.create(datos);
    try {
      await GraphRepository.crearMateria(
        materiaMongo._id.toString(),
        materiaMongo.nombre,
        inst.pais
      );
    } catch (error) {
      console.error('⚠️ Error sincronizando materia con Neo4j:', error.message);
    }

    // REGISTRO EN CASSANDRA
    await AnaliticaRepo.registrarEvento('MATERIA', materiaMongo._id, 'CREAR_MATERIA', { 
        nombre: materiaMongo.nombre, 
        institucion: materiaMongo.institucion 
    });

    return materiaMongo;
  }

  async agregarCorrelatividad(idMateria, idCorrelativa) {
    const [materia, correlativa] = await Promise.all([
      SubjectRepository.findById(idMateria),
      SubjectRepository.findById(idCorrelativa)
    ]);

    if (!materia || !correlativa) throw new Error("una o ambas materias no existen");

    try {
      await GraphRepository.agregarCorrelatividad(idMateria, idCorrelativa);
    } catch (error) {
      console.error('⚠️ Error sincronizando correlatividad con Neo4j:', error);
      throw new Error("No se pudo registrar la correlatividad en grafos.");
    }

    // REGISTRO EN CASSANDRA
    await AnaliticaRepo.registrarEvento('RELACION', idMateria, 'AGREGAR_CORRELATIVIDAD', { 
        correlativaId: idCorrelativa 
    });

    return { mensaje: "Correlatividad registrada con exito" };
  }

  async obtenerCorrelativas(idMateria) {
    try {
      return await GraphRepository.obtenerCorrelativas(idMateria);
    } catch (error) {
      console.error('⚠️ Error obteniendo correlativas:', error);
      return [];
    }
  }

  async registrarEquivalencia(idOrigen, idDestino, porcentaje) {
    const resultado = await GraphRepository.crearEquivalencia(idOrigen, idDestino, porcentaje);
    
    // REGISTRO EN CASSANDRA
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
    const materiaMongo = await SubjectRepository.update(id, datos); 
    if (materiaMongo) {
      try {
        const inst = await InstitutionRepository.findById(materiaMongo.institucion);
        const pais = inst ? inst.pais : 'Desconocido';
        await GraphRepository.actualizarMateria(id, materiaMongo.nombre, pais);
      } catch (error) {
        console.error('⚠️ Error actualizando materia en Neo4j:', error.message);
      }

      // REGISTRO EN CASSANDRA
      await AnaliticaRepo.registrarEvento('MATERIA', id, 'ACTUALIZAR_MATERIA', { datos });
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

      // REGISTRO EN CASSANDRA
      await AnaliticaRepo.registrarEvento('MATERIA', id, 'ELIMINAR_MATERIA', {});
    }
    return resultadoMongo;
  }

  async buscarMateriaPorNombre(nombre, limit, skip) { return await SubjectRepository.findByName(nombre, limit, skip); }
  async obtenerMateriasPaginadas(limit, skip) { return await SubjectRepository.findPaged(limit, skip); }
}

module.exports = new OnboardingService();