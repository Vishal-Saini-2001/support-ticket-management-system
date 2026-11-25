const mongoose = require('mongoose');
const env = require('./env');

async function connectDB(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(uri);
  return connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = {
  connectDB,
  disconnectDB,
};

