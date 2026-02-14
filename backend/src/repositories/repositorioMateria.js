const Subject = require('../models/materia');

class SubjectRepository {
  async create(subjectData) {
    const subject = new Subject(subjectData);
    return await subject.save();
  }

  // Buscar materias de una institución específica
  async findByInstitution(instId) {
    return await Subject.find({ institucion: instId });
  }

  // Buscar por nivel educativo (útil para el RF1)
  async findByLevel(nivel) {
    return await Subject.find({ nivel });
  }

  async findById(id) {
    return await Subject.findById(id);
  }
}

module.exports = new SubjectRepository();