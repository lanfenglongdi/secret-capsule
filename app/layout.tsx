export default function RootLayout({
    children
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html style={{ overflow: "hidden", height: "100%" }}>
        <head>
          <style>{`
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden !important;
              height: 100%;
              width: 100%;
            }
            * {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            *::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </head>
        <body style={{ 
          fontFamily: "sans-serif",
          margin: 0,
          padding: 0,
          overflow: "hidden",
          height: "100%",
          width: "100%"
        }}>
          {children}
        </body>
      </html>
    );
  }