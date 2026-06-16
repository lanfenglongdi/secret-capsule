import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // 检查管理员认证
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=')) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    // 获取当前时间
    const now = new Date().toISOString();

    // 查询过期的秘密
    const { data: expiredSecrets, error: fetchError } = await supabase
      .from("secrets")
      .select("id")
      .lte("expires_at", now)
      .not("expires_at", "is", null);

    if (fetchError) {
      console.error("[Fetch Error]", fetchError);
      return NextResponse.json(
        { error: "查询失败" },
        { status: 500 }
      );
    }

    // 删除过期的秘密
    const { error: deleteError } = await supabase
      .from("secrets")
      .delete()
      .lte("expires_at", now)
      .not("expires_at", "is", null);

    if (deleteError) {
      console.error("[Delete Error]", deleteError);
      return NextResponse.json(
        { error: "删除失败" },
        { status: 500 }
      );
    }

    const deletedCount = expiredSecrets?.length || 0;
    console.log(`[Cleanup] 已删除 ${deletedCount} 个过期秘密`);

    return NextResponse.json({
      success: true,
      deleted_count: deletedCount,
      message: `已清理 ${deletedCount} 个过期秘密`
    });

  } catch (err: any) {
    console.error("[Server Error]", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 也支持POST请求
export async function POST(req: Request) {
  return GET(req);
}
