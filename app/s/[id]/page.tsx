"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { decrypt } from "@/lib/crypto";

export default function UnlockPage() {
  const params = useParams();
  const idFromUrl = params?.id as string || "";
  
  const [secretId, setSecretId] = useState(decodeURIComponent(idFromUrl));
  const [password, setPassword] = useState("");
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 尝试从 sessionStorage 读取密码（如果从首页跳转过来）
    const savedPassword = sessionStorage.getItem('unlock_password');
    if (savedPassword) {
      setPassword(savedPassword);
      sessionStorage.removeItem('unlock_password'); // 使用后清除
    }
  }, []);

  async function handleUnlock() {
    if (!secretId.trim()) {
      setError("请输入秘密编号");
      return;
    }
    if (!password) {
      setError("请输入密码");
      return;
    }

    setLoading(true);
    setError(null);
    setDecryptedText(null);

    try {
      // 从服务器获取加密数据
      const res = await fetch(`/api/get?id=${encodeURIComponent(secretId.trim())}`);
      
      if (!res.ok) {
        throw new Error("秘密不存在或已被删除");
      }

      const data = await res.json();

      if (!data || !data.cipher) {
        throw new Error("秘密不存在");
      }

      // 使用密码解密
      const text = await decrypt(data.cipher, data.salt, data.iv, password);
      setDecryptedText(text);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("decrypt") || err.name === "OperationError") {
        setError("密码错误，无法解密");
      } else {
        setError(err.message || "解密失败");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h1>🔓 解锁秘密</h1>
      <p style={{ color: "#666", marginBottom: 30 }}>
        输入秘密编号和密码来查看内容
      </p>

      <div style={{ marginTop: 30 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
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

      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          密码
        </label>
        <input
          type="password"
          placeholder="输入解密密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
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
        onClick={handleUnlock}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "14px 24px",
          fontSize: 16,
          backgroundColor: loading ? "#ccc" : "#4caf50",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          fontWeight: "bold"
        }}
      >
        {loading ? "解密中..." : "🔐 立即解锁"}
      </button>

      {error && (
        <div style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: "#ffebee",
          color: "#c62828",
          borderRadius: 6,
          border: "1px solid #ffcdd2"
        }}>
          ❌ {error}
        </div>
      )}

      {decryptedText && (
        <div style={{
          marginTop: 30,
          padding: 24,
          backgroundColor: "#e8f5e9",
          borderRadius: 8,
          border: "1px solid #c8e6c9"
        }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#2e7d32" }}>✅ 秘密内容</h3>
          <div style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.8,
            fontSize: 16,
            padding: 16,
            backgroundColor: "white",
            borderRadius: 6,
            border: "1px solid #c8e6c9"
          }}>
            {decryptedText}
          </div>
        </div>
      )}
    </div>
  );
}
