const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Ej: INST-AR-001
  nombre: { type: String, required: true },
  pais: { type: String, required: true },
  region: { type: String },
  sistema_educativo: { type: String, required: true }, // UK, US, DE, AR [cite: 5-8]
  metadata: { type: mongoose.Schema.Types.Mixed } // Para instancias de recuperatorio, régimen, etc. 
});

module.exports = mongoose.model('Institution', institutionSchema);