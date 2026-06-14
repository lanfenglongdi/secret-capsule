# 🗄️ 数据库安全约束配置指南

## 📋 需要执行的 SQL 脚本

### 文件位置
[sql/enhance-security.sql](file://d:\secret-capsule\sql\enhance-security.sql)

---

## 🚀 执行步骤

### 1. 登录 Supabase Dashboard

访问: https://supabase.com/dashboard

选择项目: `fgushinpapaczugfztfg`

### 2. 打开 SQL Editor

左侧菜单 → **SQL Editor** → **New query**

### 3. 复制并执行脚本

1. 打开本地文件 `sql/enhance-security.sql`
2. 复制全部内容
3. 粘贴到 Supabase SQL Editor
4. 点击 **Run** 按钮执行

### 4. 验证执行结果

执行成功后,应该看到类似输出:

```
✅ 数据库安全增强完成!

已添加的约束:
  - UNIQUE (id): 防止重复 ID
  - CHECK (cipher <= 10000): 限制密文大小
  - CHECK (salt = 24): Salt 长度验证
  - CHECK (iv = 16): IV 长度验证
  - CHECK (id 格式): ID 格式验证

已创建的索引:
  - idx_secrets_created_at: 时间查询优化
  - idx_secrets_id: ID 查询优化

自动任务:
  - 每天凌晨 3 点清理 1 年前的数据
```

---

## ✅ 验证约束是否生效

### 测试 1: 重复 ID 检测

```sql
-- 尝试插入重复 ID (应该失败)
INSERT INTO secrets (id, cipher, salt, iv) 
VALUES ('SC-TEST01', 'test', 'testsalt123456789012345', 'testiv1234567890');

-- 再次插入相同 ID (应该报错)
INSERT INTO secrets (id, cipher, salt, iv) 
VALUES ('SC-TEST01', 'test', 'testsalt123456789012345', 'testiv1234567890');
-- 预期错误: duplicate key value violates unique constraint "unique_secret_id"
```

### 测试 2: 数据长度检查

```sql
-- 尝试插入超长密文 (应该失败)
INSERT INTO secrets (id, cipher, salt, iv) 
VALUES ('SC-TEST02', repeat('a', 10001), 'testsalt123456789012345', 'testiv1234567890');
-- 预期错误: new row for relation "secrets" violates check constraint "check_cipher_length"
```

### 测试 3: 查看统计数据

```sql
-- 查看实时统计
SELECT * FROM get_secret_stats();
```

预期输出:
```
metric        | value
--------------|------
总秘密数       | 1234
今日新增       | 56
本周新增       | 389
本月新增       | 1234
平均大小(字节) | 856
```

---

## 🔧 管理定时任务

### 查看定时任务状态

```sql
SELECT * FROM cron.job;
```

### 手动执行清理

```sql
SELECT cleanup_old_secrets();
```

### 禁用定时任务

```sql
SELECT cron.unschedule('cleanup-old-secrets');
```

### 重新启用定时任务

```sql
SELECT cron.schedule(
  'cleanup-old-secrets',
  '0 3 * * *',
  'SELECT cleanup_old_secrets()'
);
```

---

## 📊 常用监控查询

### 查看最近 24 小时增长

```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as new_secrets
FROM secrets
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### 查找异常大的记录

```sql
SELECT 
  id,
  length(cipher) as size_bytes,
  created_at
FROM secrets
WHERE length(cipher) > 5000
ORDER BY length(cipher) DESC
LIMIT 10;
```

### 查看数据库总大小

```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('secrets')) as total_size,
  pg_size_pretty(pg_relation_size('secrets')) as table_size,
  pg_size_pretty(pg_indexes_size('secrets')) as index_size;
```

---

## ⚠️ 注意事项

### 1. pg_cron 扩展

如果执行时提示 `pg_cron extension not found`:

**解决方案 A**: 在 Supabase Dashboard 启用
1. 左侧菜单 → **Database** → **Extensions**
2. 搜索 `pg_cron`
3. 点击 **Enable**

**解决方案 B**: 不使用定时清理
注释掉脚本中的这部分:
```sql
-- SELECT cron.schedule(...);
```

然后手动定期执行:
```sql
SELECT cleanup_old_secrets();
```

### 2. 备份数据

在执行任何 DDL 操作前,建议先备份:

```sql
-- 创建备份表
CREATE TABLE secrets_backup AS SELECT * FROM secrets;

-- 验证备份
SELECT COUNT(*) FROM secrets_backup;
```

### 3. 回滚操作

如果需要移除约束:

```sql
-- 删除约束
ALTER TABLE secrets DROP CONSTRAINT IF EXISTS unique_secret_id;
ALTER TABLE secrets DROP CONSTRAINT IF EXISTS check_cipher_length;
ALTER TABLE secrets DROP CONSTRAINT IF EXISTS check_salt_length;
ALTER TABLE secrets DROP CONSTRAINT IF EXISTS check_iv_length;
ALTER TABLE secrets DROP CONSTRAINT IF EXISTS check_id_format;

-- 删除索引
DROP INDEX IF EXISTS idx_secrets_created_at;
DROP INDEX IF EXISTS idx_secrets_id;

-- 删除函数
DROP FUNCTION IF EXISTS cleanup_old_secrets();
DROP FUNCTION IF EXISTS get_secret_stats();
```

---

## 🎯 完成后的效果

执行此脚本后,您的数据库将具备:

✅ **数据完整性保护**
- 唯一 ID 约束
- 字段长度验证
- 格式检查

✅ **性能优化**
- 时间索引加速查询
- ID 索引加速查找

✅ **自动化维护**
- 每日自动清理过期数据
- 防止数据库无限增长

✅ **监控能力**
- 实时统计查询
- 异常检测支持

---

## 📞 故障排查

### 问题 1: 约束冲突错误

**错误信息**: `violates check constraint "check_cipher_length"`

**原因**: 应用程序发送的数据超过限制

**解决**: 
- 检查前端代码,确保内容不超过 7.5KB
- 或调整约束: `ALTER TABLE secrets DROP CONSTRAINT check_cipher_length; ALTER TABLE secrets ADD CONSTRAINT check_cipher_length CHECK (length(cipher) <= 20000);`

### 问题 2: 定时任务不执行

**检查**:
```sql
-- 查看任务状态
SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-old-secrets');

-- 查看日志
SELECT * FROM cron.job_log ORDER BY start_time DESC LIMIT 10;
```

**解决**: 确保 pg_cron 扩展已启用

### 问题 3: 查询变慢

**分析**:
```sql
-- 查看查询计划
EXPLAIN ANALYZE SELECT * FROM secrets WHERE created_at > NOW() - INTERVAL '7 days';
```

**优化**: 确认索引已创建
```sql
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'secrets';
```

---

**执行完成后,您的数据库就具备了完整的安全防护!** 🛡️
