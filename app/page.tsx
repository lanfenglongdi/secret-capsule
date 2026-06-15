"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!
      );
      
      const { data: { session } } = await supabaseAuth.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        // 隐藏部分邮箱，只显示前缀
        const email = session.user.email;
        const [prefix, domain] = email.split('@');
        const maskedPrefix = prefix.length > 3 ? prefix.substring(0, 3) + '***' : prefix;
        setUserEmail(`${maskedPrefix}@${domain}`);
      }
    } catch (err) {
      console.error("检查登录状态失败", err);
    } finally {
      setCheckingAuth(false);
    }
  }

  return (
    <main style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "25vh",
      paddingBottom: "50px",
      backgroundColor: "#fafafa",
      boxSizing: "border-box",
      overflow: "auto"
    }}>
      <div style={{ 
        maxWidth: 900, 
        width: "100%",
        textAlign: "center",
        transform: "scale(1.05)",
        transformOrigin: "top center"
      }}>
        {/* 标题 */}
        <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700, lineHeight: 1.2 }}>
          🔐 Secret Capsule<br />
          <span style={{ fontSize: 20 }}>秘密胶囊</span>
        </h1>
        
        {/* 简洁标语 - 三行格式 */}
        <div style={{ 
          marginBottom: 20,
          maxWidth: 500,
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <p style={{ 
            fontSize: 14, 
            color: "#333", 
            lineHeight: 1.6,
            margin: 0,
            fontWeight: 500
          }}>
            把重要的话，留给重要的人！
          </p>
          <p style={{ 
            fontSize: 14, 
            color: "#333", 
            lineHeight: 1.6,
            margin: "6px 0",
            fontWeight: 500
          }}>
            把重要的文字或者数字记录下来，留给将来的自己！
          </p>
          <p style={{ 
            fontSize: 12, 
            color: "#999", 
            lineHeight: 1.5,
            margin: "6px 0 0 0"
          }}>
            所有内容端到端加密，服务器不存储明文。
          </p>
        </div>
        
        {/* 操作按钮区域 - 上下排列 */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: 10, 
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 15
        }}>
          <a href="/create" style={{ textDecoration: "none", width: 180 }}>
            <button style={{
              padding: "12px 24px",
              fontSize: 15,
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              width: "100%"
            }}>
              ✨ 创建秘密
            </button>
          </a>
          <a href="/s/any" style={{ textDecoration: "none", width: 180 }}>
            <button style={{
              padding: "12px 24px",
              fontSize: 15,
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              width: "100%"
            }}>
              🔓 解锁秘密
            </button>
          </a>
          <a href="/delete/any" style={{ textDecoration: "none", width: 180 }}>
            <button style={{
              padding: "12px 24px",
              fontSize: 15,
              backgroundColor: "#ff5722",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              width: "100%"
            }}>
              🗑️ 删除秘密
            </button>
          </a>
        </div>

        {/* 会员区域 - 根据登录状态显示不同内容 */}
        {!checkingAuth && (
          <div style={{ 
            marginTop: 20,
            padding: "16px 24px",
            backgroundColor: isLoggedIn ? "#e8f5e9" : "#fff3e0",
            borderRadius: 8,
            border: isLoggedIn ? "1px solid #c8e6c9" : "1px solid #ffe0b2",
            maxWidth: 400,
            margin: "20px auto 15px auto"
          }}>
            <p style={{ 
              margin: "0 0 12px 0", 
              fontSize: 14, 
              color: isLoggedIn ? "#2e7d32" : "#e65100",
              fontWeight: "bold"
            }}>
              {isLoggedIn ? `${userEmail} ✅ 已登录` : "👑 会员中心"}
            </p>
            <div style={{
              display: "flex",
              gap: 12,
              justifyContent: "center"
            }}>
              {isLoggedIn ? (
                <a 
                  href="/profile" 
                  style={{
                    padding: "8px 20px",
                    fontSize: 14,
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 500
                  }}
                >
                  👤 个人中心
                </a>
              ) : (
                <>
                  <a 
                    href="/register" 
                    style={{
                      padding: "8px 20px",
                      fontSize: 14,
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      textDecoration: "none",
                      fontWeight: 500
                    }}
                  >
                    📧 注册会员
                  </a>
                  <a 
                    href="/login" 
                    style={{
                      padding: "8px 20px",
                      fontSize: 14,
                      backgroundColor: "transparent",
                      color: "#0070f3",
                      border: "1px solid #0070f3",
                      borderRadius: 6,
                      textDecoration: "none",
                      fontWeight: 500
                    }}
                  >
                    🔐 登录
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {/* 底部提示 */}
        <div style={{ 
          marginTop: 15, 
          fontSize: 11, 
          color: "#999",
          lineHeight: 1.6
        }}>
          <p style={{ margin: 0 }}>
            端到端加密，密码无法找回，请妥善保管编号和密码！
          </p>
          <p style={{ margin: "3px 0 0 0" }}>
            生成的秘密编号可以刻在项链、戒指或者纹身上，永久保存！
          </p>
        </div>
      </div>
    </main>
  );
}
