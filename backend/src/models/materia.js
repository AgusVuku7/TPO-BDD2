const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nivel: { type: String, required: true }, // Secundario, Universitario, etc.
  institucion: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true }, // Referencia al _id de la institución
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} } // Horas, régimen, correlativas teóricas
});

module.exports = mongoose.model('Subject', subjectSchema);