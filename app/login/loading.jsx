export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc"
    }}>
      <div style={{
        width: "380px",
        padding: "40px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
      }}>
        <div style={{
          height: "40px", width: "160px",
          backgroundColor: "#e5e7eb", borderRadius: "8px",
          margin: "0 auto 32px",
          animation: "pulse 1.5s ease-in-out infinite"
        }}/>
        <div style={{
          height: "16px", width: "80px",
          backgroundColor: "#e5e7eb", borderRadius: "4px",
          marginBottom: "8px",
          animation: "pulse 1.5s ease-in-out infinite"
        }}/>
        <div style={{
          height: "44px", width: "100%",
          backgroundColor: "#e5e7eb", borderRadius: "8px",
          marginBottom: "16px",
          animation: "pulse 1.5s ease-in-out infinite"
        }}/>
        <div style={{
          height: "16px", width: "80px",
          backgroundColor: "#e5e7eb", borderRadius: "4px",
          marginBottom: "8px",
          animation: "pulse 1.5s ease-in-out infinite"
        }}/>
        <div style={{
          height: "44px", width: "100%",
          backgroundColor: "#e5e7eb", borderRadius: "8px",
          marginBottom: "24px",
          animation: "pulse 1.5s ease-in-out infinite"
        }}/>
        <div style={{
          height: "44px", width: "100%",
          backgroundColor: "#d1fae5", borderRadius: "8px",
          animation: "pulse 1.5s ease-in-out infinite"
        }}/>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  );
}
