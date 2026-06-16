// 管理员认证工具
import { cookies } from 'next/headers';

// 管理员凭据（生产环境应该使用环境变量）
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

// 简单的会话令牌生成
export function generateSessionToken() {
  const random = Math.random().toString(36).substring(2);
  const timestamp = Date.now().toString(36);
  return `admin_${random}_${timestamp}`;
}

// 验证管理员凭据
export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// 设置管理员会话Cookie（服务器端）
export async function setAdminSession(token: string) {
  const cookieStore = cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24小时
    path: '/admin'
  });
}

// 清除管理员会话
export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete('admin_session');
}

// 检查管理员会话（服务器端）
export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session');
  return !!session?.value;
}
