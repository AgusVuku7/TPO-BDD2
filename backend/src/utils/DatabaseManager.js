const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ MongoDB Conectado');
  } catch (error) {
    console.error('❌ Error en MongoDB:', error);
  }
};

module.exports = { connectMongo };