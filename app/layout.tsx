export default function RootLayout({
    children
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html style={{ height: "100%" }}>
        <head>
          <style>{`
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
            }
          `}</style>
        </head>
        <body style={{ 
          fontFamily: "sans-serif",
          margin: 0,
          padding: 0,
          height: "100%",
          width: "100%"
        }}>
          {children}
        </body>
      </html>
    );
  }