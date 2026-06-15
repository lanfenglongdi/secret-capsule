import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 验证删除请求
function validateDeleteRequest(body: any) {
  // 检查必需字段
  if (!body.id || !body.password) {
    return "缺少必要字段";
  }

  // 验证 ID 格式 (SC-XXXXXX)
  if (!/^SC-[A-Z0-9]{6}$/.test(body.id)) {
    return "无效的秘密编号格式";
  }

  // 验证密码长度
  if (typeof body.password !== "string" || body.password.length < 1) {
    return "密码不能为空";
  }

  return null; // 验证通过
}

export async function POST(req: Request) {
  try {
    // 1. 解析请求体
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "无效的请求格式", code: "INVALID_JSON" },
        { status: 400 }
      );
    }

    // 2. 验证输入数据
    const validationError = validateDeleteRequest(body);
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // 3. 从数据库获取秘密（需要密码来验证所有权）
    const { data: secret, error: fetchError } = await supabase
      .from("secrets")
      .select("*")
      .eq("id", body.id)
      .single();

    if (fetchError || !secret) {
      return NextResponse.json(
        { error: "秘密不存在", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // 4. 验证密码（尝试解密来验证密码正确性）
    // 注意：这里我们只验证密码是否正确，不实际返回解密内容
    // 在实际应用中，可能需要更安全的密码验证方式
    try {
      // 导入解密函数
      const { decrypt } = await import("@/lib/crypto");
      
      // 尝试解密，如果密码错误会抛出异常
      await decrypt(secret.cipher, secret.salt, secret.iv, body.password);
    } catch (decryptError) {
      return NextResponse.json(
        { error: "密码错误，无法删除", code: "WRONG_PASSWORD" },
        { status: 403 }
      );
    }

    // 5. 删除秘密
    const { error: deleteError } = await supabase
      .from("secrets")
      .delete()
      .eq("id", body.id);

    if (deleteError) {
      console.error("[Database Delete Error]", deleteError);
      return NextResponse.json(
        { error: "删除失败，请重试", code: "DELETE_ERROR" },
        { status: 500 }
      );
    }

    console.log(`[Success] 秘密删除成功: ${body.id}`);
    return NextResponse.json({ ok: true, message: "秘密已删除" });

  } catch (error) {
    console.error("[Server Error]", error);
    return NextResponse.json(
      { error: "服务器错误，请重试", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
