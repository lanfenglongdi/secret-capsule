"use client";

export default function Home() {
  return (
    <main style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      backgroundColor: "#fafafa"
    }}>
      <div style={{ 
        maxWidth: 800, 
        width: "100%",
        textAlign: "center"
      }}>
        {/* 标题 */}
        <h1 style={{ fontSize: 36, marginBottom: 12, fontWeight: 700, lineHeight: 1.2 }}>
          🔐 Secret Capsule<br />
          <span style={{ fontSize: 24 }}>秘密胶囊</span>
        </h1>
        
        {/* 简洁标语 - 三行格式 */}
        <div style={{ 
          marginBottom: 30,
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <p style={{ 
            fontSize: 16, 
            color: "#333", 
            lineHeight: 1.8,
            margin: 0,
            fontWeight: 500
          }}>
            把重要的话，留给重要的人！
          </p>
          <p style={{ 
            fontSize: 16, 
            color: "#333", 
            lineHeight: 1.8,
            margin: "8px 0",
            fontWeight: 500
          }}>
            把重要的文字或者数字记录下来，留给将来健忘的自己！
          </p>
          <p style={{ 
            fontSize: 13, 
            color: "#999", 
            lineHeight: 1.6,
            margin: "8px 0 0 0"
          }}>
            所有内容端到端加密，服务器不存储明文。
          </p>
        </div>
        
        {/* 操作按钮区域 - 上下排列 */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: 12, 
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20
        }}>
          <a href="/create" style={{ textDecoration: "none", width: 200 }}>
            <button style={{
              padding: "14px 28px",
              fontSize: 16,
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              width: "100%"
            }}>
              ✨ 创建秘密
            </button>
          </a>
          <a href="/s/any" style={{ textDecoration: "none", width: 200 }}>
            <button style={{
              padding: "14px 28px",
              fontSize: 16,
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              width: "100%"
            }}>
              🔓 解锁秘密
            </button>
          </a>
        </div>

        {/* 底部提示 */}
        <div style={{ 
          marginTop: 20, 
          fontSize: 12, 
          color: "#999",
          lineHeight: 1.8
        }}>
          <p style={{ margin: 0 }}>
            端到端加密，密码无法找回，请妥善保管编号和密码！
          </p>
          <p style={{ margin: "4px 0 0 0" }}>
            生成的秘密编号可以刻在项链、戒指或者纹身上，永久保存！
          </p>
        </div>
      </div>
    </main>
  );
}
