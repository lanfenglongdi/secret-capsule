import { NextResponse } from "next/server";
import { verifyAdminCredentials, generateSessionToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "请输入用户名和密码" },
        { status: 400 }
      );
    }

    // 验证凭据
    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成会话令牌
    const token = generateSessionToken();

    // 创建响应并设置Cookie
    const response = NextResponse.json({
      success: true,
      message: "登录成功"
    });

    // 设置Cookie到响应头
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24小时
      path: '/'
    });

    return response;

  } catch (error) {
    console.error("[Admin Login Error]", error);
    return NextResponse.json(
      { error: "服务器错误，请重试" },
      { status: 500 }
    );
  }
}
