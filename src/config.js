const port = Number(process.env.PORT || 3000);
const dbPoolMax = Number(process.env.DB_POOL_MAX || 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

if (!Number.isInteger(dbPoolMax) || dbPoolMax < 1 || dbPoolMax > 100) {
  throw new Error('DB_POOL_MAX must be an integer between 1 and 100.');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

module.exports = {
  port,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  dbPoolMax
};
