# Secret Capsule 部署完成总结

## 📋 部署概览

**项目名称**: Secret Capsule (秘密胶囊)
**部署时间**: 2026-06-13
**部署平台**: 阿里云 ECS
**域名**: mtsc.site

---

## ✅ 已完成的部署步骤

### 1. 服务器环境配置
- **操作系统**: Ubuntu 26.04
- **服务器 IP**: 39.96.28.3
- **配置**: 2核 CPU / 2GB 内存

### 2. 软件安装
- ✅ Node.js v22.22.1
- ✅ npm 9.2.0
- ✅ Git
- ✅ Nginx
- ✅ PM2 (进程管理器)

### 3. 应用部署
- ✅ 代码上传至 `/opt/secret-capsule`
- ✅ 环境变量配置 (.env.local)
- ✅ 生产版本构建成功
- ✅ PM2 进程启动并配置开机自启

### 4. Nginx 配置
- ✅ 反向代理配置完成 (端口 80 → localhost:3000)
- ✅ 静态资源缓存策略配置
- ✅ 安全配置(隐藏文件访问限制)
- ✅ Nginx 服务正常运行

### 5. HTTPS 准备
- ✅ Certbot 安装脚本准备就绪 (`setup-https.sh`)
- ✅ Nginx SSL 配置模板准备完成
- ✅ 详细配置指南编写完成 (`HTTPS-SETUP-GUIDE.md`)

---

## ⏳ 待完成步骤

### DNS 域名解析配置

**操作位置**: 阿里云 DNS 控制台
**控制台地址**: https://dns.console.aliyun.com

需要添加两条 A 记录:

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @ | A | 39.96.28.3 | 默认 |
| www | A | 39.96.28.3 | 默认 |

**预计生效时间**: 5-10 分钟

### HTTPS 证书安装

DNS 生效后,执行以下步骤:

```bash
# 方法 1: 使用自动化脚本(推荐)
scp setup-https.sh root@39.96.28.3:/tmp/
ssh root@39.96.28.3
chmod +x /tmp/setup-https.sh
/tmp/setup-https.sh

# 方法 2: 手动执行命令
ssh root@39.96.28.3
apt update
apt install -y certbot python3-certbot-nginx
certbot --nginx -d mtsc.site -d www.mtsc.site
```

---

## 🌐 当前可访问地址

### HTTP 访问
- **通过 IP**: http://39.96.28.3
- **通过域名**: http://mtsc.site (DNS 配置后)
- **www 子域名**: http://www.mtsc.site (DNS 配置后)

### HTTPS 访问
- **通过域名**: https://mtsc.site (SSL 证书安装后)
- **www 子域名**: https://www.mtsc.site (SSL 证书安装后)

---

## 📊 应用状态监控

### 查看应用运行状态
```bash
ssh root@39.96.28.3
pm2 status
pm2 logs secret-capsule
```

### 查看 Nginx 状态
```bash
systemctl status nginx
tail -f /var/log/nginx/secret-capsule-access.log
tail -f /var/log/nginx/secret-capsule-error.log
```

### 重启应用
```bash
pm2 restart secret-capsule
systemctl restart nginx
```

---

## 🔧 常用管理命令

### PM2 进程管理
```bash
pm2 status                    # 查看状态
pm2 logs secret-capsule       # 查看日志
pm2 restart secret-capsule    # 重启应用
pm2 stop secret-capsule       # 停止应用
pm2 monit                     # 实时监控
```

### Nginx 管理
```bash
nginx -t                      # 测试配置
systemctl restart nginx       # 重启 Nginx
systemctl reload nginx        # 重载配置
systemctl status nginx        # 查看状态
```

### SSL 证书管理
```bash
certbot certificates          # 查看证书
certbot renew                 # 续期证书
certbot renew --dry-run       # 测试续期
```

---

## 📁 重要文件位置

### 服务器端
- **应用目录**: `/opt/secret-capsule`
- **环境变量**: `/opt/secret-capsule/.env.local`
- **Nginx 配置**: `/etc/nginx/sites-available/secret-capsule`
- **Nginx 启用配置**: `/etc/nginx/sites-enabled/secret-capsule`
- **PM2 配置**: `~/.pm2/pm2.json`
- **访问日志**: `/var/log/nginx/secret-capsule-access.log`
- **错误日志**: `/var/log/nginx/secret-capsule-error.log`

### 本地项目
- **HTTPS 配置脚本**: `setup-https.sh`
- **HTTPS 配置指南**: `HTTPS-SETUP-GUIDE.md`
- **一键部署脚本**: `deploy-https.sh`
- **Nginx SSL 配置模板**: `nginx-ssl-config.conf`
- **部署总结**: `DEPLOYMENT-COMPLETE.md`

---

## 🔒 安全信息

### Supabase 配置
- **URL**: https://fgushinpapaczugfztfg.supabase.co
- **Key**: sb_publishable_c9tGHJ__pEpJoBoaTWJg6w_Jc1PPf7f (公开密钥,安全)

### 服务器访问
- **SSH 用户**: root
- **SSH 密码**: MTkj@123 (请妥善保管)
- **服务器 IP**: 39.96.28.3

### 加密方式
- **算法**: AES-256-GCM (端到端加密)
- **密钥派生**: PBKDF2
- **服务器不存储明文**: 所有数据在客户端加密

---

## 🚀 下一步行动清单

1. **[立即]** 登录阿里云 DNS 控制台配置 A 记录
2. **[等待 5-10 分钟]** DNS 生效
3. **[验证]** 执行 `ping mtsc.site` 确认解析到 39.96.28.3
4. **[执行]** 运行 `setup-https.sh` 安装 SSL 证书
5. **[测试]** 访问 https://mtsc.site 验证 HTTPS
6. **[完成]** 享受安全的加密通信服务!

---

## 📞 技术支持

如遇问题,请参考:
- **详细配置指南**: `HTTPS-SETUP-GUIDE.md`
- **Nginx 配置参考**: `nginx-ssl-config.conf`
- **故障排查**: 查看 Nginx 和 PM2 日志

---

**部署状态**: 🟢 应用运行正常,等待 DNS 配置和 HTTPS 安装

**最后更新**: 2026-06-13
