const Subject = require('../models/materia');

class SubjectRepository {
  async create(subjectData) {
    return await Subject.create(subjectData); 
  }

  async update(id, data) {
    return await Subject.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Subject.findByIdAndDelete(id);
  }

  async findById(id) {
    return await Subject.findById(id);
  }

  async findByName(query) {
    // El flag 'i' hace que la búsqueda no distinga entre mayúsculas y minúsculas
    return await Subject.find({ 
      nombre: { $regex: query, $options: 'i' } 
    });
  }

    // Buscar materias de una institución específica
  // async findByInstitution(instId) {
  //   return await Subject.find({ institucion: instId });
  // }

  // Buscar por nivel educativo (útil para el RF1)
  // async findByLevel(nivel) {
  //   return await Subject.find({ nivel });
  // }
}

module.exports = new SubjectRepository();