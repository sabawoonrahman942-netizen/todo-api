require('dotenv').config();

const pool = require('../src/db/pool');
const { runMigrations } = require('../src/db/migrate');

runMigrations(pool)
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Database migration failed:', error);
    await pool.end();
    process.exitCode = 1;
  });
