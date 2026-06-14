#!/bin/bash
# Secret Capsule 阿里云部署脚本
# 使用方法：ssh root@39.96.28.3 'bash -s' < deploy-to-aliyun.sh

set -e

echo "========================================"
echo "Secret Capsule 阿里云部署脚本"
echo "========================================"
echo ""

# 1. 更新系统
echo "[1/8] 更新系统..."
apt update && apt upgrade -y

# 2. 安装必要软件
echo "[2/8] 安装 Node.js、Git、Nginx..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git nginx

# 验证安装
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 3. 创建应用目录
echo "[3/8] 创建应用目录..."
mkdir -p /opt/secret-capsule
cd /opt/secret-capsule

# 4. 克隆代码
echo "[4/8] 克隆代码..."
git clone https://github.com/lanfenglongdi/secret-capsule.git . || {
    echo "代码已存在，跳过克隆"
}

# 5. 安装依赖
echo "[5/8] 安装依赖..."
npm install

# 6. 创建环境变量文件
echo "[6/8] 配置环境变量..."
cat > .env.local << EOF
SUPABASE_URL=https://fgushinpapaczugfztfg.supabase.co
SUPABASE_KEY=sb_publishable_c9tGHJ__pEpJoBoaTWJg6w_Jc1PPf7f
EOF

# 7. 构建生产版本
echo "[7/8] 构建生产版本..."
npm run build

# 8. 安装 PM2
echo "[8/8] 安装 PM2 并启动应用..."
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
echo "PM2 状态查看: pm2 list"
echo "应用日志查看: pm2 logs secret-capsule"
echo ""
echo "接下来请配置 Nginx 反向代理和域名解析"
echo "========================================"
