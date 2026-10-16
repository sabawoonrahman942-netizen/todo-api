const TODO_STATUSES = ['pending', 'in_progress', 'completed'];
const TODO_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const TODO_FIELDS = new Set([
  'title',
  'description',
  'status',
  'priority',
  'due_at',
  'category_id'
]);
const CATEGORY_FIELDS = new Set(['name', 'color']);

function validationError(message, details) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = 'VALIDATION_ERROR';
  if (details) {
    error.details = details;
  }
  return error;
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw validationError(label + ' must be a JSON object.');
  }
}

function rejectUnknownFields(input, allowedFields) {
  const unknown = Object.keys(input).filter((key) => !allowedFields.has(key));
  if (unknown.length > 0) {
    throw validationError('Request contains unsupported fields.', { fields: unknown });
  }
}

function validateTodoPayload(input, partial) {
  requireObject(input, 'Request body');
  rejectUnknownFields(input, TODO_FIELDS);

  if (!partial && !Object.prototype.hasOwnProperty.call(input, 'title')) {
    throw validationError('title is required.');
  }
  if (partial && Object.keys(input).length === 0) {
    throw validationError('Provide at least one field to update.');
  }

  const result = {};

  if (Object.prototype.hasOwnProperty.call(input, 'title')) {
    if (typeof input.title !== 'string' || input.title.trim().length < 1 || input.title.trim().length > 200) {
      throw validationError('title must contain between 1 and 200 characters.');
    }
    result.title = input.title.trim();
  }

  if (Object.prototype.hasOwnProperty.call(input, 'description')) {
    if (typeof input.description !== 'string' || input.description.length > 5000) {
      throw validationError('description must be a string of at most 5000 characters.');
    }
    result.description = input.description;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'status')) {
    if (!TODO_STATUSES.includes(input.status)) {
      throw validationError('status must be pending, in_progress, or completed.');
    }
    result.status = input.status;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'priority')) {
    if (!TODO_PRIORITIES.includes(input.priority)) {
      throw validationError('priority must be low, normal, high, or urgent.');
    }
    result.priority = input.priority;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'due_at')) {
    if (input.due_at === null) {
      result.due_at = null;
    } else if (typeof input.due_at === 'string' && !Number.isNaN(Date.parse(input.due_at))) {
      result.due_at = new Date(input.due_at).toISOString();
    } else {
      throw validationError('due_at must be a valid ISO date-time or null.');
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'category_id')) {
    if (input.category_id === null) {
      result.category_id = null;
    } else if (Number.isSafeInteger(input.category_id) && input.category_id > 0) {
      result.category_id = input.category_id;
    } else {
      throw validationError('category_id must be a positive integer or null.');
    }
  }

  return result;
}

function validateCategoryPayload(input, partial) {
  requireObject(input, 'Request body');
  rejectUnknownFields(input, CATEGORY_FIELDS);

  if (!partial && !Object.prototype.hasOwnProperty.call(input, 'name')) {
    throw validationError('name is required.');
  }
  if (partial && Object.keys(input).length === 0) {
    throw validationError('Provide at least one field to update.');
  }

  const result = {};

  if (Object.prototype.hasOwnProperty.call(input, 'name')) {
    if (typeof input.name !== 'string' || input.name.trim().length < 1 || input.name.trim().length > 80) {
      throw validationError('name must contain between 1 and 80 characters.');
    }
    result.name = input.name.trim();
  }

  if (Object.prototype.hasOwnProperty.call(input, 'color')) {
    if (input.color !== null && (typeof input.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(input.color))) {
      throw validationError('color must be a six-digit hexadecimal color or null.');
    }
    result.color = input.color;
  }

  return result;
}

function parseId(value, label) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw validationError(label + ' must be a positive integer.');
  }
  return id;
}

function parseTodoFilters(query) {
  const limit = query.limit === undefined ? 20 : Number(query.limit);
  const offset = query.offset === undefined ? 0 : Number(query.offset);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw validationError('limit must be an integer between 1 and 100.');
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw validationError('offset must be a non-negative integer.');
  }
  if (query.status !== undefined && !TODO_STATUSES.includes(query.status)) {
    throw validationError('status must be pending, in_progress, or completed.');
  }

  const categoryId = query.category_id === undefined
    ? undefined
    : parseId(query.category_id, 'category_id');

  return { limit, offset, status: query.status, categoryId };
}

module.exports = {
  validateTodoPayload,
  validateCategoryPayload,
  parseId,
  parseTodoFilters
};
