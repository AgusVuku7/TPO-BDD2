const repositorioReglas = require('../repositories/repositorioReglas');

class ConversionService {
  constructor() {
    this.localCache = {}; // Mantenemos el cache local para velocidad extrema
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
    const key = `regla:${origen}:${destino}:${version}`;
    let regla = this.localCache[key];

    if (!regla) {
      regla = await repositorioReglas.get(key); // Pedimos al repo
      if (!regla) throw new Error("Regla no encontrada");
      this.localCache[key] = regla;
    }

    const notaNum = parseFloat(notaOriginal);
    const mapeo = regla.mapping.find(m => notaNum >= m.min && notaNum <= m.max); // Tu lógica de rangos

    return mapeo ? {
      resultado: mapeo.result,
      label: mapeo.label,
      metadata: { version: regla.version, origen: 'cache-local' }
    } : { resultado: "F", label: "Fail" };
  }
}

module.exports = new ConversionService();
