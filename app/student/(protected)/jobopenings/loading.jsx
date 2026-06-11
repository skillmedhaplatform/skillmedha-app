export default function Loading() {
  return (
    <div style={{ padding: "24px", width: "100%" }}>
      <div style={{
        height: "28px",
        width: "40%",
        borderRadius: "6px",
        backgroundColor: "#e5e7eb",
        marginBottom: "24px",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <div style={{
        height: "16px",
        width: "100%",
        borderRadius: "4px",
        backgroundColor: "#e5e7eb",
        marginBottom: "12px",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <div style={{
        height: "16px",
        width: "80%",
        borderRadius: "4px",
        backgroundColor: "#e5e7eb",
        marginBottom: "12px",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <div style={{
        height: "16px",
        width: "60%",
        backgroundColor: "#e5e7eb",
        borderRadius: "4px",
        marginBottom: "12px",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
