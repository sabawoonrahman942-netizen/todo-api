const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const createTodosRouter = require('./routes/todos');
const createCategoriesRouter = require('./routes/categories');

function createApp(pool) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (req, res) => {
    res.json({
      name: 'To-Do API',
      version: '2.0.0',
      documentation: '/docs/openapi.yaml',
      health: '/health'
    });
  });

  app.get('/docs/openapi.yaml', (req, res) => {
    const specPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
    res.type('application/yaml').send(fs.readFileSync(specPath, 'utf8'));
  });

  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      return res.json({ status: 'ok', database: 'ok' });
    } catch (error) {
      return res.status(503).json({
        status: 'error',
        database: 'unavailable'
      });
    }
  });

  app.use('/api/v1/todos', createTodosRouter(pool));
  app.use('/api/v1/categories', createCategoriesRouter(pool));

  app.use((req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Route was not found.' }
    });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    let statusCode = error.statusCode || 500;
    let code = error.code || 'INTERNAL_ERROR';
    let message = statusCode >= 500 ? 'An unexpected error occurred.' : error.message;

    if (error.type === 'entity.parse.failed') {
      statusCode = 400;
      code = 'INVALID_JSON';
      message = 'Request body must contain valid JSON.';
    } else if (error.code === '23505') {
      statusCode = 409;
      code = 'CONFLICT';
      message = 'A record with the same unique value already exists.';
    } else if (error.code === '23503') {
      statusCode = 400;
      code = 'INVALID_REFERENCE';
      message = 'The referenced category does not exist.';
    } else if (error.code === '23514') {
      statusCode = 400;
      code = 'CONSTRAINT_VIOLATION';
      message = 'One or more values are not allowed.';
    }

    if (statusCode >= 500) {
      console.error(error);
    }

    const body = { error: { code, message } };
    if (error.details) {
      body.error.details = error.details;
    }
    return res.status(statusCode).json(body);
  });

  return app;
}

module.exports = { createApp };
