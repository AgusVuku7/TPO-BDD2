const repositorioReglas = require('../repositories/repositorioReglas');

class ConversionService {
  constructor() {
    this.localCache = {};
  }

  async guardarRegla(regla) {
    const key = `regla:${regla.origen}:${regla.destino}:${regla.version}`;
    const latestKey = `regla:${regla.origen}:${regla.destino}:latest`;
    
    // Usamos el repositorio en lugar de getRedisClient directamente
    await repositorioReglas.set(key, regla);
    await repositorioReglas.set(latestKey, regla);
    
    delete this.localCache[key];
    delete this.localCache[latestKey];
    return key;
  }

  async convertirNota(origen, destino, notaOriginal, version = 'latest') {
    // 1. Normalización y Validación básica
    const _origen = origen?.toUpperCase();
    const _destino = destino?.toUpperCase();
    const notaNum = parseFloat(notaOriginal);

    if (isNaN(notaNum)) throw new Error("La calificación debe ser un número válido.");
    
    // 2. Caso de Identidad: Si el origen y destino son iguales, no hace falta Redis
    if (_origen === _destino) {
      return {
        resultado: notaNum.toString(),
        label: "Escala Original",
        metadata: { version: "n/a", origen: "identity-logic" }
      };
    }

    const key = `regla:${_origen}:${_destino}:${version}`;
    let regla = this.localCache[key];

    if (!regla) {
      regla = await repositorioReglas.get(key);
      if (!regla) throw new Error(`No existe una regla de conversión de ${_origen} a ${_destino}.`);
      this.localCache[key] = regla;
    }

    // 3. Búsqueda de mapeo con protección de rango
    const mapeo = regla.mapping.find(m => notaNum >= m.min && notaNum <= m.max);

    if (!mapeo) {
      throw new Error(`La nota ${notaNum} está fuera del rango permitido para el sistema ${_origen}.`);
    }

    return {
      resultado: mapeo.result,
      label: mapeo.label,
      metadata: { version: regla.version }
    };
  }
}

module.exports = new ConversionService();
