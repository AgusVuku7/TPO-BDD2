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

  async findByName(query, limit = 20, skip = 0) {
    const filter = { nombre: { $regex: query, $options: 'i' } };
    const [data, total] = await Promise.all([
      Institution.find(filter).limit(limit).skip(skip),
      Institution.countDocuments(filter)
    ]);
    return { data, total };
  }

  async findPaged(limit = 20, skip = 0) {
    const [data, total] = await Promise.all([
      Institution.find().limit(limit).skip(skip),
      Institution.countDocuments()
    ]);
    return { data, total };
  }
}

module.exports = new InstitutionRepository();