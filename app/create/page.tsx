"use client";

import { useState, useEffect } from "react";
import { encrypt } from "@/lib/crypto";
import FloatingSupport from "@/components/FloatingSupport";

interface CaptchaData {
  question: string;
  answer: number;
  encoded: string;
}

export default function Create() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 验证码状态
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  // 生成验证码
  useEffect(() => {
    generateNewCaptcha();
  }, []);

  function generateNewCaptcha() {
    // 简单的数学题生成
    const operators = ['+', '-'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let a: number, b: number, answer: number;
    
    if (operator === '+') {
      a = Math.floor(Math.random() * 15) + 1;
      b = Math.floor(Math.random() * 15) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 10) + 10;
      b = Math.floor(Math.random() * 9) + 1;
      answer = a - b;
    }
    
    const encoded = btoa(JSON.stringify({ a, b, op: operator, ans: answer }));
    
    setCaptcha({
      question: `${a} ${operator} ${b} = ?`,
      answer,
      encoded
    });
    setCaptchaAnswer("");
  }

  async function create() {
    if (!text.trim()) {
      setError("请输入秘密内容");
      return;
    }
    if (!password) {
      setError("请设置密码");
      return;
    }
    
    // 验证验证码
    if (!captcha) {
      setError("请完成人机验证");
      generateNewCaptcha();
      return;
    }
    
    const userAnswer = parseInt(captchaAnswer);
    if (isNaN(userAnswer) || userAnswer !== captcha.answer) {
      setError("❌ 验证码答案错误，请重新计算");
      generateNewCaptcha();
      return;
    }

    // 显示保存期限提醒
    const confirmed = window.confirm(
      "⚠️ 重要提示\n\n" +
      "当前创建的秘密默认保存为一个月。\n\n" +
      "如需升级为永久保存，请联系右侧客服。\n\n" +
      "是否继续创建？"
    );
    
    if (!confirmed) {
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
        body: JSON.stringify({ 
          id, 
          ...encrypted,
          captcha_token: captcha.encoded
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 429) {
          throw new Error("请求过于频繁，请稍后再试");
        }
        throw new Error(errorData.error || "保存失败");
      }

      setResult(id);
      setShowCaptcha(false);
    } catch (err: any) {
      setError(err.message || "创建失败，请重试");
      generateNewCaptcha(); // 刷新验证码
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

      <h1>🔒 创建秘密</h1>

      <div style={{ marginTop: 30 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          秘密内容
        </label>
        <textarea
          placeholder="秘密一旦创建，包括网站所有人的其他任何人都无法查看，修改，删除，在这里写下你想保密的话…"
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
          ⚠️ 请记住密码！解密时需要使用，端到端加密，密码无法找回。
        </p>
      </div>

      {/* 人机验证 */}
      {captcha && !result && (
        <div style={{ 
          marginTop: 20,
          padding: 16,
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
          border: "1px solid #e0e0e0"
        }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", fontSize: 14 }}>
            🤖 人机验证
          </label>
          <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center"
          }}>
            <span style={{
              fontSize: 20,
              fontWeight: "bold",
              fontFamily: "monospace",
              backgroundColor: "white",
              padding: "8px 16px",
              borderRadius: 4,
              border: "1px solid #ddd",
              letterSpacing: 2
            }}>
              {captcha.question}
            </span>
            <input
              type="number"
              placeholder="?"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              style={{
                width: 80,
                padding: 8,
                fontSize: 18,
                textAlign: "center",
                border: "1px solid #ddd",
                borderRadius: 4
              }}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
            <button
              onClick={generateNewCaptcha}
              type="button"
              style={{
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "1px solid #999",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 16
              }}
              title="换一题"
            >
              🔄
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
            💡 请输入计算结果，防止自动化攻击
          </p>
        </div>
      )}

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
              <li>请务必记下你的<strong>秘密编号</strong>和<strong>密码</strong></li>
              <li>只有输入编号和密码才可解锁秘密</li>
              <li>密码编号和密码都无法找回，请妥善保管！</li>
            </ul>
          </div>

          {/* 底部安全提示 */}
          <p style={{ 
            marginTop: 20, 
            fontSize: 13, 
            color: "#999",
            textAlign: "center"
          }}>
            🔒 端到端加密 · 密码无法找回 · 请妥善保管编号和密码
          </p>
        </div>
      )}
      <FloatingSupport />
    </div>
  );
}