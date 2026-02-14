const Student = require('../models/estudiante');

class StudentRepository {
  async create(data) {
    return await Student.create(data);
  }

  async findById(id) {
    return await Student.findById(id);
  }

  async getAll() {
    return await Student.find();
  }
}

module.exports = new StudentRepository();