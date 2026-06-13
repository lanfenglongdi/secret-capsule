import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 .env.local 文件
const envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_KEY;

console.log('Initializing database...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    // 执行 SQL 创建表
    const { data, error } = await supabase.from('_sql').select('*').limit(0);
    
    // 使用 REST API 直接插入数据来测试表是否存在
    // 首先尝试创建表
    console.log('\nCreating secrets table...');
    
    // 通过执行原始 SQL 来创建表
    // 注意：Supabase JS Client 不直接支持执行任意 SQL
    // 我们需要使用 RPC 或者直接在 Dashboard 中执行
    
    console.log('\n⚠️  Due to Supabase client limitations, please create the table manually:');
    console.log('\n1. Go to: https://supabase.com/dashboard/project/fgushinpapaczugfztfg/sql/new');
    console.log('\n2. Copy and paste this SQL:');
    console.log(`
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
`);
    console.log('\n3. Click "Run" to execute the SQL');
    console.log('\nAfter creating the table, you can start your app with: npm run dev\n');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

initDatabase();
