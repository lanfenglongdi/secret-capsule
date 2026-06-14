import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  
  console.log("Saving secret:", body.id);

  const { data, error } = await supabase.from("secrets").insert(body);
  
  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  console.log("Secret saved successfully:", body.id);
  return NextResponse.json({ ok: true, id: body.id });
}