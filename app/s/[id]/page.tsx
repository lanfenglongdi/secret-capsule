"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { decrypt } from "@/lib/crypto";

export default function UnlockPage() {
  const router = useRouter();
  const params = useParams();
  const idFromUrl = params?.id as string || "";
  
  // 如果 URL 中的 ID 是 "any" 或其他占位符，则不预填充
  const initialId = (idFromUrl && idFromUrl !== "any") ? decodeURIComponent(idFromUrl) : "";
  
  const [secretId, setSecretId] = useState(initialId);
  const [password, setPassword] = useState("");
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  async function handleDelete() {
    if (!secretId.trim()) {
      setDeleteError("请输入秘密编号");
      return;
    }
    if (!password) {
      setDeleteError("请输入密码以验证身份");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: secretId.trim(),
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "删除失败");
      }

      alert("✅ 秘密已成功删除！");
      // 清除状态
      setSecretId("");
      setPassword("");
      setDecryptedText(null);
      setShowDeleteConfirm(false);
    } catch (err: any) {
      console.error(err);
      setDeleteError(err.message || "删除失败，请重试");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      padding: 40, 
      maxWidth: 600, 
      margin: "0 auto", 
      position: "relative",
      overflowY: "auto",
      boxSizing: "border-box"
    }}>
      {/* 首页链接 */}
      <a 
        href="/" 
        style={{
          position: "absolute",
          top: 20,
          right: 40,
          color: "#0070f3",
          textDecoration: "none",
          fontSize: 16,
          fontWeight: 500
        }}
        onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
        onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
      >
        🏠 首页
      </a>

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
          
          {/* 删除按钮 */}
          <div style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid #c8e6c9"
          }}>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  backgroundColor: "#ff5722",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                🗑️ 删除此秘密
              </button>
            ) : (
              <div style={{
                padding: 16,
                backgroundColor: "#fff3e0",
                borderRadius: 6,
                border: "1px solid #ffe0b2"
              }}>
                <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#e65100", fontWeight: "bold" }}>
                  ⚠️ 确认删除？
                </p>
                <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#666" }}>
                  此操作不可恢复！请输入密码确认删除。
                </p>
                {deleteError && (
                  <div style={{
                    marginBottom: 12,
                    padding: 8,
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: 4,
                    fontSize: 13
                  }}>
                    ❌ {deleteError}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      fontSize: 14,
                      backgroundColor: deleteLoading ? "#ccc" : "#d32f2f",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: deleteLoading ? "not-allowed" : "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    {deleteLoading ? "删除中..." : "确认删除"}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteError(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      fontSize: 14,
                      backgroundColor: "transparent",
                      color: "#666",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
