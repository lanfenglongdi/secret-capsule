const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function initDatabase() {
  console.log('Creating secrets table...');

  // Create the table
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS secrets (
        id TEXT PRIMARY KEY,
        cipher TEXT NOT NULL,
        salt TEXT NOT NULL,
        iv TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (createError) {
    console.error('Error creating table:', createError);
  } else {
    console.log('Table created successfully!');
  }

  // Enable RLS
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;'
  });

  if (rlsError) {
    console.error('Error enabling RLS:', rlsError);
  } else {
    console.log('RLS enabled!');
  }

  // Create policies
  const { error: policyError1 } = await supabase.rpc('exec_sql', {
    sql: 'CREATE POLICY "Allow public insert" ON secrets FOR INSERT TO anon WITH CHECK (true);'
  });

  const { error: policyError2 } = await supabase.rpc('exec_sql', {
    sql: 'CREATE POLICY "Allow public select" ON secrets FOR SELECT TO anon USING (true);'
  });

  if (policyError1 || policyError2) {
    console.error('Error creating policies:', policyError1 || policyError2);
  } else {
    console.log('Policies created successfully!');
  }

  console.log('Database initialization complete!');
}

initDatabase().catch(console.error);
