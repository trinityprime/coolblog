CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 50000),
  created_at TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx
  ON blog_posts (created_at DESC);