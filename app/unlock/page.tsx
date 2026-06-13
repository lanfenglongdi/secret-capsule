"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { decrypt } from "@/lib/crypto";

function UnlockForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [secretId, setSecretId] = useState(searchParams.get("id") || "");
  const [password, setPassword] = useState(searchParams.get("pwd") || "");
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 如果 URL 中有参数，自动尝试解密
  useEffect(() => {
    if (searchParams.get("id") && searchParams.get("pwd")) {
      handleUnlock();
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

  function goHome() {
    router.push("/");
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <button 
        onClick={goHome}
        style={{
          marginBottom: 20,
          padding: "8px 16px",
          backgroundColor: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 14
        }}
      >
        ← 返回首页
      </button>

      <h1>🔓 解锁秘密</h1>

      {/* 如果没有预填参数，显示输入表单 */}
      {!searchParams.get("id") && !searchParams.get("pwd") && (
        <div style={{ marginTop: 30 }}>
          <div style={{ marginBottom: 16 }}>
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

          <div style={{ marginBottom: 20 }}>
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
              width: "100%",
              padding: "14px 24px",
              fontSize: 16,
              backgroundColor: loading ? "#ccc" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold"
            }}
          >
            {loading ? "解密中..." : "🔐 立即解锁"}
          </button>
        </div>
      )}

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

export default function UnlockPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>加载中...</div>}>
      <UnlockForm />
    </Suspense>
  );
}
