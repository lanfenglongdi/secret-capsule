# Secret Capsule 备份系统指南

## 架构概述

本项目采用双数据库架构：

- **主数据库**：Supabase 云端数据库（网站正常运行使用）
- **备份数据库**：阿里云自建 PostgreSQL（仅作为备份）

## 备份配置

### 数据库信息

**备份数据库（阿里云 PostgreSQL）**
- 主机：localhost (39.96.28.3)
- 端口：5432
- 数据库名：`secret_capsule_backup`
- 用户名：`postgres`
- 密码：`SecretCapsule2026Backup`

**主数据库（Supabase）**
- URL：`https://fgushinpapaczugfztfg.supabase.co`
- Service Role Key：配置在 `.env.local` 中

### 自动备份

- **频率**：每天凌晨 2:00 自动执行
- **脚本位置**：`/opt/secret-capsule/scripts/backup-supabase-to-local.sh`
- **日志位置**：`/opt/secret-capsule/logs/backup_*.log`
- **备份文件**：`/opt/secret-capsule/backups/supabase_export_*.json`
- **保留策略**：备份文件保留 7 天，日志保留 30 天

## 常用命令

### 查看备份状态

```bash
ssh root@39.96.28.3 '/opt/secret-capsule/scripts/check-backup-status.sh'
```

### 手动执行备份

```bash
ssh root@39.96.28.3 '/opt/secret-capsule/scripts/backup-supabase-to-local.sh'
```

### 查看备份数据

```bash
ssh root@39.96.28.3 'PGPASSWORD="SecretCapsule2026Backup" psql -h localhost -U postgres -d secret_capsule_backup -c "SELECT COUNT(*) FROM secrets;"'
```

### 查看备份日志

```bash
ssh root@39.96.28.3 'ls -lt /opt/secret-capsule/logs/backup_*.log | head -5'
ssh root@39.96.28.3 'tail -50 /opt/secret-capsule/logs/backup_YYYYMMDD_HHMMSS.log'
```

### 查看定时任务

```bash
ssh root@39.96.28.3 'crontab -l'
```

## 备份流程

1. **导出数据**：从 Supabase API 导出所有秘密数据（JSON 格式）
2. **清空备份库**：清空本地 PostgreSQL 的 secrets 表
3. **导入数据**：将导出的数据导入到本地 PostgreSQL
4. **验证备份**：对比 Supabase 和本地数据库的记录数
5. **清理旧文件**：删除超过 7 天的备份文件和超过 30 天的日志

## 故障排查

### PostgreSQL 未运行

```bash
ssh root@39.96.28.3 'systemctl start postgresql'
ssh root@39.96.28.3 'systemctl enable postgresql'
```

### 备份失败

1. 检查日志文件查看详细错误信息
2. 确认 Supabase API 可访问
3. 确认本地 PostgreSQL 服务正常运行
4. 检查数据库连接配置

### 手动恢复数据

如果需要从备份恢复数据到 Supabase，可以：
1. 从 `/opt/secret-capsule/backups/` 找到最新的备份文件
2. 使用 Supabase Dashboard 或 API 手动导入数据

## 安全注意事项

- 备份数据库密码存储在脚本中，请确保服务器访问权限安全
- 定期监控备份状态，确保备份正常执行
- 建议定期将备份文件下载到本地或其他云存储作为额外保障
