import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 保存期限选项（毫秒）
const RETENTION_PERIODS: Record<string, number | null> = {
  '1month': 30 * 24 * 60 * 60 * 1000,    // 1个月
  '1year': 365 * 24 * 60 * 60 * 1000,    // 1年
  '3years': 3 * 365 * 24 * 60 * 60 * 1000, // 3年
  'permanent': null                        // 永久
};

export async function POST(req: Request) {
  try {
    // 检查管理员认证
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=')) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, retention_period } = body;

    if (!id || !retention_period) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    if (!RETENTION_PERIODS.hasOwnProperty(retention_period)) {
      return NextResponse.json(
        { error: "无效的保存期限" },
        { status: 400 }
      );
    }

    // 计算过期时间
    const now = new Date();
    const periodMs = RETENTION_PERIODS[retention_period];
    const expiresAt = periodMs ? new Date(now.getTime() + periodMs).toISOString() : null;

    // 更新数据库
    const { error } = await supabase
      .from("secrets")
      .update({
        retention_period,
        expires_at: expiresAt
      })
      .eq("id", id);

    if (error) {
      console.error("[Database Update Error]", error);
      return NextResponse.json(
        { error: "更新失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "保存期限已更新"
    });

  } catch (err: any) {
    console.error("[Server Error]", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
