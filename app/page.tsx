"use client";

export default function Home() {
  return (
    <main style={{ 
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "25vh",
      paddingBottom: "50px",
      backgroundColor: "#fafafa",
      boxSizing: "border-box",
      overflow: "auto"
    }}>
      <div style={{ 
        maxWidth: 900, 
        width: "100%",
        textAlign: "center",
        transform: "scale(1.2)",
        transformOrigin: "top center"
      }}>
        {/* Title */}
        <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700, lineHeight: 1.2 }}>
          🔐 Secret Capsule
        </h1>
        
        {/* Tagline - three lines */}
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
            Leave important words for important people!
          </p>
          <p style={{ 
            fontSize: 14, 
            color: "#333", 
            lineHeight: 1.6,
            margin: "6px 0",
            fontWeight: 500
          }}>
            Record important text or numbers for your future self!
          </p>
          <p style={{ 
            fontSize: 12, 
            color: "#999", 
            lineHeight: 1.5,
            margin: "6px 0 0 0"
          }}>
            All content is end-to-end encrypted. The server never stores plaintext.
          </p>
        </div>
        
        {/* Action buttons - vertical layout */}
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
              ✨ Create Secret
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
              🔓 Unlock Secret
            </button>
          </a>
        </div>

        {/* Footer tips */}
        <div style={{ 
          marginTop: 15, 
          fontSize: 11, 
          color: "#999",
          lineHeight: 1.6
        }}>
          <p style={{ margin: 0 }}>
            End-to-end encrypted. Passwords cannot be recovered. Please keep your ID and password safe!
          </p>
          <p style={{ margin: "3px 0 0 0" }}>
            Your secret ID can be engraved on necklaces, rings, or tattoos for permanent storage!
          </p>
        </div>
      </div>
    </main>
  );
}
