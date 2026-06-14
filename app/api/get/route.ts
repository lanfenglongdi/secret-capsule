import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  console.log("Fetching secret:", id);

  const { data, error } = await supabase
    .from("secrets")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  if (!data) {
    console.log("Secret not found:", id);
    return NextResponse.json({ error: "Secret does not exist" }, { status: 404 });
  }
  
  console.log("Secret found:", id);
  return NextResponse.json(data);
}