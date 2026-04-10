export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    character_name TEXT,
    series TEXT,
    deadline TEXT,
    budget_limit REAL DEFAULT 0,
    status TEXT DEFAULT 'in_progress',
    cover_image TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress',
    time_spent INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL DEFAULT 0,
    store_link TEXT,
    is_bought INTEGER DEFAULT 0,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    image_uri TEXT NOT NULL,
    note TEXT,
    date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS patrons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    uri TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tutos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reference_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    uri TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reference_board (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL UNIQUE,
    bg_color TEXT DEFAULT '#1A1A2E',
    bg_image_uri TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
`;
