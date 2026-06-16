import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

  // 查询必要字段，包括保存期限信息
  const { data, error } = await supabase
    .from("secrets")
    .select("id, cipher, salt, iv, retention_period, expires_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("[Get Secret Error]", error);
    return NextResponse.json(
      { error: "秘密不存在或已被删除" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}