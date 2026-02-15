const Institution = require('../models/institucion');

class InstitutionRepository {
  async create(data) {
    return await Institution.create(data);
  }

  async update(id, data) {
    return await Institution.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Institution.findByIdAndDelete(id);
  }

  async findById(id) {
    return await Institution.findById(id);
  }

  async findByName(query) {
    // El flag 'i' hace que la búsqueda no distinga entre mayúsculas y minúsculas
    return await Institution.find({ 
      nombre: { $regex: query, $options: 'i' } 
    });
  }

  // async findBySystem(sistema) {
  //   return await Institution.find({ sistema_educativo: sistema });
  // }
}

module.exports = new InstitutionRepository();