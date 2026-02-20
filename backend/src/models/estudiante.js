const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  documento: { type: String, required: true, unique: true },
  mail: { type: String, required: true },
  pais: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} } // ej: fecha de ingreso, becas, etc.
});

module.exports = mongoose.model('Student', studentSchema);