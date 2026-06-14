# 🎉 Secret Capsule 阿里云部署成功！

## ✅ 部署完成状态

### 服务器信息
- **服务器 IP**: 39.96.28.3
- **操作系统**: Ubuntu 26.04 64位
- **配置**: 2核 2GB
- **地域**: 华北2（北京）

### 已完成的部署步骤

1. ✅ **安装 Node.js 环境**
   - Node.js v22.22.1
   - npm 9.2.0
   - Git 2.53.0
   - Nginx（已安装并配置）

2. ✅ **部署应用代码**
   - 代码位置: `/opt/secret-capsule`
   - 环境变量已配置（Supabase）
   - 生产版本构建成功

3. ✅ **启动应用服务**
   - 使用 PM2 进程管理器
   - 应用名称: `secret-capsule`
   - 运行端口: localhost:3000
   - 开机自启: 已配置

4. ✅ **配置 Nginx 反向代理**
   - 监听端口: 80
   - 域名: mtsc.site, www.mtsc.site
   - 静态资源缓存: 已启用
   - Gzip 压缩: 待配置（可选）

---

## 🌐 下一步：配置域名解析

### 在阿里云 DNS 控制台添加解析记录

1. 登录 [阿里云 DNS 控制台](https://dns.console.aliyun.com)
2. 找到域名 `mtsc.site`
3. 添加以下 A 记录：

| 记录类型 | 主机记录 | 解析线路 | 记录值 | TTL |
|---------|---------|---------|--------|-----|
| A | @ | 默认 | 39.96.28.3 | 10分钟 |
| A | www | 默认 | 39.96.28.3 | 10分钟 |

4. 保存后等待 5-10 分钟生效

### 验证域名解析

```bash
# 在本地电脑执行
ping mtsc.site
# 应该返回: 39.96.28.3

# 测试 HTTP 访问
curl http://mtsc.site
```

---

## 🔒 配置 HTTPS（推荐）

### 安装 Certbot 并获取 SSL 证书

SSH 连接服务器后执行：

```bash
ssh root@39.96.28.3

# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取 Let's Encrypt 免费证书
certbot --nginx -d mtsc.site -d www.mtsc.site

# 按照提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款
# 3. 选择是否重定向 HTTP 到 HTTPS（建议选择 2 - Redirect）
```

### 自动续期

Certbot 会自动配置定时任务，无需手动操作。可以测试续期：

```bash
certbot renew --dry-run
```

---

## 📊 应用状态监控

### 查看应用状态

```bash
ssh root@39.96.28.3

# 查看 PM2 进程列表
pm2 list

# 查看实时日志
pm2 logs secret-capsule

# 查看资源使用
pm2 monit

# 重启应用
pm2 restart secret-capsule

# 停止应用
pm2 stop secret-capsule
```

### 查看 Nginx 状态

```bash
# 查看 Nginx 状态
systemctl status nginx

# 查看访问日志
tail -f /var/log/nginx/secret-capsule-access.log

# 查看错误日志
tail -f /var/log/nginx/secret-capsule-error.log

# 重启 Nginx
systemctl restart nginx
```

---

## 🛠️ 常用运维命令

```bash
# SSH 连接服务器
ssh root@39.96.28.3
# 密码: MTkj@123

# 查看系统资源使用
htop

# 查看磁盘使用
df -h

# 查看端口占用
netstat -tulpn | grep :3000

# 更新应用代码
cd /opt/secret-capsule
git pull origin main
npm install
npm run build
pm2 restart secret-capsule

# 备份数据库（如果使用本地数据库）
# 注意：当前使用 Supabase，数据在云端
```

---

## 🔥 防火墙配置

### 阿里云安全组规则

在阿里云控制台 → 云服务器 ECS → 安全组，确保添加入站规则：

| 协议类型 | 端口范围 | 授权对象 | 描述 |
|---------|---------|---------|------|
| HTTP | 80/80 | 0.0.0.0/0 | 允许 HTTP 访问 |
| HTTPS | 443/443 | 0.0.0.0/0 | 允许 HTTPS 访问（配置证书后） |
| SSH | 22/22 | 您的 IP/32 | 允许 SSH 连接（建议限制 IP） |

---

## 🎯 访问地址

配置域名解析后，可以通过以下地址访问：

- **HTTP**: http://mtsc.site
- **HTTPS**: https://mtsc.site（配置证书后）
- **直接 IP**: http://39.96.28.3

---

## 📝 环境变量

当前配置的环境变量（位于 `/opt/secret-capsule/.env.local`）：

```
SUPABASE_URL=https://fgushinpapaczugfztfg.supabase.co
SUPABASE_KEY=sb_publishable_c9tGHJ__pEpJoBoaTWJg6w_Jc1PPf7f
```

如需修改，编辑文件后重启应用：

```bash
nano /opt/secret-capsule/.env.local
pm2 restart secret-capsule
```

---

## 🚨 故障排查

### 问题 1：应用无法访问

**检查步骤**：
```bash
# 1. 检查应用是否运行
pm2 list

# 2. 检查端口是否监听
netstat -tulpn | grep :3000

# 3. 查看应用日志
pm2 logs secret-capsule

# 4. 检查 Nginx 配置
nginx -t

# 5. 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 问题 2：域名无法解析

**解决方法**：
- 等待 DNS propagation（最多 24 小时）
- 使用 `ping mtsc.site` 检查是否解析到 39.96.28.3
- 检查阿里云 DNS 解析记录是否正确

### 问题 3：HTTPS 证书申请失败

**解决方法**：
- 确保域名已正确解析到服务器 IP
- 确保 80 端口开放且可访问
- 检查防火墙和安全组规则

---

## 🎊 恭喜！

您的 Secret Capsule 应用已成功部署到阿里云服务器！

**当前状态**：
- ✅ 应用运行正常
- ✅ Nginx 反向代理已配置
- ⏳ 等待域名解析生效
- ⏳ 可选：配置 HTTPS

**预计完成时间**：
- 域名解析：5-10 分钟
- HTTPS 配置：5 分钟（域名解析生效后）

如有任何问题，请随时联系我！
