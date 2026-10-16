const config = require('./config');
const pool = require('./db/pool');
const { runMigrations } = require('./db/migrate');
const { createApp } = require('./app');

async function start() {
  await runMigrations(pool);

  const app = createApp(pool);
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log('To-Do API listening on port ' + config.port);
  });

  server.on('error', (error) => {
    console.error('HTTP server error:', error);
    process.exitCode = 1;
  });

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log('Received ' + signal + '; shutting down.');

    server.close(async (error) => {
      if (error) {
        console.error('HTTP server shutdown error:', error);
        process.exitCode = 1;
      }
      await pool.end();
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch(async (error) => {
  console.error('Application startup failed:', error);
  await pool.end();
  process.exitCode = 1;
});
