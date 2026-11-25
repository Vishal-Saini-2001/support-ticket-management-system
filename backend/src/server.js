const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

let server;

async function startServer() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    server = app.listen(env.port, () => {
      console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

