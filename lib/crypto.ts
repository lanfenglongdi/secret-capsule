// 确保只在浏览器环境中使用 Web Crypto API
function getCrypto() {
  if (typeof window === 'undefined' || !window.crypto) {
    throw new Error('Web Crypto API is not available in this environment');
  }
  return window.crypto.subtle;
}

export async function encrypt(text: string, password: string) {
  const subtle = getCrypto();
  const enc = new TextEncoder();

  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  return {
    cipher: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv))
  };
}

export async function decrypt(
  cipher: string,
  salt: string,
  iv: string,
  password: string
): Promise<string> {
  const subtle = getCrypto();
  const dec = new TextDecoder();

  // 将 base64 字符串转换回 Uint8Array
  const cipherBytes = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
  const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  // 从密码派生密钥
  const keyMaterial = await subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // 解密密文
  const decrypted = await subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    cipherBytes
  );

  return dec.decode(decrypted);
}