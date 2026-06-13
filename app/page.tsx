"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [secretId, setSecretId] = useState("");
  const [password, setPassword] = useState("");

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (secretId && password) {
      // 将密码存储到 sessionStorage，然后跳转到解锁页面
      sessionStorage.setItem('unlock_password', password);
      router.push(`/s/${encodeURIComponent(secretId.trim())}`);
    }
  }

  return (
    <main style={{ 
      padding: "60px 20px", 
      maxWidth: 900, 
      margin: "0 auto",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 30, fontWeight: 700 }}>🔐 Secret Capsule</h1>
      
      {/* 主标语区域 */}
      <div style={{
        marginBottom: 50,
        padding: "30px 40px",
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        borderLeft: "4px solid #0070f3"
      }}>
        <p style={{ 
          fontSize: 22, 
          color: "#333", 
          lineHeight: 1.8,
          margin: "0 0 16px 0",
          fontWeight: 600
        }}>
          把重要的话，留给重要的人。
        </p>
        <div style={{
          height: 2,
          width: 60,
          backgroundColor: "#0070f3",
          margin: "20px auto"
        }} />
        <p style={{ 
          fontSize: 16, 
          color: "#666", 
          lineHeight: 2,
          margin: 0,
          textAlign: "left"
        }}>
          ——连我们自己都无法解密，你创建书写的秘密是一次性的，只出现在你的本地电脑，
        </p>
        <p style={{ 
          fontSize: 16, 
          color: "#666", 
          lineHeight: 2,
          margin: "12px 0 0 0",
          textAlign: "left"
        }}>
          请务必记住生成的秘密编号和密码，如果忘记，我们也无法解密，
        </p>
        <p style={{ 
          fontSize: 16, 
          color: "#666", 
          lineHeight: 2,
          margin: "12px 0 0 0",
          textAlign: "left"
        }}>
          所有内容都经过端到端加密，只有知道密码的人才能解密，网站服务器只保留密钥，不会储存秘密明文
        </p>
      </div>
      
      <div style={{ 
        display: "flex", 
        gap: 20, 
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 40
      }}>
        <a href="/create" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "16px 32px",
            fontSize: 18,
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer"
          }}>
            ✨ 创建秘密
          </button>
        </a>
      </div>

      {/* 手动输入解密区域 */}
      <div style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 30,
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        border: "2px solid #e0e0e0"
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 20 }}>🔓 解锁秘密</h2>
        <form onSubmit={handleUnlock}>
          <div style={{ marginBottom: 16, textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: "bold", fontSize: 14 }}>
              秘密编号
            </label>
            <input
              type="text"
              placeholder="例如：SC-ABC123"
              value={secretId}
              onChange={(e) => setSecretId(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: 6,
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: 20, textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: "bold", fontSize: 14 }}>
              密码
            </label>
            <input
              type="password"
              placeholder="输入解密密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: 6,
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!secretId || !password}
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: 16,
              backgroundColor: (!secretId || !password) ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: (!secretId || !password) ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            🔐 立即解锁
          </button>
        </form>
      </div>

      <div style={{ 
        marginTop: 60, 
        padding: 30, 
        backgroundColor: "#f5f5f5", 
        borderRadius: 12,
        textAlign: "left"
      }}>
        <h3 style={{ marginTop: 0 }}>如何使用？</h3>
        <ol style={{ lineHeight: 1.8, paddingLeft: 20 }}>
          <li><strong>创建秘密</strong>：写下内容，设置密码，生成秘密编号</li>
          <li><strong>分享编号</strong>：将秘密编号和密码告诉对方</li>
          <li><strong>解锁秘密</strong>：输入编号和密码即可查看原文</li>
        </ol>
        <p style={{ marginTop: 20, fontSize: 14, color: "#999" }}>
          🔒 所有内容都经过端到端加密，只有知道密码的人才能解密
        </p>
      </div>
    </main>
  );
}
