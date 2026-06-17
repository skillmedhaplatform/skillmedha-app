"use client";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    // Redirect to the centralized Unified Login portal
    window.location.href = `/login?portal=company`;
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#64748b' }}>Redirecting to Unified Login...</p>
    </div>
  );
}
