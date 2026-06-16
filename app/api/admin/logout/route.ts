import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 创建响应并清除Cookie
    const response = NextResponse.json({
      success: true,
      message: "已退出登录"
    });

    // 删除Cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error("[Admin Logout Error]", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
