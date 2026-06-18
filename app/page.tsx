"use client";

export default function Home() {
  return (
    <main style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "4vh",
      paddingBottom: "50px",
      backgroundColor: "#fafafa",
      boxSizing: "border-box",
      overflow: "auto"
    }}>
      <div style={{ 
        maxWidth: 900, 
        width: "100%",
        textAlign: "center",
        transform: "scale(1.05)",
        transformOrigin: "top center"
      }}>
        {/* 标题 */}
        <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700, lineHeight: 1.2 }}>
          🔐 Secret Capsule<br />
          <span style={{ fontSize: 20 }}>秘密胶囊</span>
        </h1>
        
        {/* 简洁标语 - 三行格式 */}
        <div style={{ 
          marginBottom: 20,
          maxWidth: 500,
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <p style={{ 
            fontSize: 14, 
            color: "#333", 
            lineHeight: 1.6,
            margin: 0,
            fontWeight: 500
          }}>
            把重要的话，留给重要的人！
          </p>
          <p style={{ 
            fontSize: 14, 
            color: "#333", 
            lineHeight: 1.6,
            margin: "6px 0",
            fontWeight: 500
          }}>
            把重要的文字或者数字记录下来，留给将来的自己！
          </p>
          <p style={{ 
            fontSize: 12, 
            color: "#999", 
            lineHeight: 1.5,
            margin: "6px 0 0 0"
          }}>
            所有内容端到端加密，服务器不存储明文。
          </p>
        </div>
        
        {/* 操作按钮区域 - 上下排列 */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: 10, 
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 15
        }}>
          <a href="/create" style={{ textDecoration: "none", width: 180 }}>
            <button style={{
              padding: "12px 24px",
              fontSize: 15,
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
          <a href="/s/any" style={{ textDecoration: "none", width: 180 }}>
            <button style={{
              padding: "12px 24px",
              fontSize: 15,
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

        {/* 隐私保护说明 */}
        <div style={{ 
          marginTop: 30,
          maxWidth: 430,
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "left",
          padding: "20px 24px",
          backgroundColor: "white",
          borderRadius: 10,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          border: "1px solid #f5f5f5"
        }}>
          {/* 理念部分 */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              互联网让分享变得容易，大数据、AI横行的时代，却让隐私却越来越稀缺。
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              成百上千的账号数字等一大堆，使我们每个人头疼。
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              于是，我们做了 Secret Capsule，做一块真正互联网隐私的公益净土。
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: 0 }}>
              我们认为这是我们每个人理所当然的应有的权利！
            </p>
          </div>

          {/* 加密技术部分 */}
          <div style={{ 
            marginBottom: 12,
            padding: "12px 16px",
            backgroundColor: "#f8faff",
            borderRadius: 6,
            borderLeft: "3px solid #0070f3"
          }}>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              您的秘密，在离开设备前就已加密。
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              端到端加密，传到网站数据库的只是一堆无序的密钥。
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: 0 }}>
              没有您的密码，没有人能够看到它——包括我们自己。
            </p>
          </div>

          {/* 核心理念 */}
          <div style={{ 
            marginBottom: 12,
            padding: "12px 16px",
            backgroundColor: "#fffbf0",
            borderRadius: 6,
            borderLeft: "3px solid #ffa500"
          }}>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              真正的隐私，不是"请相信我们"。
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: 0 }}>
              而是：即使我们想看，也看不到。您的秘密，只属于您自己。
            </p>
          </div>

          {/* 技术安全性 */}
          <div style={{ 
            padding: "12px 16px",
            backgroundColor: "#f5fff8",
            borderRadius: 6,
            borderLeft: "3px solid #4caf50"
          }}>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              网站数据采用了世界级顶尖 Supabase 云数据库永久保存
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: "0 0 3px 0" }}>
              + 阿里云异地备份双保险 · GitHub 开源透明
            </p>
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.7, margin: 0 }}>
              多重保护，确保万无一失。
            </p>
          </div>
        </div>

        {/* 底部提示 */}
        <div style={{ 
          marginTop: 15, 
          fontSize: 11, 
          color: "#999",
          lineHeight: 1.6
        }}>
          <p style={{ margin: 0 }}>
            端到端加密，密码无法找回，请妥善保管编号和密码！
          </p>
          <p style={{ margin: "3px 0 0 0" }}>
            生成的秘密编号可以刻在项链、戒指或者纹身上，永久保存！
          </p>
        </div>
      </div>
    </main>
  );
}
