import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // 第一步：先查询过期秘密的数量
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

    // 第三步：获取所有未过期的秘密
    let { data, error } = await supabase
      .from("secrets")
      .select("id, created_at, retention_period, expires_at, created_by")
      .order("created_at", { ascending: false });

    // 如果字段不存在，使用旧查询
    if (error && error.code === '42703') {
      console.log("[Info] 数据库尚未添加新字段，使用兼容模式");
      const result = await supabase
        .from("secrets")
        .select("id, created_at")
        .order("created_at", { ascending: false });
      
      data = result.data?.map(item => ({
        ...item,
        retention_period: null,
        expires_at: null,
        created_by: null
      })) || [];
      error = result.error;
    }

    if (error) {
      console.error("[Database Error]", error);
      return NextResponse.json(
        { error: "获取数据失败: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
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
