import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    // 使用服务角色密钥创建用户（绕过邮箱验证）
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // 自动验证邮箱，跳过邮件验证
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "测试用户创建成功",
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "创建失败" },
      { status: 500 }
    );
  }
}
