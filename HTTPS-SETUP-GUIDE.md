# Secret Capsule HTTPS 配置指南

## 当前状态

✅ **已完成:**
- 应用已部署到阿里云服务器 (39.96.28.3)
- PM2 进程管理已配置
- Nginx 反向代理已配置(HTTP)
- SSL 配置脚本已准备就绪

⏳ **待完成:**
- DNS 域名解析配置
- Let's Encrypt SSL 证书安装

---

## 步骤 1: 配置 DNS 域名解析

登录阿里云 DNS 控制台: https://dns.console.aliyun.com

为域名 `mtsc.site` 添加以下两条 A 记录:

### 记录 1 - 主域名
- **主机记录**: `@`
- **记录类型**: `A`
- **记录值**: `39.96.28.3`
- **TTL**: 默认(10分钟)

### 记录 2 - www 子域名
- **主机记录**: `www`
- **记录类型**: `A`
- **记录值**: `39.96.28.3`
- **TTL**: 默认(10分钟)

**等待 5-10 分钟**让 DNS 生效。

### 验证 DNS 是否生效

在本地命令行执行:
```bash
ping mtsc.site
ping www.mtsc.site
```

应该返回: `39.96.28.3`

---

## 步骤 2: 上传并执行 HTTPS 配置脚本

### 方法 1: 通过 SCP 上传脚本(推荐)

```bash
# 上传脚本到服务器
scp setup-https.sh root@39.96.28.3:/tmp/

# SSH 登录服务器
ssh root@39.96.28.3

# 执行脚本
chmod +x /tmp/setup-https.sh
/tmp/setup-https.sh
```

### 方法 2: 直接在服务器上执行命令

SSH 登录后依次执行:

```bash
# 1. 安装 Certbot
apt update
apt install -y certbot python3-certbot-nginx

# 2. 申请 SSL 证书(DNS 必须已配置)
certbot --nginx -d mtsc.site -d www.mtsc.site

# 按照提示:
# - 输入邮箱地址
# - 同意服务条款(A)
# - 选择是否接收 EFF 邮件(N)
# - 选择重定向选项(2 - Redirect)

# 3. 测试自动续期
certbot renew --dry-run
```

---

## 步骤 3: 验证 HTTPS 配置

### 检查证书状态
```bash
certbot certificates
```

应该显示:
```
Found the following certs:
  Certificate Name: mtsc.site
    Domains: mtsc.site www.mtsc.site
    Expiry Date: 2026-09-XX (有效期 90 天)
```

### 测试访问
- **HTTP**: http://mtsc.site (应自动跳转到 HTTPS)
- **HTTPS**: https://mtsc.site (应显示安全锁标志)

### 检查 Nginx 配置
```bash
nginx -t
systemctl status nginx
```

---

## 常见问题

### 1. Certbot 报错 "Could not connect to domain"
**原因**: DNS 未生效或防火墙阻止

**解决**:
```bash
# 检查 DNS
nslookup mtsc.site

# 检查防火墙
ufw allow 'Nginx Full'
ufw status
```

### 2. 证书申请失败
**手动重试**:
```bash
certbot --nginx -d mtsc.site -d www.mtsc.site --force-renewal
```

### 3. HTTP 不跳转到 HTTPS
**检查 Nginx 配置**:
```bash
cat /etc/nginx/sites-available/secret-capsule
# 应该包含: return 301 https://$host$request_uri;

# 重新加载 Nginx
systemctl reload nginx
```

### 4. 证书自动续期
Certbot 已自动配置 systemd timer,无需手动操作。

查看续期计划:
```bash
systemctl list-timers | grep certbot
```

手动续期测试:
```bash
certbot renew --dry-run
```

---

## 快速参考命令

```bash
# 查看证书信息
certbot certificates

# 手动续期证书
certbot renew

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 日志
tail -f /var/log/nginx/secret-capsule-access.log
tail -f /var/log/nginx/secret-capsule-error.log

# 查看应用日志
pm2 logs secret-capsule
```

---

## 下一步

HTTPS 配置完成后,您的网站将:
- ✅ 自动使用 HTTPS 加密连接
- ✅ HTTP 请求自动跳转到 HTTPS
- ✅ 浏览器显示安全锁标志
- ✅ 证书每 90 天自动续期

**立即开始**: 先配置 DNS,然后执行 `setup-https.sh` 脚本!
