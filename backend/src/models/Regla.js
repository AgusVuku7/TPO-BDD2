class Regla {
  constructor({ origen, destino, version, mapping, normativa, organismo }) {
    this.origen = origen?.toUpperCase();
    this.destino = destino?.toUpperCase();
    this.version = version || '1.0';
    this.timestamp = Date.now(); // Fundamental para el "Versionado de reglas" del RF2

    // 🆕 CAMPOS REQUERIDOS POR EL ANEXO RF2
    // Registra la ley o resolución que avala la conversión
    this.normativa = normativa || 'Resolución Ministerial 2026/A'; 
    // Indica qué entidad emitió la regla (ej: Ministerio de Educación ZA)
    this.organismo = organismo || 'Organismo Oficial'; 
    
    this.mapping = mapping;
  }

  // Validación robusta para asegurar la integridad de los datos en Redis
  validar() {
    if (!this.origen || !this.destino) throw new Error("Faltan países de origen o destino.");
    
    // Validamos que el criterio normativo esté presente para cumplir el RF2
    if (!this.normativa || !this.organismo) {
      throw new Error("Toda regla debe estar asociada a una normativa y organismo oficial.");
    }

    if (!Array.isArray(this.mapping) || this.mapping.length === 0) {
      throw new Error("La regla debe contener al menos un mapeo.");
    }

    for (const m of this.mapping) {
      if (typeof m.min === 'number' && typeof m.max === 'number') {
        if (m.min > m.max) {
          throw new Error(`Rango numérico inválido: ${m.min} > ${m.max}`);
        }
      }
    }
    return true;
  }
}

module.exports = Regla;