const Institution = require('../models/institucion');

class InstitutionRepository {
  async create(data) {
    return await Institution.create(data);
  }

  async findBySystem(sistema) {
    return await Institution.find({ sistema_educativo: sistema });
  }

  async findById(id) {
    return await Institution.findById(id);
  }
}

module.exports = new InstitutionRepository();