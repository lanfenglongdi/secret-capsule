#!/bin/bash
set -e

echo "========================================"
echo "Secret Capsule HTTPS 证书配置脚本"
echo "========================================"

# 1. 安装 Certbot 和 Nginx 插件
echo ""
echo "[1/4] 安装 Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# 2. 验证 Nginx 配置
echo ""
echo "[2/4] 验证 Nginx 配置..."
nginx -t

# 3. 获取 SSL 证书(需要先配置 DNS)
echo ""
echo "[3/4] 准备 SSL 证书申请..."
echo "注意: 请确保已在阿里云 DNS 控制台添加以下 A 记录:"
echo "  - @ → 39.96.28.3"
echo "  - www → 39.96.28.3"
echo ""
read -p "DNS 是否已配置完成? (y/n): " dns_ready

if [ "$dns_ready" = "y" ] || [ "$dns_ready" = "Y" ]; then
    echo "正在申请 Let's Encrypt SSL 证书..."
    certbot --nginx -d mtsc.site -d www.mtsc.site --non-interactive --agree-tos --redirect --email admin@mtsc.site
    
    echo ""
    echo "✅ SSL 证书安装成功!"
    echo "证书自动续期已配置"
else
    echo ""
    echo "⚠️  跳过 SSL 证书申请"
    echo "请先配置 DNS,然后运行以下命令:"
    echo "  certbot --nginx -d mtsc.site -d www.mtsc.site"
fi

# 4. 测试证书自动续期
echo ""
echo "[4/4] 测试证书自动续期..."
certbot renew --dry-run

echo ""
echo "========================================"
echo "HTTPS 配置完成!"
echo "========================================"
echo ""
echo "访问地址:"
echo "  HTTP:  http://mtsc.site (将自动跳转到 HTTPS)"
echo "  HTTPS: https://mtsc.site"
echo ""
echo "查看证书状态: certbot certificates"
echo "手动续期证书: certbot renew"
echo ""
