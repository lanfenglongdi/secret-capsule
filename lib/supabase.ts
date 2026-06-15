import { createClient } from "@supabase/supabase-js";

// 服务器端客户端（使用服务角色密钥，用于数据库操作）
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 浏览器端认证客户端（使用匿名密钥，用于用户认证）
export const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);