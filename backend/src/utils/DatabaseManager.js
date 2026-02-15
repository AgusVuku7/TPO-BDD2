const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');

//Realizamos la conexión a MongoDB
const connectMongo = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ MongoDB Conectado');
  } catch (error) {
    console.error('❌ Error en MongoDB:', error);
    process.exit(1); //Falla crítica si no hay persistencia principal
  }
};

module.exports = { connectMongo };


//Realizamos la conexión a Neo4j
let neo4jDriver;
const connectNeo4j = async () => {
  try {
    const uri = process.env.NEO4J_URI;
    neo4jDriver = neo4j.driver(uri, neo4j.auth.basic('neo4j', 'password'));
    await neo4jDriver.verifyConnectivity();
    console.log('✅ Neo4j Conectado');
  } catch (error) {
    console.error('❌ Error en Neo4j:', error);
  }
};