import { NextResponse } from "next/server";
import { getAllSecrets, supabase } from "@/lib/dual-database";

// 禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // 检查管理员认证
    const cookieHeader = req.headers.get('cookie');
    
    if (!cookieHeader) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 解析Cookie找到admin_session
    const cookiesList = cookieHeader.split(';').map(c => c.trim());
    let sessionValue = '';
    
    for (const cookie of cookiesList) {
      if (cookie.startsWith('admin_session=')) {
        sessionValue = cookie.substring('admin_session='.length);
        break;
      }
    }

    if (!sessionValue || !sessionValue.startsWith('admin_')) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 第一步：先查询过期秘密的数量（从 Supabase）
    const now = new Date().toISOString();
    const { count: expiredCount } = await supabase
      .from("secrets")
      .select("*", { count: 'exact', head: true })
      .lte("expires_at", now)
      .not("expires_at", "is", null);

    // 第二步：删除所有过期的秘密（永久删除，不留痕迹）
    await supabase
      .from("secrets")
      .delete()
      .lte("expires_at", now)
      .not("expires_at", "is", null);

    // 第三步：获取所有未过期的秘密（双读）
    const { data, source, error } = await getAllSecrets();

    if (error || !data) {
      console.error("[Database Error]", error);
      return NextResponse.json(
        { error: "获取数据失败" },
        { status: 500 }
      );
    }

    // 如果从本地数据库读取，记录警告
    if (source === "local") {
      console.warn("[Dual-DB] 从本地备份数据库读取管理员列表");
    }

    return NextResponse.json({
      success: true,
      count: data.length || 0,
      expired_count: expiredCount || 0,
      secrets: data || []
    });

  } catch (err: any) {
    console.error("[Server Error]", err);
    return NextResponse.json(
      { error: "服务器错误: " + err.message },
      { status: 500 }
    );
  }
}
