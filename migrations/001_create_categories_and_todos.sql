CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  color VARCHAR(7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_color_format
    CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE UNIQUE INDEX categories_name_case_insensitive_idx
  ON categories (LOWER(name));

CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(10) NOT NULL DEFAULT 'normal',
  due_at TIMESTAMPTZ,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT todos_title_not_blank CHECK (LENGTH(BTRIM(title)) > 0),
  CONSTRAINT todos_status_allowed CHECK (status IN ('pending', 'in_progress', 'completed')),
  CONSTRAINT todos_priority_allowed CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX todos_status_created_at_idx ON todos (status, created_at DESC);
CREATE INDEX todos_category_id_idx ON todos (category_id);
CREATE INDEX todos_due_at_idx ON todos (due_at) WHERE due_at IS NOT NULL;
