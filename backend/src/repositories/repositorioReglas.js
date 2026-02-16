const { getRedisClient } = require('../utils/DatabaseManager');

class RepositorioReglas {
  /**
   * Guarda el JSON de la regla en Redis
   */
  async set(key, value) {
    const client = getRedisClient();
    return await client.set(key, JSON.stringify(value));
  }

  /**
   * Obtiene la regla desde Redis
   */
  async get(key) {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  }
}

module.exports = new RepositorioReglas();