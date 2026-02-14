const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Ej: MAT-AR-FIS1
  nombre: { type: String, required: true },
  nivel: { type: String, required: true }, // Secundario, Universitario, etc. [cite: 163]
  institucion: { type: String, required: true, ref: 'Institution' }, // Referencia al _id de la institución
  metadata: { type: mongoose.Schema.Types.Mixed } // Horas, régimen, correlativas teóricas [cite: 163]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);