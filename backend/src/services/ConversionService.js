const repositorioReglas = require('../repositories/repositorioReglas');
const Regla = require('../models/Regla');

class ConversionService {
  constructor() {
    this.localCache = {};
  }

  async guardarRegla(datosRegla) {
    // 1. Instanciamos el modelo
    const nuevaRegla = new Regla(datosRegla);

    // 2. Ejecutamos la validación del modelo
    nuevaRegla.validar();

    // 3. Generamos la key de historial
    const historyKey = `regla:${nuevaRegla.origen}:${nuevaRegla.destino}:history`;
    
    // 4. Guardamos el objeto instanciado (Redis guardará el JSON resultante)
    await repositorioReglas.pushRule(historyKey, nuevaRegla);
    
    // 5. Invalidador de caché
    const cacheKey = `regla:${nuevaRegla.origen}:${nuevaRegla.destino}:latest`;
    delete this.localCache[cacheKey];
    
    return historyKey;
  }

  async convertirNota(origen, destino, notaOriginal) {
    const _origen = origen?.toUpperCase();
    const _destino = destino?.toUpperCase();
    
    // Normalizamos la nota de entrada (quitamos espacios y pasamos a Mayúsculas)
    const notaNormalizada = notaOriginal.toString().trim().toUpperCase();
    const notaNum = parseFloat(notaOriginal);

    if (_origen === _destino) {
      return {
        resultado: notaNormalizada,
        label: "Escala Original",
        metadata: { version: "n/a", origen: "identity-logic" }
      };
    }

    const cacheKey = `regla:${_origen}:${_destino}:latest`;
    let regla = this.localCache[cacheKey];

    if (!regla) {
      const historyKey = `regla:${_origen}:${_destino}:history`;
      regla = await repositorioReglas.getLatestRule(historyKey);
      
      if (!regla) throw new Error(`No existe una regla de conversión de ${_origen} a ${_destino}.`);
      this.localCache[cacheKey] = regla;
    }

    // LÓGICA DE BÚSQUEDA HÍBRIDA
    const mapeo = regla.mapping.find(m => {
      // 1. Coincidencia exacta (Para escalas alfabéticas como UK: 'A*', 'B', 'C')
      const minStr = m.min.toString().toUpperCase();
      const maxStr = m.max.toString().toUpperCase();
      
      if (notaNormalizada === minStr || notaNormalizada === maxStr) {
        return true;
      }

      // 2. Coincidencia por rango (Para escalas numéricas como AR: 1-10 o US: 0.0-4.0)
      if (!isNaN(notaNum) && typeof m.min === 'number' && typeof m.max === 'number') {
        return notaNum >= m.min && notaNum <= m.max;
      }

      return false;
    });

    if (!mapeo) {
      throw new Error(`La nota "${notaOriginal}" no es válida para el sistema ${_origen}.`);
    }

    return {
      resultado: mapeo.result,
      label: mapeo.label,
      metadata: { 
        version: regla.version,
        timestamp: regla.timestamp 
      }
    };
  }
}

module.exports = new ConversionService();