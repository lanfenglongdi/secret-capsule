#!/bin/bash
# Secret Capsule 阿里云更新脚本（用于更新已部署的应用）
# 使用方法：ssh root@39.96.28.3 'bash -s' < update-aliyun.sh

set -e

echo "========================================"
echo "Secret Capsule 阿里云更新脚本"
echo "========================================"
echo ""

cd /opt/secret-capsule

# 1. 拉取最新代码
echo "[1/4] 拉取 main-chinese 分支最新代码..."
git checkout main-chinese
git pull origin main-chinese

# 2. 安装依赖（如果有新依赖）
echo "[2/4] 检查依赖..."
npm install

# 3. 构建生产版本
echo "[3/4] 构建生产版本..."
npm run build

# 4. 重启应用
echo "[4/4] 重启应用..."
pm2 restart secret-capsule

echo ""
echo "========================================"
echo "✅ 应用更新成功！"
echo "========================================"
echo ""
echo "查看日志: pm2 logs secret-capsule"
echo "查看状态: pm2 list"
echo "========================================"
