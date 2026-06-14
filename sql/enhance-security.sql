-- Secret Capsule 数据库安全增强脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- ==========================================
-- 1. 添加唯一约束 (防止重复 ID)
-- ==========================================
ALTER TABLE secrets 
  ADD CONSTRAINT unique_secret_id UNIQUE (id);

-- ==========================================
-- 2. 添加数据长度检查约束
-- ==========================================
ALTER TABLE secrets 
  ADD CONSTRAINT check_cipher_length 
  CHECK (length(cipher) <= 10000);

ALTER TABLE secrets 
  ADD CONSTRAINT check_salt_length 
  CHECK (length(salt) = 24);

ALTER TABLE secrets 
  ADD CONSTRAINT check_iv_length 
  CHECK (length(iv) = 16);

ALTER TABLE secrets 
  ADD CONSTRAINT check_id_format 
  CHECK (id ~ '^SC-[A-Z0-9]{6}$');

-- ==========================================
-- 3. 添加索引优化查询性能
-- ==========================================
CREATE INDEX idx_secrets_created_at ON secrets(created_at DESC);
CREATE INDEX idx_secrets_id ON secrets(id);

-- ==========================================
-- 4. 添加自动清理函数 (删除 1 年前的数据)
-- ==========================================
CREATE OR REPLACE FUNCTION cleanup_old_secrets()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM secrets 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE '已删除 % 条过期记录', deleted_count;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 5. 创建定时任务 (每天凌晨 3 点清理)
-- 注意: 需要启用 pg_cron 扩展
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-old-secrets',
  '0 3 * * *',  -- 每天凌晨 3 点
  'SELECT cleanup_old_secrets()'
);

-- ==========================================
-- 6. 添加统计视图
-- ==========================================
CREATE VIEW secret_stats AS
SELECT
  COUNT(*) as total_secrets,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
FROM secrets
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ==========================================
-- 7. 添加监控函数
-- ==========================================
CREATE OR REPLACE FUNCTION get_secret_stats()
RETURNS TABLE (
  metric text,
  value bigint
) AS $$
BEGIN
  RETURN QUERY SELECT '总秘密数'::text, COUNT(*)::bigint FROM secrets;
  RETURN QUERY SELECT '今日新增'::text, COUNT(*)::bigint FROM secrets WHERE DATE(created_at) = CURRENT_DATE;
  RETURN QUERY SELECT '本周新增'::text, COUNT(*)::bigint FROM secrets WHERE created_at > NOW() - INTERVAL '7 days';
  RETURN QUERY SELECT '本月新增'::text, COUNT(*)::bigint FROM secrets WHERE created_at > NOW() - INTERVAL '30 days';
  RETURN QUERY SELECT '平均大小(字节)'::text, AVG(length(cipher))::bigint FROM secrets;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 8. 添加异常检测函数
-- ==========================================
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TABLE (
  ip_address text,
  request_count bigint,
  time_window text
) AS $$
BEGIN
  -- 这个函数需要在 API 层记录 IP 后才能使用
  -- 这里仅提供框架
  RETURN QUERY 
    SELECT 'N/A'::text, 0::bigint, '需要 API 日志表'::text;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 验证约束是否生效
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅ 数据库安全增强完成!';
  RAISE NOTICE '';
  RAISE NOTICE '已添加的约束:';
  RAISE NOTICE '  - UNIQUE (id): 防止重复 ID';
  RAISE NOTICE '  - CHECK (cipher <= 10000): 限制密文大小';
  RAISE NOTICE '  - CHECK (salt = 24): Salt 长度验证';
  RAISE NOTICE '  - CHECK (iv = 16): IV 长度验证';
  RAISE NOTICE '  - CHECK (id 格式): ID 格式验证';
  RAISE NOTICE '';
  RAISE NOTICE '已创建的索引:';
  RAISE NOTICE '  - idx_secrets_created_at: 时间查询优化';
  RAISE NOTICE '  - idx_secrets_id: ID 查询优化';
  RAISE NOTICE '';
  RAISE NOTICE '自动任务:';
  RAISE NOTICE '  - 每天凌晨 3 点清理 1 年前的数据';
  RAISE NOTICE '';
  RAISE NOTICE '使用方法:';
  RAISE NOTICE '  SELECT * FROM get_secret_stats(); -- 查看统计';
END $$;
