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

  async findByInstitution(instId) {
    return await Subject.find({ institucion: instId }).populate('institucion');
  }

  async findByName(query, limit = 20, skip = 0) {
    const filter = { nombre: { $regex: query, $options: 'i' } };
    const [data, total] = await Promise.all([
      Subject.find(filter).populate('institucion').limit(limit).skip(skip),
      Subject.countDocuments(filter)
    ]);
    return { data, total };
  }

  async findPaged(limit = 20, skip = 0) {
    const [data, total] = await Promise.all([
      Subject.find().populate('institucion').limit(limit).skip(skip),
      Subject.countDocuments()
    ]);
    return { data, total };
  }
}

module.exports = new SubjectRepository();