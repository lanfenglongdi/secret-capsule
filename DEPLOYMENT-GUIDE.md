# Secret Capsule 阿里云部署指南

##  前置条件

- ✅ 阿里云服务器已购买（IP: 39.96.28.3）
- ✅ 域名已购买：mtsc.site
- ✅ root 密码：MTkj@123

---

## 🚀 快速部署（推荐）

### 方法一：使用自动化脚本（最简单）

在您的本地电脑上执行：

```bash
# Windows PowerShell
ssh root@39.96.28.3 'bash -s' < deploy-to-aliyun.sh

# Mac/Linux
cat deploy-to-aliyun.sh | ssh root@39.96.28.3 'bash -s'
```

脚本会自动完成：
- ✅ 安装 Node.js 18 LTS
- ✅ 安装 Git、Nginx
- ✅ 克隆代码
- ✅ 安装依赖
- ✅ 配置环境变量
- ✅ 构建生产版本
- ✅ 使用 PM2 启动应用

### 方法二：手动部署

#### 1. SSH 连接服务器

```bash
ssh root@39.96.28.3
# 输入密码：MTkj@123
```

#### 2. 安装 Node.js 环境

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git nginx

# 验证安装
node -v   # 应该显示 v18.x.x
npm -v    # 应该显示 9.x.x 或更高
```

#### 3. 克隆代码并部署

```bash
# 创建应用目录
mkdir -p /opt/secret-capsule
cd /opt/secret-capsule

# 克隆代码
git clone https://github.com/lanfenglongdi/secret-capsule.git .

# 安装依赖
npm install

# 创建环境变量文件
cat > .env.local << EOF
SUPABASE_URL=https://fgushinpapaczugfztfg.supabase.co
SUPABASE_KEY=sb_publishable_c9tGHJ__pEpJoBoaTWJg6w_Jc1PPf7f
EOF

# 构建生产版本
npm run build

# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "secret-capsule" -- start

# 设置开机自启
pm2 startup systemd -u root --hp /root
pm2 save

# 查看状态
pm2 list
```

---

## 🔧 配置 Nginx 反向代理

### 1. 创建 Nginx 配置文件

```bash
nano /etc/nginx/sites-available/secret-capsule
```

粘贴以下内容（来自 nginx-config.conf 文件）：

```nginx
server {
    listen 80;
    server_name mtsc.site www.mtsc.site;

    access_log /var/log/nginx/secret-capsule-access.log;
    error_log /var/log/nginx/secret-capsule-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location ~ /\. {
        deny all;
    }
}
```

### 2. 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/secret-capsule /etc/nginx/sites-enabled/

# 删除默认配置（可选）
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 设置开机自启
systemctl enable nginx
```

---

## 🌐 配置域名解析

### 在阿里云 DNS 控制台添加记录

1. 登录 [阿里云 DNS 控制台](https://dns.console.aliyun.com)
2. 找到域名 `mtsc.site`
3. 添加以下解析记录：

| 记录类型 | 主机记录 | 解析线路 | 记录值 | TTL |
|---------|---------|---------|--------|-----|
| A | @ | 默认 | 39.96.28.3 | 10分钟 |
| A | www | 默认 | 39.96.28.3 | 10分钟 |

4. 保存后等待 5-10 分钟生效

---

## 🔒 配置 HTTPS（Let's Encrypt 免费证书）

### 1. 安装 Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 2. 获取 SSL 证书

```bash
certbot --nginx -d mtsc.site -d www.mtsc.site
```

按照提示操作：
- 输入邮箱地址
- 同意服务条款
- 选择是否重定向 HTTP 到 HTTPS（建议选择 2 - Redirect）

### 3. 自动续期

```bash
# 测试续期
certbot renew --dry-run

# 设置定时任务（Certbot 已自动配置）
crontab -l | grep certbot
```

---

## ✅ 验证部署

### 1. 检查应用状态

```bash
# 查看 PM2 进程
pm2 list

# 查看应用日志
pm2 logs secret-capsule

# 测试本地访问
curl http://localhost:3000
```

### 2. 检查 Nginx 状态

```bash
# 查看 Nginx 状态
systemctl status nginx

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 3. 浏览器访问

打开浏览器访问：
- http://mtsc.site
- https://mtsc.site（配置 HTTPS 后）

---

## 🛠️ 常用运维命令

```bash
# 重启应用
pm2 restart secret-capsule

# 停止应用
pm2 stop secret-capsule

# 查看实时日志
pm2 logs secret-capsule --lines 100

# 查看资源使用
pm2 monit

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 访问日志
tail -f /var/log/nginx/secret-capsule-access.log

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看端口占用
netstat -tulpn | grep :3000
```

---

##  防火墙配置

### 阿里云安全组规则

在阿里云控制台 → 云服务器 ECS → 安全组，添加入站规则：

| 协议类型 | 端口范围 | 授权对象 | 描述 |
|---------|---------|---------|------|
| HTTP | 80/80 | 0.0.0.0/0 | 允许 HTTP 访问 |
| HTTPS | 443/443 | 0.0.0.0/0 | 允许 HTTPS 访问 |
| SSH | 22/22 | 您的 IP/32 | 允许 SSH 连接（建议限制 IP） |

---

## 📊 性能优化建议

### 1. 启用 Gzip 压缩

编辑 `/etc/nginx/nginx.conf`，在 `http` 块中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
```

### 2. 调整 PM2 实例数（如果内存足够）

```bash
# 使用 cluster 模式，充分利用多核 CPU
pm2 delete secret-capsule
pm2 start npm --name "secret-capsule" -i max -- start
pm2 save
```

### 3. 监控和告警

- 使用阿里云云监控服务
- 设置 CPU、内存、磁盘使用率告警
- 配置邮件或短信通知

---

##  常见问题排查

### 问题 1：应用无法访问

**检查步骤**：
```bash
# 1. 检查应用是否运行
pm2 list

# 2. 检查端口是否监听
netstat -tulpn | grep :3000

# 3. 检查 Nginx 配置
nginx -t

# 4. 查看错误日志
tail -f /var/log/nginx/error.log
pm2 logs secret-capsule
```

### 问题 2：域名无法解析

**解决方法**：
- 等待 DNS  propagation（最多 24 小时）
- 使用 `ping mtsc.site` 检查是否解析到正确 IP
- 检查阿里云 DNS 解析记录是否正确

### 问题 3：HTTPS 证书申请失败

**解决方法**：
- 确保域名已正确解析到服务器 IP
- 确保 80 端口开放且可访问
- 检查防火墙和安全组规则

---

## 🎉 部署完成！

恭喜！您的 Secret Capsule 应用已成功部署到阿里云服务器。

**访问地址**：
- HTTP: http://mtsc.site
- HTTPS: https://mtsc.site

**管理面板**：
- PM2 监控: `pm2 monit`
- 应用日志: `pm2 logs secret-capsule`
- Nginx 日志: `/var/log/nginx/`

如有任何问题，请随时联系我！
