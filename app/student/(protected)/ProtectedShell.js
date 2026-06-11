"use client";
import StudentAuthGuard from "./StudentAuthGuard";
import StudentShell from "./StudentShell";

export default function ProtectedShell({ children, serverToken }) {
  return (
    <StudentAuthGuard serverToken={serverToken}>
      <StudentShell>
        {children}
      </StudentShell>
    </StudentAuthGuard>
  );
}
