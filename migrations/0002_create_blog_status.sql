CREATE TABLE IF NOT EXISTS blog_status (
  id TEXT PRIMARY KEY NOT NULL CHECK (id = 'current'),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 180),
  updated_at TEXT NOT NULL
) STRICT;