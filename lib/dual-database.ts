import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

// Supabase 客户端（主数据库）
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 本地 PostgreSQL 连接池（备份数据库）
const localPool = new Pool({
  host: process.env.LOCAL_DB_HOST || "localhost",
  port: parseInt(process.env.LOCAL_DB_PORT || "5432"),
  database: process.env.LOCAL_DB_NAME || "secret_capsule_backup",
  user: process.env.LOCAL_DB_USER || "postgres",
  password: process.env.LOCAL_DB_PASSWORD || "",
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 双写结果类型
export interface DualWriteResult {
  supabase: { success: boolean; error?: any };
  local: { success: boolean; error?: any };
}

/**
 * 双写：同时写入 Supabase 和本地 PostgreSQL
 * @param data 要插入的数据对象
 * @returns 两个数据库的写入结果
 */
export async function dualInsert(data: any): Promise<DualWriteResult> {
  const result: DualWriteResult = {
    supabase: { success: false },
    local: { success: false },
  };

  // 1. 写入 Supabase（主数据库）
  try {
    const { error } = await supabase.from("secrets").insert({
      id: data.id,
      cipher: data.cipher,
      salt: data.salt,
      iv: data.iv,
      created_at: data.created_at || new Date().toISOString(),
      retention_period: data.retention_period || "1month",
      expires_at: data.expires_at || null,
      created_by: data.created_by || null,
    });

    if (error) {
      console.error("[Dual-DB] Supabase insert error:", error);
      result.supabase = { success: false, error };
    } else {
      result.supabase = { success: true };
    }
  } catch (err) {
    console.error("[Dual-DB] Supabase insert exception:", err);
    result.supabase = { success: false, error: err };
  }

  // 2. 写入本地 PostgreSQL（备份数据库）
  try {
    const client = await localPool.connect();
    try {
      await client.query(
        `INSERT INTO secrets (id, cipher, salt, iv, created_at, retention_period, expires_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          data.id,
          data.cipher,
          data.salt,
          data.iv,
          data.created_at || new Date().toISOString(),
          data.retention_period || "1month",
          data.expires_at || null,
          data.created_by || null,
        ]
      );
      result.local = { success: true };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[Dual-DB] Local PostgreSQL insert error:", err);
    result.local = { success: false, error: err };
  }

  return result;
}

/**
 * 从 Supabase 读取数据（主读）
 */
export async function readFromSupabase(id: string) {
  const { data, error } = await supabase
    .from("secrets")
    .select("id, cipher, salt, iv, retention_period, expires_at")
    .eq("id", id)
    .single();

  return { data, error };
}

/**
 * 从本地 PostgreSQL 读取数据（备用）
 */
export async function readFromLocal(id: string) {
  try {
    const client = await localPool.connect();
    try {
      const res = await client.query(
        "SELECT id, cipher, salt, iv, retention_period, expires_at FROM secrets WHERE id = $1",
        [id]
      );
      return { data: res.rows[0] || null, error: null };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[Dual-DB] Local PostgreSQL read error:", err);
    return { data: null, error: err };
  }
}

/**
 * 双读：优先从 Supabase 读取，失败时尝试本地数据库
 */
export async function dualRead(id: string) {
  // 先尝试从 Supabase 读取
  const supabaseResult = await readFromSupabase(id);
  if (supabaseResult.data && !supabaseResult.error) {
    return { data: supabaseResult.data, source: "supabase" };
  }

  // Supabase 失败，尝试本地数据库
  console.warn(`[Dual-DB] Supabase read failed for ${id}, trying local backup...`);
  const localResult = await readFromLocal(id);
  if (localResult.data && !localResult.error) {
    return { data: localResult.data, source: "local" };
  }

  // 都失败
  return { data: null, source: "none", error: localResult.error || supabaseResult.error };
}

/**
 * 更新保存期限（双写）
 */
export async function updateRetention(id: string, retentionPeriod: string, expiresAt: string | null) {
  const result: DualWriteResult = {
    supabase: { success: false },
    local: { success: false },
  };

  // 更新 Supabase
  try {
    const { error } = await supabase
      .from("secrets")
      .update({ retention_period: retentionPeriod, expires_at: expiresAt })
      .eq("id", id);

    if (error) {
      result.supabase = { success: false, error };
    } else {
      result.supabase = { success: true };
    }
  } catch (err) {
    result.supabase = { success: false, error: err };
  }

  // 更新本地 PostgreSQL
  try {
    const client = await localPool.connect();
    try {
      await client.query(
        "UPDATE secrets SET retention_period = $1, expires_at = $2 WHERE id = $3",
        [retentionPeriod, expiresAt, id]
      );
      result.local = { success: true };
    } finally {
      client.release();
    }
  } catch (err) {
    result.local = { success: false, error: err };
  }

  return result;
}

/**
 * 获取所有秘密列表（用于管理员面板）
 */
export async function getAllSecrets() {
  // 从 Supabase 获取
  const { data: supabaseData, error: supabaseError } = await supabase
    .from("secrets")
    .select("id, created_at, retention_period, expires_at, created_by")
    .order("created_at", { ascending: false });

  if (supabaseData && !supabaseError) {
    return { data: supabaseData, source: "supabase" };
  }

  // Supabase 失败，从本地获取
  console.warn("[Dual-DB] Supabase list failed, trying local backup...");
  try {
    const client = await localPool.connect();
    try {
      const res = await client.query(
        "SELECT id, created_at, retention_period, expires_at, created_by FROM secrets ORDER BY created_at DESC"
      );
      return { data: res.rows, source: "local" };
    } finally {
      client.release();
    }
  } catch (err) {
    return { data: null, source: "none", error: err };
  }
}

/**
 * 关闭数据库连接池（用于优雅关闭）
 */
export async function closeLocalPool() {
  await localPool.end();
}

export default {
  supabase,
  dualInsert,
  dualRead,
  updateRetention,
  getAllSecrets,
  closeLocalPool,
};
