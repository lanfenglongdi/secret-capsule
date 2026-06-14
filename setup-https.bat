@echo off
chcp 65001 >nul
echo ==========================================
echo   Secret Capsule HTTPS 配置助手
echo ==========================================
echo.
echo 服务器: 39.96.28.3
echo 域名: mtsc.site
echo.
echo 此脚本将:
echo   1. 上传 HTTPS 配置脚本到服务器
echo   2. SSH 登录并执行配置
echo.
pause

echo.
echo [步骤 1] 上传脚本到服务器...
scp full-https-setup.sh root@39.96.28.3:/tmp/full-https-setup.sh

if %errorlevel% neq 0 (
    echo.
    echo ❌ 上传失败,请检查网络连接
    pause
    exit /b 1
)

echo ✅ 上传成功
echo.
echo [步骤 2] 在服务器上执行配置脚本...
echo.
ssh root@39.96.28.3 "chmod +x /tmp/full-https-setup.sh && bash /tmp/full-https-setup.sh"

echo.
echo ==========================================
echo   配置完成!
echo ==========================================
echo.
echo 请在阿里云 DNS 控制台添加 A 记录后,
echo 然后 SSH 登录服务器执行:
echo   /opt/setup-ssl.sh
echo.
pause
