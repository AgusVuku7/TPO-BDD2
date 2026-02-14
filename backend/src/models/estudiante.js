const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Ej: EST-0000001
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  documento: { type: String, required: true, unique: true },
  mail: { type: String, required: true },
  pais: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);