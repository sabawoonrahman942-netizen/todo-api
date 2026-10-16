const { Router } = require('express');
const {
  validateTodoPayload,
  parseId,
  parseTodoFilters
} = require('../utils/validation');

const TODO_COLUMNS = {
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  due_at: 'due_at',
  category_id: 'category_id'
};
const TODO_SELECT =
  'SELECT t.id, t.title, t.description, t.status, t.priority, t.due_at, ' +
  't.category_id, c.name AS category_name, t.created_at, t.updated_at ' +
  'FROM todos t LEFT JOIN categories c ON c.id = t.category_id';

function createTodosRouter(pool) {
  const router = Router();

  router.get('/', async (req, res) => {
    const filters = parseTodoFilters(req.query);
    const where = [];
    const values = [];

    if (filters.status) {
      values.push(filters.status);
      where.push('t.status = $' + values.length);
    }
    if (filters.categoryId !== undefined) {
      values.push(filters.categoryId);
      where.push('t.category_id = $' + values.length);
    }

    const whereSql = where.length > 0 ? ' WHERE ' + where.join(' AND ') : '';
    const countResult = await pool.query(
      'SELECT COUNT(*)::text AS total FROM todos t' + whereSql,
      values
    );
    const listValues = values.concat([filters.limit, filters.offset]);
    const limitPosition = values.length + 1;
    const offsetPosition = values.length + 2;
    const result = await pool.query(
      TODO_SELECT +
      whereSql +
      ' ORDER BY t.created_at DESC, t.id DESC LIMIT $' + limitPosition +
      ' OFFSET $' + offsetPosition,
      listValues
    );

    res.json({
      data: result.rows,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: Number(countResult.rows[0].total)
      }
    });
  });

  router.post('/', async (req, res) => {
    const todo = validateTodoPayload(req.body, false);
    const inserted = await pool.query(
      'INSERT INTO todos (title, description, status, priority, due_at, category_id) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        todo.title,
        todo.description === undefined ? '' : todo.description,
        todo.status || 'pending',
        todo.priority || 'normal',
        todo.due_at === undefined ? null : todo.due_at,
        todo.category_id === undefined ? null : todo.category_id
      ]
    );
    const result = await pool.query(TODO_SELECT + ' WHERE t.id = $1', [inserted.rows[0].id]);

    res.status(201).json({ data: result.rows[0] });
  });

  router.get('/:id', async (req, res) => {
    const id = parseId(req.params.id, 'id');
    const result = await pool.query(
      TODO_SELECT + ' WHERE t.id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Todo was not found.' }
      });
    }

    return res.json({ data: result.rows[0] });
  });

  router.patch('/:id', async (req, res) => {
    const id = parseId(req.params.id, 'id');
    const todo = validateTodoPayload(req.body, true);
    const fields = Object.keys(todo);
    const values = fields.map((field) => todo[field]);
    const assignments = fields.map((field, index) => {
      return TODO_COLUMNS[field] + ' = $' + (index + 1);
    });

    assignments.push('updated_at = NOW()');
    values.push(id);

    const updated = await pool.query(
      'UPDATE todos SET ' + assignments.join(', ') + ' WHERE id = $' +
      values.length + ' RETURNING id',
      values
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Todo was not found.' }
      });
    }

    const result = await pool.query(TODO_SELECT + ' WHERE t.id = $1', [updated.rows[0].id]);
    return res.json({ data: result.rows[0] });
  });

  router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id, 'id');
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Todo was not found.' }
      });
    }

    return res.status(204).end();
  });

  return router;
}

module.exports = createTodosRouter;
