import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 禁用缓存，确保每次请求都从数据库获取最新数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const { data, error } = await supabase
    .from("secrets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "秘密不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}