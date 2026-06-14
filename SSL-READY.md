# ✅ SSL 环境准备完成

## 🎉 服务器端配置状态

**更新时间**: 2026-06-13 23:25 CST
**服务器**: 39.96.28.3 (阿里云)

---

## ✅ 已完成的工作

### 1. Certbot 安装
- **状态**: ✅ 已安装
- **版本**: certbot 4.0.0
- **位置**: /usr/bin/certbot

### 2. SSL 参数配置
- **状态**: ✅ 已创建
- **文件**: `/etc/nginx/snippets/ssl-params.conf`
- **包含配置**:
  - TLS 1.2/1.3 协议
  - 强加密套件 (ECDHE)
  - OCSP Stapling
  - HSTS 安全头
  - X-Content-Type-Options
  - X-Frame-Options

### 3. 证书申请脚本
- **状态**: ✅ 已就绪
- **文件**: `/opt/setup-ssl.sh`
- **功能**:
  - DNS 预检查
  - 自动申请 Let's Encrypt 证书
  - 配置 HTTP→HTTPS 重定向
  - 启用 HSTS 和 OCSP
  - 自动重载 Nginx

### 4. 自动续期配置
- **状态**: ✅ 已激活
- **方式**: systemd timer (certbot.timer)
- **下次检查**: 2026-06-14 09:50:21 CST
- **服务**: certbot.service

### 5. 应用运行状态
- **PM2 进程**: ✅ online (secret-capsule)
- **PID**: 9988
- **运行时间**: 14分钟
- **内存使用**: 88.6MB

### 6. Nginx 状态
- **配置测试**: ✅ successful
- **监听端口**: 80 (HTTP)
- **反向代理**: localhost:3000
- **域名配置**: mtsc.site, www.mtsc.site

---

## ⏳ 下一步操作

### 步骤 1: 配置 DNS 域名解析

**登录阿里云 DNS 控制台**: https://dns.console.aliyun.com

为域名 `mtsc.site` 添加两条 A 记录:

#### 记录 1 - 主域名
- **主机记录**: `@`
- **记录类型**: `A`
- **记录值**: `39.96.28.3`
- **TTL**: 默认(10分钟)

#### 记录 2 - www 子域名
- **主机记录**: `www`
- **记录类型**: `A`
- **记录值**: `39.96.28.3`
- **TTL**: 默认(10分钟)

**等待时间**: 5-10 分钟让 DNS 生效

### 步骤 2: 验证 DNS 是否生效

在本地命令行执行:
```bash
ping mtsc.site
ping www.mtsc.site
```

应该返回: `39.96.28.3`

或使用 nslookup:
```bash
nslookup mtsc.site
nslookup www.mtsc.site
```

### 步骤 3: 申请 SSL 证书

DNS 生效后,SSH 登录服务器执行:

```bash
ssh root@39.96.28.3
# 密码: MTkj@123

# 执行证书申请脚本
/opt/setup-ssl.sh
```

或者手动执行:
```bash
certbot --nginx -d mtsc.site -d www.mtsc.site
```

**按照提示操作**:
1. 输入邮箱地址 (用于证书过期提醒)
2. 输入 `A` 同意 Let's Encrypt 服务条款
3. 输入 `N` 拒绝接收 EFF 营销邮件 (可选)
4. 输入 `2` 选择 "Redirect - Make all requests redirect to secure HTTPS access"

### 步骤 4: 验证 HTTPS

证书安装成功后,访问:
- **http://mtsc.site** → 应自动跳转到 https://mtsc.site
- **https://mtsc.site** → 应显示绿色安全锁标志

检查证书信息:
```bash
certbot certificates
```

应该显示:
```
Found the following certs:
  Certificate Name: mtsc.site
    Domains: mtsc.site www.mtsc.site
    Expiry Date: 2026-09-XX (有效期 90 天)
    Certificate Path: /etc/letsencrypt/live/mtsc.site/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/mtsc.site/privkey.pem
```

---

## 🔧 常用命令参考

### 查看证书状态
```bash
certbot certificates
```

### 手动续期证书
```bash
certbot renew
```

### 测试自动续期
```bash
certbot renew --dry-run
```

### 重启 Nginx
```bash
systemctl restart nginx
```

### 查看 Nginx 日志
```bash
tail -f /var/log/nginx/secret-capsule-access.log
tail -f /var/log/nginx/secret-capsule-error.log
```

### 查看应用日志
```bash
pm2 logs secret-capsule
```

---

## 📊 当前可访问地址

### HTTP (当前可用)
- **通过 IP**: http://39.96.28.3 ✅
- **通过域名**: http://mtsc.site (DNS 配置后)

### HTTPS (待配置)
- **通过域名**: https://mtsc.site (SSL 证书安装后)

---

## ⚠️ 重要提示

1. **DNS 必须先生效**,否则证书申请会失败
2. **证书有效期 90 天**,但已配置自动续期,无需手动操作
3. **防火墙确保开放**: 端口 80 (HTTP) 和 443 (HTTPS)
4. **备份私钥**: `/etc/letsencrypt/live/mtsc.site/privkey.pem`

---

## 🎯 快速执行清单

- [ ] 在阿里云 DNS 控制台添加 A 记录 (@ 和 www)
- [ ] 等待 5-10 分钟 DNS 生效
- [ ] 执行 `ping mtsc.site` 验证 DNS
- [ ] SSH 登录服务器: `ssh root@39.96.28.3`
- [ ] 执行证书申请: `/opt/setup-ssl.sh`
- [ ] 访问 https://mtsc.site 验证 HTTPS
- [ ] 检查浏览器安全锁标志

---

**状态**: 🟢 SSL 环境已就绪,等待 DNS 配置后即可申请证书

**预计完成时间**: DNS 配置后 5-10 分钟内可完成 HTTPS 部署
