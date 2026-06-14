# 🚀 Secret Capsule HTTPS 快速配置指南

## ⚡ 一键执行(推荐)

### Windows 用户

**方法 1: 双击运行批处理文件**
```
双击: setup-https.bat
```

**方法 2: PowerShell 执行**
```powershell
.\setup-https.ps1
```

### Mac/Linux 用户

```bash
# 上传并执行
scp full-https-setup.sh root@39.96.28.3:/tmp/
ssh root@39.96.28.3 "chmod +x /tmp/full-https-setup.sh && bash /tmp/full-https-setup.sh"
```

---

## 📋 手动执行步骤

如果自动脚本失败,可以手动执行:

### 1. 上传脚本
```bash
scp full-https-setup.sh root@39.96.28.3:/tmp/
```

### 2. SSH 登录服务器
```bash
ssh root@39.96.28.3
# 密码: MTkj@123
```

### 3. 执行配置脚本
```bash
chmod +x /tmp/full-https-setup.sh
bash /tmp/full-https-setup.sh
```

这将自动完成:
- ✅ 安装 Certbot
- ✅ 创建 SSL 参数配置
- ✅ 准备证书申请脚本
- ✅ 配置自动续期

### 4. 配置 DNS(在阿里云控制台)

访问: https://dns.console.aliyun.com

添加两条 A 记录:
- **主机记录**: `@` → **记录值**: `39.96.28.3`
- **主机记录**: `www` → **记录值**: `39.96.28.3`

等待 5-10 分钟。

### 5. 申请 SSL 证书

DNS 生效后,在服务器上执行:
```bash
/opt/setup-ssl.sh
```

或手动执行:
```bash
certbot --nginx -d mtsc.site -d www.mtsc.site
```

按照提示:
1. 输入邮箱地址
2. 输入 `A` 同意服务条款
3. 输入 `N` 拒绝营销邮件
4. 输入 `2` 选择 HTTP→HTTPS 重定向

---

## ✅ 验证配置

### 检查证书状态
```bash
certbot certificates
```

### 测试访问
- http://mtsc.site (应自动跳转到 HTTPS)
- https://mtsc.site (应显示安全锁)

### 检查 Nginx
```bash
nginx -t
systemctl status nginx
```

---

## 🔧 故障排查

### 问题 1: SSH 连接被拒绝
```bash
# 检查服务器是否运行
ping 39.96.28.3

# 检查 SSH 服务
ssh -v root@39.96.28.3
```

### 问题 2: 证书申请失败 "Could not connect"
```bash
# 检查 DNS 是否生效
ping mtsc.site
nslookup mtsc.site

# 检查防火墙
ufw allow 'Nginx Full'
ufw status
```

### 问题 3: Nginx 配置错误
```bash
# 查看错误详情
nginx -t

# 查看日志
tail -f /var/log/nginx/error.log
```

### 问题 4: 证书续期失败
```bash
# 手动测试续期
certbot renew --dry-run

# 强制续期
certbot renew --force-renewal
```

---

## 📞 获取帮助

查看详细文档:
- [HTTPS-SETUP-GUIDE.md](HTTPS-SETUP-GUIDE.md) - 完整配置指南
- [DEPLOYMENT-COMPLETE.md](DEPLOYMENT-COMPLETE.md) - 部署总结

查看日志:
```bash
# Nginx 日志
tail -f /var/log/nginx/secret-capsule-access.log
tail -f /var/log/nginx/secret-capsule-error.log

# 应用日志
pm2 logs secret-capsule
```

---

**最后更新**: 2026-06-13
