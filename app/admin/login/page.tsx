"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!username || !password) {
      setError("请输入用户名和密码");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "登录失败");
      }

      // 登录成功，跳转到仪表板
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      padding: 20
    }}>
      <div style={{
        maxWidth: 400,
        width: "100%",
        padding: 40,
        backgroundColor: "white",
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{
          margin: "0 0 8px 0",
          color: "#333",
          fontSize: 28,
          textAlign: "center"
        }}>
          🔐 管理员登录
        </h1>
        <p style={{
          color: "#999",
          textAlign: "center",
          marginBottom: 30,
          fontSize: 14
        }}>
          请输入管理员凭据
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              marginBottom: 8,
              fontWeight: "bold",
              color: "#333",
              fontSize: 14
            }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入管理员用户名"
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

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              marginBottom: 8,
              fontWeight: "bold",
              color: "#333",
              fontSize: 14
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
              placeholder="输入管理员密码"
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

          {error && (
            <div style={{
              marginBottom: 20,
              padding: 12,
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: 6,
              border: "1px solid #ffcdd2",
              fontSize: 14
            }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              fontSize: 16,
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 12,
          color: "#999"
        }}>
          <a href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
            ← 返回网站首页
          </a>
        </div>
      </div>
    </div>
  );
}
