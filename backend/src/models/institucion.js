const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  pais: { type: String, required: true },
  region: { type: String },
  sistema_educativo: { type: String, required: true }, // UK, US, DE, AR, ZA
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} } // Para instancias de recuperatorio, régimen, etc. 
});

module.exports = mongoose.model('Institution', institutionSchema);