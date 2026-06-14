"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { decrypt } from "@/lib/crypto";

export default function UnlockPage() {
  const router = useRouter();
  const params = useParams();
  const idFromUrl = params?.id as string || "";
  
  // If the ID in URL is "any" or other placeholder, don't prefill
  const initialId = (idFromUrl && idFromUrl !== "any") ? decodeURIComponent(idFromUrl) : "";
  
  const [secretId, setSecretId] = useState(initialId);
  const [password, setPassword] = useState("");
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to read password from sessionStorage (if navigated from homepage)
    const savedPassword = sessionStorage.getItem('unlock_password');
    if (savedPassword) {
      setPassword(savedPassword);
      sessionStorage.removeItem('unlock_password'); // Clear after use
    }
  }, []);

  async function handleUnlock() {
    if (!secretId.trim()) {
      setError("Please enter the secret ID");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }

    setLoading(true);
    setError(null);
    setDecryptedText(null);

    try {
      // Fetch encrypted data from server
      const res = await fetch(`/api/get?id=${encodeURIComponent(secretId.trim())}`);
      
      if (!res.ok) {
        throw new Error("Secret does not exist or has been deleted");
      }

      const data = await res.json();

      if (!data || !data.cipher) {
        throw new Error("Secret does not exist");
      }

      // Decrypt with password
      const text = await decrypt(data.cipher, data.salt, data.iv, password);
      setDecryptedText(text);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("decrypt") || err.name === "OperationError") {
        setError("Incorrect password, cannot decrypt");
      } else {
        setError(err.message || "Decryption failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto", position: "relative" }}>
      {/* Home link */}
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
        🏠 Home
      </a>

      <h1>🔓 Unlock Secret</h1>
      <p style={{ color: "#666", marginBottom: 30 }}>
        Enter the secret ID and password to view the content
      </p>

      <div style={{ marginTop: 30 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
          Secret ID
        </label>
        <input
          type="text"
          placeholder="e.g., SC-ABC123"
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
          Password
        </label>
        <input
          type="password"
          placeholder="Enter decryption password"
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
        {loading ? "Decrypting..." : "🔐 Unlock Now"}
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
          <h3 style={{ margin: "0 0 16px 0", color: "#2e7d32" }}>✅ Secret Content</h3>
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
