"use client";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    // Redirect to the centralized Unified Login portal
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_APP_URL || "http://localhost:2025";
    window.location.href = `${loginUrl}/login?portal=company`;
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#64748b' }}>Redirecting to Unified Login...</p>
    </div>
  );
}
