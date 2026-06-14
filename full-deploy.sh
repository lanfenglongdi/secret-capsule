#!/bin/bash
set -e

echo "========================================"
echo "Secret Capsule 完整部署脚本"
echo "========================================"
echo ""

# 创建应用目录
mkdir -p /opt/secret-capsule
cd /opt/secret-capsule

# 克隆代码（如果已存在则先删除）
rm -rf * .git 2>/dev/null || true
git clone https://github.com/lanfenglongdi/secret-capsule.git . --depth 1

echo "✅ 代码克隆完成"

# 安装依赖
npm install --production

echo "✅ 依赖安装完成"

# 创建环境变量文件
cat > .env.local << 'EOF'
SUPABASE_URL=https://fgushinpapaczugfztfg.supabase.co
SUPABASE_KEY=sb_publishable_c9tGHJ__pEpJoBoaTWJg6w_Jc1PPf7f
EOF

echo "✅ 环境变量配置完成"

# 构建生产版本
npm run build

echo "✅ 构建完成"

# 安装 PM2
npm install -g pm2

# 停止旧进程（如果存在）
pm2 delete secret-capsule 2>/dev/null || true

# 启动应用
pm2 start npm --name "secret-capsule" -- start

# 设置开机自启
pm2 startup systemd -u root --hp /root
pm2 save

echo ""
echo "========================================"
echo "✅ 应用部署成功！"
echo "========================================"
echo ""
echo "应用运行在: http://localhost:3000"
echo "PM2 状态: pm2 list"
echo "查看日志: pm2 logs secret-capsule"
echo ""
