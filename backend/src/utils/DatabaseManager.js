const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const redis = require('redis');
const cassandra = require('cassandra-driver');

//Varibales globales para acceder a las bases de datos desde otros módulos
let neo4jDriver;
let redisClient;
let cassandraClient;

//MongoDB (Documental)
const connectMongo = async () => {
  try {
    // Usamos la variable de entorno o un fallback local
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edugrade';
    await mongoose.connect(uri);
    console.log('✅ MongoDB: Conectado');
  } catch (error) {
    console.error('❌ MongoDB: Error crítico de conexión', error);
    process.exit(1); //Si falla Mongo, cerramos la app
  }
};

//Neo4j (Grafos)
const connectNeo4j = async () => {
  try {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';

    neo4jDriver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    
    //Verificación real de conectividad
    await neo4jDriver.verifyConnectivity();
    console.log('✅ Neo4j: Conectado');
  } catch (error) {
    console.error('❌ Neo4j: No se pudo conectar', error);
  }
};

//Redis (Clave-Valor)
const connectRedis = async () => {
  try {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 6379;
    
    redisClient = redis.createClient({
      url: `redis://${host}:${port}`
    });

    redisClient.on('error', (err) => console.error('⚠️ Redis Client Error', err));

    await redisClient.connect();
    console.log('✅ Redis: Conectado');
  } catch (error) {
    console.error('❌ Redis: No se pudo conectar', error);
  }
};

//Cassandra (Columnar)
const connectCassandra = async () => {
  try {
    const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost').split(',');
    const localDataCenter = process.env.CASSANDRA_DC || 'datacenter1';
    const keyspace = process.env.CASSANDRA_KEYSPACE || 'edugrade_analitica';

    cassandraClient = new cassandra.Client({
      contactPoints: contactPoints,
      localDataCenter: localDataCenter,
      keyspace: keyspace
    });

    await cassandraClient.connect();
    console.log('✅ Cassandra: Conectado');
  } catch (error) {
    console.error(`❌ Cassandra: Error conectando (Keyspace '${process.env.CASSANDRA_KEYSPACE}' existe?)`, error.message);
    //No matamos el proceso, porque Cassandra puede tardar en levantar
  }
};

//Función para iniciar todo
const connectAll = async () => {
  console.log('🔌 Iniciando servicios de base de datos...');
  await connectMongo();     //Bloqueante
  await connectNeo4j();     //No bloqueante
  await connectRedis();     //No bloqueante
  await connectCassandra(); //No bloqueante
};

//Exportamos las funciones y los clientes
module.exports = {
  connectAll,
  getNeo4jDriver: () => {
    if (!neo4jDriver) throw new Error("Neo4j Driver no inicializado");
    return neo4jDriver;
  },
  getRedisClient: () => {
    if (!redisClient) throw new Error("Redis Client no inicializado");
    return redisClient;
  },
  getCassandraClient: () => {
    if (!cassandraClient) throw new Error("Cassandra Client no inicializado");
    return cassandraClient;
  }
};