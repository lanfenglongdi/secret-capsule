"use client";

import { useState } from "react";
import { encrypt } from "@/lib/crypto";

export default function Create() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!text.trim()) {
      setError("请输入秘密内容");
      return;
    }
    if (!password) {
      setError("请设置密码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const id = "SC-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      const encrypted = await encrypt(text, password);

      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...encrypted })
      });

      if (!res.ok) {
        throw new Error("保存失败");
      }

      setResult(id);
    } catch (err) {
      setError("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    // 复制秘密编号
    navigator.clipboard.writeText(result);
    alert("秘密编号已复制到剪贴板！");
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h1>🔒 创建秘密</h1>
      <p style={{ color: "#666" }}>将重要的话加密保存，生成专属访问链接</p>

      <div style={{ marginTop: 30 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          秘密内容
        </label>
        <textarea
          placeholder="在这里写下你想保密的话..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            border: "1px solid #ddd",
            borderRadius: 6,
            minHeight: 150,
            boxSizing: "border-box",
            resize: "vertical",
            fontFamily: "inherit"
          }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          设置密码
        </label>
        <input
          type="password"
          placeholder="设置一个强密码用于加密"
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
        <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
          ⚠️ 请记住密码！解密时需要使用，无法找回
        </p>
      </div>

      {error && (
        <div style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: "#ffebee",
          color: "#c62828",
          borderRadius: 6
        }}>
          ❌ {error}
        </div>
      )}

      <button
        onClick={create}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "12px 24px",
          fontSize: 16,
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%"
        }}
      >
        {loading ? "加密中..." : "🔐 创建秘密"}
      </button>

      {result && (
        <div style={{
          marginTop: 30,
          padding: 24,
          backgroundColor: "#e3f2fd",
          borderRadius: 8,
          border: "1px solid #bbdefb"
        }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#1565c0" }}>✅ 秘密创建成功！</h3>
          
          <div style={{
            padding: 16,
            backgroundColor: "white",
            borderRadius: 6,
            border: "1px solid #bbdefb",
            marginBottom: 16
          }}>
            <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#666" }}>
              📋 秘密编号（复制这个编号）
            </p>
            <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}>
              <code style={{
                flex: 1,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
                fontSize: 18,
                fontWeight: "bold",
                letterSpacing: 1,
                border: "1px dashed #999"
              }}>
                {result}
              </code>
              <button
                onClick={copyToClipboard}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontSize: 14
                }}
              >
                📋 复制
              </button>
            </div>
          </div>

          <div style={{
            padding: 16,
            backgroundColor: "#fff3e0",
            borderRadius: 6,
            border: "1px solid #ffe0b2"
          }}>
            <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#e65100", fontWeight: "bold" }}>
              ⚠️ 重要提示
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#666", lineHeight: 1.8 }}>
              <li>请记下你的<strong>秘密编号</strong>和<strong>密码</strong></li>
              <li>将这两个信息告诉对方</li>
              <li>对方在首页输入编号和密码即可解锁</li>
              <li>密码无法找回，请妥善保管！</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}