class Regla {
  constructor({ origen, destino, version, mapping }) {
    this.origen = origen?.toUpperCase();
    this.destino = destino?.toUpperCase();
    this.version = version || '1.0';
    this.timestamp = Date.now(); // Cumple con el requisito Append-only
    this.mapping = mapping;
  }

  // Centralizamos la validación aquí para que el Service sea más limpio
  validar() {
    if (!this.origen || !this.destino) throw new Error("Faltan países de origen o destino.");
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