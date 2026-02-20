const { getRedisClient } = require('../utils/DatabaseManager');

class RepositorioReglas {

  // Recibe la key ya armada y el objeto de la regla
  async pushRule(key, value) {
    const client = getRedisClient();
    // La operación LPUSH es O(1) y garantiza el comportamiento Append-only
    const data = JSON.stringify(value); 
    return await client.lPush(key, data); 
  }

  // Obtiene el elemento más reciente (índice 0) en O(1)
  async getLatestRule(key) {
    const client = getRedisClient();
    const data = await client.lIndex(key, 0); 
    return data ? JSON.parse(data) : null;
  }

  async getAllRuleKeys() {
    const client = getRedisClient();
    // Escanea las llaves con el patrón definido
    return await client.keys('regla:*:*:history');
  }
}

module.exports = new RepositorioReglas();