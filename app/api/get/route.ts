import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const { data } = await supabase
    .from("secrets")
    .select("*")
    .eq("id", id)
    .single();

  return NextResponse.json(data);
}