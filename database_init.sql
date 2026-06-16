-- Secret Capsule Database Initialization Script
-- Execute this SQL in your Supabase project's SQL Editor

-- Create secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id TEXT PRIMARY KEY,
  cipher TEXT NOT NULL,
  salt TEXT NOT NULL,
  iv TEXT NOT NULL,
  captcha_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since data is end-to-end encrypted)
CREATE POLICY "Allow all operations on secrets" ON secrets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_secrets_id ON secrets(id);
