import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 禁用缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // 获取所有秘密
    const { data: allSecrets, error: fetchError } = await supabase
      .from("secrets")
      .select("id, cipher, salt, iv");

    if (fetchError) {
      console.error("[Fetch Error]", fetchError);
      return NextResponse.json(
        { error: "查询失败" },
        { status: 500 }
      );
    }

    // 检查每个秘密的数据完整性
    const invalidIds: string[] = [];
    
    for (const secret of (allSecrets || [])) {
      // 检查必要字段是否存在且非空
      if (!secret.cipher || !secret.salt || !secret.iv) {
        invalidIds.push(secret.id);
        continue;
      }

      // 检查Base64格式是否有效
      try {
        atob(secret.cipher);
        atob(secret.salt);
        atob(secret.iv);
      } catch (e) {
        invalidIds.push(secret.id);
      }
    }

    // 删除无效数据
    let deletedCount = 0;
    if (invalidIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("secrets")
        .delete()
        .in("id", invalidIds);

      if (deleteError) {
        console.error("[Delete Error]", deleteError);
        return NextResponse.json(
          { error: "删除失败" },
          { status: 500 }
        );
      }

      deletedCount = invalidIds.length;
      console.log(`[Cleanup] 已删除 ${deletedCount} 个无效秘密: ${invalidIds.join(', ')}`);
    }

    return NextResponse.json({
      success: true,
      deleted_count: deletedCount,
      invalid_ids: invalidIds,
      message: deletedCount > 0 
        ? `已清理 ${deletedCount} 个数据损坏的秘密` 
        : "没有发现数据损坏的秘密"
    });

  } catch (err: any) {
    console.error("[Server Error]", err);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
