const { Router } = require('express');
const {
  validateCategoryPayload,
  parseId
} = require('../utils/validation');

function createCategoriesRouter(pool) {
  const router = Router();

  router.get('/', async (req, res) => {
    const result = await pool.query(
      'SELECT id, name, color, created_at, updated_at FROM categories ORDER BY name ASC, id ASC'
    );
    res.json({ data: result.rows });
  });

  router.post('/', async (req, res) => {
    const category = validateCategoryPayload(req.body, false);
    const result = await pool.query(
      'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *',
      [category.name, category.color === undefined ? null : category.color]
    );
    res.status(201).json({ data: result.rows[0] });
  });

  router.get('/:id', async (req, res) => {
    const id = parseId(req.params.id, 'id');
    const result = await pool.query(
      'SELECT id, name, color, created_at, updated_at FROM categories WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Category was not found.' }
      });
    }

    return res.json({ data: result.rows[0] });
  });

  router.patch('/:id', async (req, res) => {
    const id = parseId(req.params.id, 'id');
    const category = validateCategoryPayload(req.body, true);
    const fields = Object.keys(category);
    const values = fields.map((field) => category[field]);
    const assignments = fields.map((field, index) => field + ' = $' + (index + 1));

    assignments.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(
      'UPDATE categories SET ' + assignments.join(', ') + ' WHERE id = $' +
      values.length + ' RETURNING *',
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Category was not found.' }
      });
    }

    return res.json({ data: result.rows[0] });
  });

  router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id, 'id');
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Category was not found.' }
      });
    }

    return res.status(204).end();
  });

  return router;
}

module.exports = createCategoriesRouter;
