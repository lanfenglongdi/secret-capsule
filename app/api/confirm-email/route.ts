import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "邮箱不能为空" },
        { status: 400 }
      );
    }

    // 获取用户
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json(
        { error: listError.message },
        { status: 400 }
      );
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 更新用户，确认邮箱
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "邮箱验证成功"
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "操作失败" },
      { status: 500 }
    );
  }
}
