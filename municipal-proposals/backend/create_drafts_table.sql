-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  category_id INTEGER REFERENCES categories(id),
  municipality_id INTEGER DEFAULT 1,
  summary TEXT,
  details JSONB DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_drafts_author_id ON drafts(author_id);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at);

-- Add comment
COMMENT ON TABLE drafts IS 'Draft proposals that users can save and continue later';
COMMENT ON COLUMN drafts.details IS 'JSON object containing problem, solution, cost, impact fields';
COMMENT ON COLUMN drafts.attachments IS 'Array of file names/paths';
