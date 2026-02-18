const repositorioReglas = require('../repositories/repositorioReglas');
const Regla = require('../models/Regla');

class ConversionService {
  constructor() {
    this.localCache = {}; // Cumple con el requisito de "Cacheo de conversiones frecuentes"
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
      // Coincidencia exacta (ej: 'A*' de UK)
      if (notaNormalizada === m.min.toString().toUpperCase()) return true;

      // Coincidencia por rango numérico (ej: 7.5 de Argentina)
      if (!isNaN(notaNum) && typeof m.min === 'number' && typeof m.max === 'number') {
        return notaNum >= m.min && notaNum <= m.max;
      }
      return false;
    });

    if (!mapeo) throw new Error(`La nota "${notaOriginal}" no tiene una equivalencia definida.`);

    // 4. RETORNO CON AUDITORÍA (Cumple el Anexo RF2)
    return {
      resultado: mapeo.result,
      label: mapeo.label,
      normativa: regla.normativa, // Registro del criterio normativo aplicado
      organismo: regla.organismo, // Dependencia del organismo oficial
      metadata: { 
        version: regla.version,
        aplicada_el: new Date(regla.timestamp).toLocaleDateString() 
      }
    };
  }
}

module.exports = new ConversionService();