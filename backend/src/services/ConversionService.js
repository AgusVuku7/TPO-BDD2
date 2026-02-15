const { getRedisClient } = require('../utils/DatabaseManager');

class ConversionService {
  /**
   * Guarda una regla versionada en Redis.
   * La clave sigue el patrón regla:ORIGEN:DESTINO:VERSION
   */
  async guardarRegla(regla) {
    const client = getRedisClient();
    const key = `regla:${regla.origen}:${regla.destino}:${regla.version}`;
    
    // Guardamos el objeto como un string JSON
    await client.set(key, JSON.stringify(regla));
    
    // También actualizamos el puntero a la versión más reciente
    await client.set(`regla:${regla.origen}:${regla.destino}:latest`, JSON.stringify(regla));
    
    return key;
  }

  /**
   * Aplica la conversión buscando en los rangos de Redis
   */
  async convertirNota(origen, destino, notaOriginal, version = 'latest') {
    const client = getRedisClient();
    const key = `regla:${origen}:${destino}:${version}`;
    
    const data = await client.get(key);
    if (!data) throw new Error("No se encontró una regla de conversión activa.");

    const regla = JSON.parse(data);
    const notaNum = parseFloat(notaOriginal);

    // Lógica de mapeo: buscamos en qué rango cae la nota según tu esquema
    const mapeo = regla.mapping.find(m => notaNum >= m.min && notaNum <= m.max);
    
    return mapeo ? {
      resultado: mapeo.result,
      label: mapeo.label,
      metadata: {
        version_regla: regla.version,
        fecha_regla: regla.fecha
      }
    } : { resultado: "F", label: "Fail" };
  }
}

module.exports = new ConversionService();