#!/bin/bash
# Secret Capsule 一键 HTTPS 部署脚本
# 使用方法: bash deploy-https.sh

set -e

SERVER_IP="39.96.28.3"
DOMAIN="mtsc.site"
WWW_DOMAIN="www.mtsc.site"

echo "=========================================="
echo "  Secret Capsule HTTPS 一键部署"
echo "=========================================="
echo ""
echo "服务器: $SERVER_IP"
echo "域名: $DOMAIN, $WWW_DOMAIN"
echo ""

# 检查 sshpass 是否安装
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  未检测到 sshpass,将使用交互式 SSH 连接"
    echo ""
    echo "请手动执行以下命令:"
    echo ""
    echo "1. 上传脚本到服务器:"
    echo "   scp setup-https.sh root@$SERVER_IP:/tmp/"
    echo ""
    echo "2. SSH 登录服务器:"
    echo "   ssh root@$SERVER_IP"
    echo ""
    echo "3. 执行 HTTPS 配置脚本:"
    echo "   chmod +x /tmp/setup-https.sh"
    echo "   /tmp/setup-https.sh"
    echo ""
    exit 1
fi

# 如果有 sshpass,自动执行
echo "正在上传 HTTPS 配置脚本..."
sshpass -p 'MTkj@123' scp setup-https.sh root@$SERVER_IP:/tmp/

echo ""
echo "正在执行 HTTPS 配置..."
sshpass -p 'MTkj@123' ssh root@$SERVER_IP "chmod +x /tmp/setup-https.sh && /tmp/setup-https.sh"

echo ""
echo "=========================================="
echo "  HTTPS 部署完成!"
echo "=========================================="
echo ""
echo "请访问: https://$DOMAIN"
