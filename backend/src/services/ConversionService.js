const repositorioReglas = require('../repositories/repositorioReglas');
const Regla = require('../models/Regla');
const { getRedisClient } = require('../utils/DatabaseManager');

class ConversionService {
  constructor() {
    this.localCache = {}; // Cumple con el requisito de "Cacheo de conversiones frecuentes"
  }

  async limpiarReglas() {
    try {
      const redisClient = getRedisClient();
      
      // Borra todas las llaves de la base de datos actual en Redis
      // Como usas la versión 5.10.0 de la librería 'redis', es una función asíncrona.
      await redisClient.flushDb();
      
      // Es fundamental vaciar también el caché en memoria del servicio
      this.localCache = {};
      
      console.log('🗑️ Redis y caché local vaciados correctamente.');
    } catch (error) {
      console.error('❌ Error al limpiar Redis:', error);
      throw error;
    }
  }

  // RF2: Registro de nuevas normativas con versionado
  async guardarRegla(datosRegla) {
    const nuevaRegla = new Regla(datosRegla);
    nuevaRegla.validar();

    // Las reglas se guardan en listas de Redis (LPUSH) para mantener el historial
    const historyKey = `regla:${nuevaRegla.origen}:${nuevaRegla.destino}:history`;
    await repositorioReglas.pushRule(historyKey, nuevaRegla);
    
    // Al guardar una regla nueva, invalidamos el caché local para forzar la actualización
    const cacheKey = `regla:${nuevaRegla.origen}:${nuevaRegla.destino}:latest`;
    delete this.localCache[cacheKey];
    
    return historyKey;
  }

  // RF2: Aplicación de reglas en tiempo real con auditoría del criterio aplicado
  async convertirNota(origen, destino, notaOriginal) {
    const _origen = origen?.toUpperCase();
    const _destino = destino?.toUpperCase();
    const notaNormalizada = notaOriginal.toString().trim().toUpperCase();
    const notaNum = parseFloat(notaOriginal);

    if (_origen === _destino) return { resultado: notaNormalizada, label: "Mismo Sistema" };

    // 1. Búsqueda rápida en Caché Local (O(1))
    const cacheKey = `regla:${_origen}:${_destino}:latest`;
    let regla = this.localCache[cacheKey];

    // 2. Si no está en caché, buscamos en Redis (O(1) usando LINDEX 0)
    if (!regla) {
      const historyKey = `regla:${_origen}:${_destino}:history`;
      regla = await repositorioReglas.getLatestRule(historyKey);
      
      if (!regla) throw new Error(`No existe normativa para convertir de ${_origen} a ${_destino}.`);
      this.localCache[cacheKey] = regla; // Alimentamos el caché
    }

    // 3. Aplicación de la lógica de mapeo (Híbrida: Letras y Números)
    const mapeo = regla.mapping.find(m => {
      // A. Coincidencia exacta con min o max (Ideal para 'A*' o los extremos)
      if (notaNormalizada === m.min.toString().toUpperCase() || 
          notaNormalizada === m.max.toString().toUpperCase()) {
        return true;
      }

      // B. Coincidencia por rango numérico (ej: 7.5 de Argentina)
      if (!isNaN(notaNum) && typeof m.min === 'number' && typeof m.max === 'number') {
        return notaNum >= m.min && notaNum <= m.max;
      }

      // C. Coincidencia por rango de letras (ej: nota 'B' en un rango min: 'A', max: 'C')
      if (isNaN(notaNum) && typeof m.min === 'string' && typeof m.max === 'string') {
        return notaNormalizada >= m.min.toUpperCase() && notaNormalizada <= m.max.toUpperCase();
      }

      return false;
    });

    if (!mapeo) throw new Error(`La nota "${notaOriginal}" no tiene una equivalencia definida.`);

    // 4. RETORNO CON AUDITORÍA (Cumple el Anexo RF2)
    return {
      resultado: mapeo.result,
      label: mapeo.label,
      metadata: { 
        version: regla.version,
        aplicada_el: new Date(regla.timestamp).toLocaleDateString() 
      }
    };
  }

  async obtenerTodas() {
  // 1. Pedimos las llaves al repo
  const keys = await repositorioReglas.getAllRuleKeys();
  
  // 2. Mapeamos cada llave a su regla más reciente
  const promesas = keys.map(key => repositorioReglas.getLatestRule(key));
  const resultados = await Promise.all(promesas);

  // Filtramos nulos por si alguna lista quedó vacía
  return resultados.filter(r => r !== null);
}
}

module.exports = new ConversionService();