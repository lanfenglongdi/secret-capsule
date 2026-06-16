-- 添加秘密保存期限字段和创建人字段
ALTER TABLE secrets 
ADD COLUMN IF NOT EXISTS retention_period VARCHAR(20) DEFAULT '1month',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- 为现有记录设置默认值
UPDATE secrets 
SET retention_period = '1month',
    expires_at = created_at + INTERVAL '1 month',
    created_by = COALESCE(created_by, 'admin')
WHERE expires_at IS NULL;

-- 创建索引以加速过期查询
CREATE INDEX IF NOT EXISTS idx_secrets_expires_at ON secrets(expires_at);

-- 创建自动删除过期秘密的函数
CREATE OR REPLACE FUNCTION delete_expired_secrets()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM secrets 
  WHERE expires_at <= NOW() AND expires_at IS NOT NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 注释说明
COMMENT ON COLUMN secrets.retention_period IS '保存期限: 1month, 1year, 3years, permanent';
COMMENT ON COLUMN secrets.expires_at IS '过期时间，permanent时为NULL';
COMMENT ON COLUMN secrets.created_by IS '创建人：会员邮箱、IP地址或admin';
