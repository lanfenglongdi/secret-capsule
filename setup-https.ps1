# Secret Capsule HTTPS 配置助手 (PowerShell)
# 使用方法: .\setup-https.ps1

$serverIP = "39.96.28.3"
$domain = "mtsc.site"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Secret Capsule HTTPS 配置助手" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务器: $serverIP" -ForegroundColor Yellow
Write-Host "域名: $domain" -ForegroundColor Yellow
Write-Host ""

# 检查 scp 和 ssh 是否可用
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到 scp 命令,请确保已安装 OpenSSH" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到 ssh 命令,请确保已安装 OpenSSH" -ForegroundColor Red
    exit 1
}

Write-Host "[步骤 1] 上传配置脚本到服务器..." -ForegroundColor Green
try {
    scp full-https-setup.sh "root@${serverIP}:/tmp/full-https-setup.sh"
    Write-Host "✅ 上传成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 上传失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[步骤 2] 在服务器上执行配置脚本..." -ForegroundColor Green
Write-Host ""

ssh "root@${serverIP}" "chmod +x /tmp/full-https-setup.sh && bash /tmp/full-https-setup.sh"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  配置完成!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请在阿里云 DNS 控制台添加 A 记录后," -ForegroundColor Yellow
Write-Host "然后 SSH 登录服务器执行:" -ForegroundColor Yellow
Write-Host "  /opt/setup-ssl.sh" -ForegroundColor White
Write-Host ""
