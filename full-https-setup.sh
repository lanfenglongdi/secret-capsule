#!/bin/bash
# Secret Capsule - 完整 HTTPS 配置脚本
# 此脚本需要在服务器上执行
# 使用方法: ssh root@39.96.28.3 'bash -s' < full-https-setup.sh

set -e

echo "=========================================="
echo "  Secret Capsule HTTPS 配置"
echo "=========================================="
echo ""

# 1. 安装 Certbot
echo "[1/5] 安装 Certbot 和 Nginx 插件..."
apt update -qq
apt install -y -qq certbot python3-certbot-nginx > /dev/null 2>&1
echo "✅ Certbot 安装完成"
certbot --version
echo ""

# 2. 验证当前 Nginx 配置
echo "[2/5] 验证 Nginx 配置..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx 配置正常"
else
    echo "❌ Nginx 配置错误"
    nginx -t
    exit 1
fi
echo ""

# 3. 创建 SSL 参数配置文件
echo "[3/5] 创建 SSL 优化配置..."
cat > /etc/nginx/snippets/ssl-params.conf << 'EOF'
# SSL 安全配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# DH 参数(如果不存在)
# ssl_dhparam /etc/ssl/certs/dhparam.pem;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# 安全头
add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
EOF
echo "✅ SSL 参数配置完成 (/etc/nginx/snippets/ssl-params.conf)"
echo ""

# 4. 准备证书申请脚本
echo "[4/5] 创建证书申请脚本..."
cat > /opt/setup-ssl.sh << 'SCRIPT'
#!/bin/bash
set -e

DOMAIN="mtsc.site"
WWW_DOMAIN="www.mtsc.site"

echo ""
echo "=========================================="
echo "  Let's Encrypt SSL 证书申请"
echo "=========================================="
echo ""

# 检查 DNS 是否配置
echo "正在检查 DNS 配置..."
if ping -c 1 -W 2 $DOMAIN > /dev/null 2>&1; then
    echo "✅ $DOMAIN DNS 解析正常"
else
    echo "⚠️  $DOMAIN DNS 解析失败"
    echo "请先在阿里云 DNS 控制台添加 A 记录:"
    echo "  @ → 39.96.28.3"
    echo "  www → 39.96.28.3"
    echo ""
    read -p "是否继续尝试申请证书? (y/n): " continue_setup
    if [ "$continue_setup" != "y" ] && [ "$continue_setup" != "Y" ]; then
        echo "已取消证书申请"
        exit 0
    fi
fi

if ping -c 1 -W 2 $WWW_DOMAIN > /dev/null 2>&1; then
    echo "✅ $WWW_DOMAIN DNS 解析正常"
else
    echo "⚠️  $WWW_DOMAIN DNS 解析失败"
fi

echo ""
echo "开始申请 SSL 证书..."
echo ""

# 申请证书
certbot --nginx \
    -d $DOMAIN \
    -d $WWW_DOMAIN \
    --non-interactive \
    --agree-tos \
    --redirect \
    --hsts \
    --staple-ocsp \
    --email admin@$DOMAIN

echo ""
echo "=========================================="
echo "  ✅ SSL 证书安装成功!"
echo "=========================================="
echo ""
echo "证书信息:"
certbot certificates
echo ""
echo "测试自动续期..."
certbot renew --dry-run
echo ""
echo "重载 Nginx..."
systemctl reload nginx
echo ""
echo "访问地址:"
echo "  HTTP:  http://$DOMAIN (自动跳转到 HTTPS)"
echo "  HTTPS: https://$DOMAIN"
echo ""
SCRIPT

chmod +x /opt/setup-ssl.sh
echo "✅ 证书申请脚本已创建 (/opt/setup-ssl.sh)"
echo ""

# 5. 创建定时任务检查
echo "[5/5] 配置证书自动续期..."
# Certbot 会自动创建 systemd timer,这里我们验证一下
if systemctl list-timers | grep -q certbot; then
    echo "✅ Certbot 自动续期定时器已配置"
    systemctl list-timers | grep certbot
else
    echo "⚠️  未检测到自动续期定时器,创建 cron 任务..."
    # 添加到 crontab
    (crontab -l 2>/dev/null; echo "0 0,12 * * * /usr/bin/certbot renew --quiet") | crontab -
    echo "✅ 已创建 cron 定时任务 (每天 0:00 和 12:00 检查续期)"
fi
echo ""

# 总结
echo "=========================================="
echo "  HTTPS 准备完成!"
echo "=========================================="
echo ""
echo "已完成:"
echo "  ✅ Certbot 已安装"
echo "  ✅ SSL 参数配置已创建"
echo "  ✅ 证书申请脚本已就绪"
echo "  ✅ 自动续期已配置"
echo ""
echo "下一步操作:"
echo ""
echo "1. 在阿里云 DNS 控制台添加 A 记录:"
echo "   - @ → 39.96.28.3"
echo "   - www → 39.96.28.3"
echo ""
echo "2. 等待 5-10 分钟 DNS 生效"
echo ""
echo "3. 执行证书申请脚本:"
echo "   /opt/setup-ssl.sh"
echo ""
echo "或者手动申请:"
echo "   certbot --nginx -d mtsc.site -d www.mtsc.site"
echo ""
