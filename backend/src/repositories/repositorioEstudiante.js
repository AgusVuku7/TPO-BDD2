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

  async findByName(query) {
  return await Student.find({
    $or: [
      { nombre: { $regex: query, $options: 'i' } },
      { apellido: { $regex: query, $options: 'i' } }
    ]
  });
}

}

module.exports = new StudentRepository();