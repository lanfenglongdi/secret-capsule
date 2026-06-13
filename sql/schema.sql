CREATE TABLE secrets (
  id TEXT PRIMARY KEY,
  cipher TEXT NOT NULL,
  salt TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON secrets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select" ON secrets FOR SELECT TO anon USING (true);