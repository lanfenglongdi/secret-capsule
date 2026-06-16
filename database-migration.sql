-- 秘密胶囊数据库迁移脚本
-- 添加保存期限和过期时间字段

-- 1. 添加 retention_period 字段（保存期限）
ALTER TABLE secrets 
ADD COLUMN IF NOT EXISTS retention_period TEXT DEFAULT '1month';

-- 2. 添加 expires_at 字段（过期时间）
ALTER TABLE secrets 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 3. 添加 created_by 字段（创建人信息）
ALTER TABLE secrets 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- 4. 为现有记录设置默认过期时间（创建时间 + 30天）
UPDATE secrets 
SET expires_at = created_at::timestamp + INTERVAL '30 days'
WHERE expires_at IS NULL AND created_at IS NOT NULL;

-- 5. 为现有记录设置默认保存期限
UPDATE secrets 
SET retention_period = '1month'
WHERE retention_period IS NULL OR retention_period = '';

-- 6. 添加索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_secrets_expires_at ON secrets(expires_at);
CREATE INDEX IF NOT EXISTS idx_secrets_created_by ON secrets(created_by);

-- 7. 添加注释
COMMENT ON COLUMN secrets.retention_period IS '保存期限: 1month, 1year, 3years, permanent';
COMMENT ON COLUMN secrets.expires_at IS '过期时间，过期后自动删除';
COMMENT ON COLUMN secrets.created_by IS '创建人信息: IP地址或邮箱';
