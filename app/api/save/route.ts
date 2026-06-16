import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// IP 限流存储 (生产环境建议使用 Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// 验证请求数据
function validateInput(body: any) {
  // 检查必需字段
  if (!body.id || !body.cipher || !body.salt || !body.iv) {
    return "缺少必要字段";
  }

  // 验证 ID 格式 (SC-XXXXXX)
  if (!/^SC-[A-Z0-9]{6}$/.test(body.id)) {
    return "无效的秘密编号格式";
  }

  // 验证字段长度限制
  if (typeof body.cipher !== "string" || body.cipher.length > 10000) {
    return "密文过长 (最大 10000 字符)";
  }

  if (typeof body.salt !== "string" || body.salt.length !== 24) {
    return "无效的盐值";
  }

  if (typeof body.iv !== "string" || body.iv.length !== 16) {
    return "无效的初始化向量";
  }

  // 检查内容是否为空
  if (body.cipher.length < 10) {
    return "秘密内容不能为空";
  }

  return null; // 验证通过
}

// IP 限流检查
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  // 清理过期记录 (15 分钟)
  if (limit && now > limit.resetTime) {
    rateLimitMap.delete(ip);
    return true;
  }

  // 检查是否超过限制
  if (limit && limit.count >= 50) {
    return false; // 超过限制
  }

  // 更新计数
  if (limit) {
    limit.count++;
  } else {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000 // 15 分钟后重置
    });
  }

  return true;
}

// 获取客户端 IP
function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP.trim();
  }
  
  return "unknown";
}

export async function POST(req: Request) {
  try {
    // 1. 获取客户端 IP
    const clientIP = getClientIP(req);

    // 2. IP 限流检查 (每 15 分钟最多 50 次)
    if (!checkRateLimit(clientIP)) {
      console.warn(`[Rate Limit] IP ${clientIP} 超过请求限制`);
      return NextResponse.json(
        { 
          error: "请求过于频繁，请稍后再试",
          code: "RATE_LIMITED"
        },
        { status: 429 }
      );
    }

    // 3. 解析请求体
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "无效的请求格式", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    // 4. 验证输入数据
    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // 5. 检查 ID 是否已存在
    const { data: existing } = await supabase
      .from("secrets")
      .select("id")
      .eq("id", body.id)
      .single();

    // 如果 ID 已存在，拒绝重复提交
    if (existing) {
      return NextResponse.json(
        { error: "该秘密编号已存在", code: "DUPLICATE_ID" },
        { status: 409 }
      );
    }

    // 6. 计算过期时间（默认1个月）
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天后

    // 7. 验证加密数据完整性（防止保存损坏的数据）
    try {
      // 验证Base64格式
      atob(body.cipher);
      atob(body.salt);
      atob(body.iv);
    } catch (e) {
      console.error("[Validation Error] 加密数据格式错误", e);
      return NextResponse.json(
        { error: "加密数据格式错误，请重试", code: "INVALID_ENCRYPTION" },
        { status: 400 }
      );
    }

    // 5. 保存到数据库，记录创建人IP
    const { error, data } = await supabase.from("secrets").insert({
      id: body.id,
      cipher: body.cipher,
      salt: body.salt,
      iv: body.iv,
      created_at: now.toISOString(),
      retention_period: '1month',
      expires_at: expiresAt.toISOString(),
      created_by: clientIP
    }).select();

    if (error) {
      console.error("[Database Error]", error);
      console.error("[Error Details]", JSON.stringify(error, null, 2));
      
      // 如果是字段不存在的错误，尝试使用最小字段集保存
      if (error.message.includes('created_by') || 
          error.message.includes('retention_period') || 
          error.message.includes('expires_at') ||
          error.message.includes('column') ||
          error.message.includes('schema cache')) {
        
        console.log("[Fallback] 尝试使用基础字段保存");
        const { error: retryError } = await supabase.from("secrets").insert({
          id: body.id,
          cipher: body.cipher,
          salt: body.salt,
          iv: body.iv,
          created_at: now.toISOString()
        });
        
        if (retryError) {
          console.error("[Retry Database Error]", retryError);
          return NextResponse.json(
            { error: `保存失败: ${retryError.message}`, code: "DATABASE_ERROR" },
            { status: 500 }
          );
        }
        
        console.log(`[Success] 秘密创建成功（基础字段）: ${body.id} (IP: ${clientIP})`);
        return NextResponse.json({ ok: true, id: body.id });
      }
      
      return NextResponse.json(
        { error: `保存失败: ${error.message}`, code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    console.log(`[Success] 秘密创建成功: ${body.id} (IP: ${clientIP})`);
    return NextResponse.json({ ok: true, id: body.id });

  } catch (error) {
    console.error("[Server Error]", error);
    return NextResponse.json(
      { error: "服务器错误，请重试", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
