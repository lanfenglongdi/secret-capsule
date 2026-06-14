import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  await supabase.from("secrets").insert(body);

  return NextResponse.json({ ok: true });
}