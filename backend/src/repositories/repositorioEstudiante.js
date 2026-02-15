const Student = require('../models/estudiante');

class StudentRepository {
  async create(data) {
    return await Student.create(data);
  }

  async update(id, data) {
    return await Student.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Student.findByIdAndDelete(id);
  }

  async findById(id) {
    return await Student.findById(id);
  }

  async findByName(query, limit = 20, skip = 0) {
    const filter = {
      $or: [
        { nombre: { $regex: query, $options: 'i' } },
        { apellido: { $regex: query, $options: 'i' } }
      ]
    };

    const [data, total] = await Promise.all([
      Student.find(filter).limit(limit).skip(skip),
      Student.countDocuments(filter)
    ]);

    return { data, total };
  }

  async findPaged(limit = 20, skip = 0) {
    const [data, total] = await Promise.all([
      Student.find().limit(limit).skip(skip).sort({ createdAt: -1 }),
      Student.countDocuments()
    ]);

    return { data, total };
  }

}

module.exports = new StudentRepository();