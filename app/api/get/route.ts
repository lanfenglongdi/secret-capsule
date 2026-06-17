import { NextResponse } from "next/server";
import { dualRead } from "@/lib/dual-database";

// 禁用缓存，确保每次请求都从数据库获取最新数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "缺少秘密编号" },
      { status: 400 }
    );
  }

  // 双读：优先从 Supabase 读取，失败时尝试本地数据库
  const { data, source, error } = await dualRead(id);

  if (!data || error) {
    console.error("[Get Secret Error]", error);
    return NextResponse.json(
      { error: "秘密不存在或已被删除" },
      { status: 404 }
    );
  }

  // 如果从本地数据库读取，记录警告
  if (source === "local") {
    console.warn(`[Dual-DB] 从本地备份数据库读取秘密: ${id}`);
  }

  return NextResponse.json(data);
}