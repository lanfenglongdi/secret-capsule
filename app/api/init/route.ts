import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  try {
    // 尝试创建表
    // 注意：Supabase JS Client 不支持直接执行 DDL 语句
    // 我们需要使用其他方式
    
    return NextResponse.json({
      message: "Please use SQL Editor to create the table",
      sql: `
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
      `.trim()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
