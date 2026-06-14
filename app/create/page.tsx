"use client";

import { useState, useEffect } from "react";
import { encrypt } from "@/lib/crypto";

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
  
  // Captcha state
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  // Generate captcha
  useEffect(() => {
    generateNewCaptcha();
  }, []);

  function generateNewCaptcha() {
    // Simple math problem generation
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
      setError("Please enter your secret content");
      return;
    }
    if (!password) {
      setError("Please set a password");
      return;
    }
    
    // Verify captcha
    if (!captcha) {
      setError("Please complete the human verification");
      generateNewCaptcha();
      return;
    }
    
    const userAnswer = parseInt(captchaAnswer);
    if (isNaN(userAnswer) || userAnswer !== captcha.answer) {
      setError("❌ Incorrect captcha answer, please recalculate");
      generateNewCaptcha();
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
          throw new Error("Too many requests, please try again later");
        }
        throw new Error(errorData.error || "Failed to save");
      }

      setResult(id);
      setShowCaptcha(false);
    } catch (err: any) {
      setError(err.message || "Creation failed, please try again");
      generateNewCaptcha(); // Refresh captcha
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    // Copy secret ID
    navigator.clipboard.writeText(result);
    alert("Secret ID copied to clipboard!");
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
      {/* Decrypt link */}
      <a 
        href="/s/any" 
        style={{
          position: "absolute",
          top: 20,
          right: 40,
          color: "#4caf50",
          textDecoration: "none",
          fontSize: 16,
          fontWeight: 500
        }}
        onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
        onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
      >
        🔓 Decrypt
      </a>

      <h1>🔒 Create Secret</h1>

      <div style={{ marginTop: 30 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          Secret Content
        </label>
        <textarea
          placeholder="Once created, secrets cannot be deleted or modified - they are stored forever&#10;&#10;Write down what you want to keep secret here..."
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
          Set Password
        </label>
        <input
          type="password"
          placeholder="Set a strong password for encryption"
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
          ⚠️ Remember your password! It's required for decryption. End-to-end encrypted, passwords cannot be recovered.
        </p>
      </div>

      {/* Human verification */}
      {captcha && !result && (
        <div style={{ 
          marginTop: 20,
          padding: 16,
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
          border: "1px solid #e0e0e0"
        }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", fontSize: 14 }}>
            🤖 Human Verification
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
              title="New Question"
            >
              🔄
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
            💡 Please enter the calculation result to prevent automated attacks
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
        {loading ? "Encrypting..." : "🔐 Create Secret"}
      </button>

      {result && (
        <div style={{
          marginTop: 30,
          padding: 24,
          backgroundColor: "#e3f2fd",
          borderRadius: 8,
          border: "1px solid #bbdefb"
        }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#1565c0" }}>✅ Secret Created Successfully!</h3>
          
          <div style={{
            padding: 16,
            backgroundColor: "white",
            borderRadius: 6,
            border: "1px solid #bbdefb",
            marginBottom: 16
          }}>
            <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#666" }}>
              📋 Secret ID (copy this ID)
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
                📋 Copy
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
              ⚠️ Important Notice
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "#666", lineHeight: 1.8 }}>
<<<<<<< HEAD
              <li>Please make sure to write down your <strong>Secret ID</strong> and <strong>Password</strong></li>
              <li>You can only unlock the secret by entering both the ID and password</li>
              <li>Neither the ID nor the password can be recovered. Please keep them safe!</li>
=======
              <li>请务必记下你的<strong>秘密编号</strong>和<strong>密码</strong></li>
              <li>只有输入编号和密码才可解锁秘密</li>
              <li>密码编号和密码都无法找回，请妥善保管！</li>
>>>>>>> 84cb70c (Fix scrolling issue on create and unlock pages)
            </ul>
          </div>

          {/* Bottom security notice */}
          <p style={{ 
            marginTop: 20, 
            fontSize: 13, 
            color: "#999",
            textAlign: "center"
          }}>
            🔒 End-to-end encrypted · Passwords cannot be recovered · Please keep your ID and password safe
          </p>
        </div>
      )}
    </div>
  );
}
