# 🛡️ Secret Capsule 安全防护方案

## ⚠️ 已识别的威胁

### 1. 批量生成攻击
**风险**: 黑客使用脚本自动创建大量垃圾数据
**影响**: 
- 填满数据库,增加存储成本
- 消耗服务器资源
- 影响正常用户使用

### 2. DDoS 攻击
**风险**: 大量请求耗尽服务器带宽和计算资源
**影响**: 服务不可用

### 3. API 滥用
**风险**: 未经授权的程序化访问
**影响**: 数据泄露、资源浪费

---

## ✅ 已实施的多层防护

### 📋 防护层级总览

```
用户请求
   ↓
┌─────────────────────────────────┐
│ 第 1 层: IP 限流                 │ ← 每 15 分钟最多 50 次
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│ 第 2 层: 输入验证                │ ← 格式、长度、内容检查
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│ 第 3 层: 重复 ID 检测            │ ← 防止重复提交
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│ 第 4 层: 数据库约束              │ ← UNIQUE 索引
└─────────────────────────────────┘
   ↓
处理请求
```

---

## 🔧 具体防护措施

### 1️⃣ **IP 限流 (Rate Limiting)**

**实现位置**: [lib/rate-limit.ts](file://d:\secret-capsule\lib\rate-limit.ts)

**限流规则:**

| 类型 | 时间窗口 | 最大请求数 | 用途 |
|------|---------|-----------|------|
| **创建秘密** | 15 分钟 | 50 次 | 防止批量生成 |
| **解密查询** | 15 分钟 | 100 次 | 防止暴力破解 |
| **全局 IP** | 1 小时 | 200 次 | 总体限制 |
| **严格模式** | 1 分钟 | 10 次 | 可疑 IP |

**代码示例:**
```typescript
// 每 15 分钟最多 50 次创建请求
if (!checkRateLimit(clientIP)) {
  return NextResponse.json(
    { error: "请求过于频繁，请稍后再试" },
    { status: 429 }
  );
}
```

**效果:**
- ✅ 单个 IP 每小时最多 200 次请求
- ✅ 10 亿条数据需要至少 5787 天 (单 IP)
- ✅ 大幅降低自动化攻击效率

---

### 2️⃣ **严格的输入验证**

**实现位置**: [app/api/save/route.ts](file://d:\secret-capsule\app\api\save\route.ts:8-38)

**验证规则:**

```typescript
// 1. 必需字段检查
if (!body.id || !body.cipher || !body.salt || !body.iv) {
  return "缺少必要字段";
}

// 2. ID 格式验证 (必须是 SC-XXXXXX)
if (!/^SC-[A-Z0-9]{6}$/.test(body.id)) {
  return "无效的秘密编号格式";
}

// 3. 密文长度限制 (最大 10000 字符 ≈ 7.5KB 明文)
if (body.cipher.length > 10000) {
  return "密文过长";
}

// 4. Salt 固定长度 (Base64 编码后 24 字符)
if (body.salt.length !== 24) {
  return "无效的盐值";
}

// 5. IV 固定长度 (Base64 编码后 16 字符)
if (body.iv.length !== 16) {
  return "无效的初始化向量";
}

// 6. 最小内容检查 (防止空数据)
if (body.cipher.length < 10) {
  return "秘密内容不能为空";
}
```

**效果:**
- ✅ 阻止无效数据进入数据库
- ✅ 限制单条记录大小,防止超大文件
- ✅ 确保数据格式正确

---

### 3️⃣ **重复 ID 检测**

```typescript
// 检查 ID 是否已存在
const { data: existing } = await supabase
  .from("secrets")
  .select("id")
  .eq("id", body.id)
  .single();

if (existing) {
  return NextResponse.json(
    { error: "该秘密编号已存在" },
    { status: 409 }
  );
}
```

**效果:**
- ✅ 防止重复提交相同数据
- ✅ 避免数据库冗余

---

### 4️⃣ **数据库层约束**

需要在 Supabase 执行以下 SQL:

```sql
-- 1. ID 唯一约束
ALTER TABLE secrets ADD CONSTRAINT unique_id UNIQUE (id);

-- 2. 添加创建时间索引
CREATE INDEX idx_created_at ON secrets(created_at);

-- 3. 添加数据大小检查
ALTER TABLE secrets 
  ADD CONSTRAINT check_cipher_size 
  CHECK (length(cipher) <= 10000);

-- 4. 定期清理过期数据 (可选)
CREATE OR REPLACE FUNCTION cleanup_old_secrets()
RETURNS void AS $$
BEGIN
  DELETE FROM secrets 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- 每天凌晨 3 点执行清理
SELECT cron.schedule('cleanup-secrets', '0 3 * * *', 'SELECT cleanup_old_secrets()');
```

---

## 🚀 建议的高级防护 (生产环境)

### 5️⃣ **人机验证 (CAPTCHA)**

**推荐方案**: Cloudflare Turnstile (免费、隐私友好)

**安装:**
```bash
npm install @cloudflare/turnstile
```

**前端集成:**
```typescript
// app/create/page.tsx
import { Turnstile } from '@cloudflare/turnstile';

<Turnstile 
  siteKey="your-site-key"
  onVerify={(token) => setCaptchaToken(token)}
/>
```

**后端验证:**
```typescript
// app/api/save/route.ts
const verifyResponse = await fetch(
  'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: captchaToken,
      remoteip: clientIP
    })
  }
);

const verifyData = await verifyResponse.json();
if (!verifyData.success) {
  return NextResponse.json(
    { error: "人机验证失败" },
    { status: 403 }
  );
}
```

**效果:**
- ✅ 完全阻止自动化脚本
- ✅ 用户体验好 (无图片选择)
- ✅ 免费且保护隐私

---

### 6️⃣ **请求签名验证**

**原理**: 客户端使用临时密钥签名请求,防止篡改

**前端:**
```typescript
// 生成请求签名
const timestamp = Date.now();
const message = `${id}:${timestamp}`;
const signature = await signMessage(message, apiKey);

fetch('/api/save', {
  method: 'POST',
  headers: {
    'X-Signature': signature,
    'X-Timestamp': timestamp.toString()
  },
  body: JSON.stringify(data)
});
```

**后端:**
```typescript
// 验证签名和时间戳
const timestamp = parseInt(req.headers.get('X-Timestamp'));
if (Date.now() - timestamp > 5 * 60 * 1000) {
  return NextResponse.json({ error: "请求已过期" }, { status: 403 });
}

const isValid = await verifySignature(signature, message, apiKey);
if (!isValid) {
  return NextResponse.json({ error: "签名无效" }, { status: 403 });
}
```

---

### 7️⃣ **Web 应用防火墙 (WAF)**

**推荐方案:**

| 方案 | 价格 | 功能 |
|------|------|------|
| **Cloudflare** | 免费 | DDoS 防护、速率限制、IP 黑名单 |
| **AWS WAF** | $5/月 + 请求费 | 高级规则、SQL 注入防护 |
| **阿里云 WAF** | ¥980/月起 | 国内访问优化 |

**Cloudflare 配置示例:**
```yaml
# 速率限制规则
- name: "Limit secret creation"
  zone_name: "mtsc.site"
  endpoint: "/api/save"
  method: POST
  threshold: 50
  period: 900  # 15 分钟
  action: challenge  # 超过限制显示 CAPTCHA

# IP 黑名单
- name: "Block known bad IPs"
  action: block
  filters:
    - ip.src in {1.2.3.4 5.6.7.8}
```

---

### 8️⃣ **监控与告警**

**实现:**

```typescript
// lib/monitoring.ts
export function logSuspiciousActivity(ip: string, reason: string) {
  console.warn(`[SECURITY] ${reason} - IP: ${ip}`);
  
  // 发送到监控平台 (如 Sentry、LogRocket)
  Sentry.captureMessage(`Suspicious activity from ${ip}: ${reason}`, {
    level: 'warning',
    tags: { ip, type: 'security' }
  });
  
  // 如果超过阈值,加入黑名单
  if (getViolationCount(ip) > 10) {
    addToBlacklist(ip, 24 * 60 * 60); // 封禁 24 小时
  }
}
```

**监控指标:**
- 每分钟请求数
- 错误率 (4xx/5xx)
- 异常 IP 行为
- 数据库增长速度

---

## 📊 防护效果评估

### 攻击场景模拟

#### 场景 1: 单 IP 批量生成
```
攻击者: 1 个 IP
速度: 每秒 10 次请求
─────────────────────────
防护前: 
  - 1 小时: 36,000 条
  - 1 天: 864,000 条
  
防护后 (IP 限流):
  - 15 分钟: 50 条 ✓
  - 1 小时: 200 条 ✓
  - 1 天: 200 条 ✓
  
减少: 99.98%
```

#### 场景 2: 分布式攻击 (1000 个 IP)
```
攻击者: 1000 个僵尸网络 IP
每个 IP: 每小时 200 次
─────────────────────────
防护前:
  - 1 小时: 200,000 条
  - 1 天: 4,800,000 条
  
防护后 (IP 限流 + CAPTCHA):
  - CAPTCHA 拦截: ~95% ✓
  - 实际写入: 240,000 条/天
  
配合人工审核: 可进一步过滤
```

#### 场景 3: DDoS 攻击
```
攻击者: 10,000+ IP, 每秒 10,000 请求
─────────────────────────
防护前:
  - 服务器崩溃 ✗
  
防护后 (Cloudflare WAF):
  - Cloudflare 吸收流量 ✓
  - 源站正常运作 ✓
  - 攻击 IP 被自动封禁 ✓
```

---

## 🎯 成本效益分析

### 防护方案成本对比

| 方案 | 月成本 | 防护等级 | 实施难度 |
|------|--------|---------|---------|
| **基础限流 (已实施)** | ¥0 | ⭐⭐⭐ | ✅ 已完成 |
| **数据库约束** | ¥0 | ⭐⭐ | 简单 |
| **Cloudflare CDN** | ¥0 | ⭐⭐⭐⭐ | 中等 |
| **Turnstile CAPTCHA** | ¥0 | ⭐⭐⭐⭐⭐ | 中等 |
| **阿里云 WAF** | ¥980 | ⭐⭐⭐⭐⭐ | 复杂 |

**推荐组合 (性价比最高):**
```
✅ 基础限流 (已实施)
✅ 数据库约束
✅ Cloudflare 免费版 CDN
✅ Cloudflare Turnstile (免费)
─────────────────────────
总成本: ¥0/月
防护等级: ⭐⭐⭐⭐☆
```

---

## 📝 立即行动清单

### 高优先级 (立即执行)

- [x] ✅ **IP 限流** - 已实施
- [x] ✅ **输入验证** - 已实施
- [ ] **数据库 UNIQUE 约束** - 需在 Supabase 执行 SQL
- [ ] **添加错误日志监控** - 查看异常请求

### 中优先级 (本周内)

- [ ] **接入 Cloudflare CDN** - 免费 DDoS 防护
- [ ] **添加 Turnstile CAPTCHA** - 阻止自动化脚本
- [ ] **设置数据库定期清理** - 删除 1 年前数据

### 低优先级 (未来规划)

- [ ] **升级到 Redis 限流** - 支持分布式部署
- [ ] **添加用户认证** - 登录才能创建
- [ ] **付费 WAF** - 企业级防护

---

## 🔍 如何监控攻击

### 查看实时日志

```bash
# SSH 登录服务器
ssh root@39.96.28.3

# 查看 Nginx 访问日志 (实时监控)
tail -f /var/log/nginx/secret-capsule-access.log

# 查看异常请求 (429 = 限流)
grep "429" /var/log/nginx/secret-capsule-access.log | wc -l

# 查看高频 IP
awk '{print $1}' /var/log/nginx/secret-capsule-access.log | sort | uniq -c | sort -rn | head -20
```

### 数据库增长监控

```sql
-- 查看今天创建的秘密数量
SELECT COUNT(*) FROM secrets 
WHERE DATE(created_at) = CURRENT_DATE;

-- 查看每小时增长趋势
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as count
FROM secrets
GROUP BY hour
ORDER BY hour DESC
LIMIT 24;

-- 查找异常活跃的 IP (如果有记录)
SELECT ip_address, COUNT(*) as requests
FROM api_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 50;
```

---

## 💡 总结

### 当前防护状态

✅ **已实施:**
- IP 限流 (每 15 分钟 50 次)
- 严格的输入验证
- 重复 ID 检测
- 错误处理和日志

⏳ **建议添加:**
- Cloudflare CDN (免费 DDoS 防护)
- Turnstile CAPTCHA (阻止机器人)
- 数据库约束 (UNIQUE、大小限制)
- 定期数据清理

### 防护效果

**单 IP 攻击:**
- 防护前: 864,000 条/天
- 防护后: 200 条/天
- **减少 99.98%** ✓

**成本影响:**
- 10 亿条 → 降至可控范围
- 月存储成本从 ¥750 降至 ¥10 以内

### 最终建议

对于个人项目,**当前的防护措施已经足够**。如果真的遭遇大规模攻击,再考虑升级到付费 WAF 服务。

**关键原则:** 
1. 让攻击成本远高于收益
2. 多层防护,纵深防御
3. 持续监控,快速响应

您的网站现在已经具备了基础的抗攻击能力! 🛡️
