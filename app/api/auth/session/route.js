import { NextResponse } from "next/server";
import { encryptSession } from "@/universalUtils/sessionCrypto";

const TOKEN_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

const PERMISSIONS_OPTS = {
  ...TOKEN_OPTS,
  // permissions must be httpOnly — JS must never read/write it directly
};

// CORS configuration for the unified login portal
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_LOGIN_APP_URL || "http://localhost:2025",
  "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ── POST — login ──────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { token, verified, isSpecialOrg, psychometricDone } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Encrypt the payload object — tamper = decryption failure in middleware
    const permissionsEncrypted = await encryptSession({
      ev: verified === true,
      special: isSpecialOrg === true,
      pt: psychometricDone === true,
    });

    const response = NextResponse.json({ success: true }, { headers: corsHeaders });
    response.cookies.set("token", token, TOKEN_OPTS);
    response.cookies.set("permissions", permissionsEncrypted, PERMISSIONS_OPTS);
    return response;
  } catch (error) {
    console.error("[session POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── PATCH — update ev only ────────────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const { verified, isSpecialOrg, psychometricDone } = await request.json();
    const permissionsEncrypted = await encryptSession({
      ev: verified === true,
      special: isSpecialOrg === true,
      pt: psychometricDone === true,
    });

    const response = NextResponse.json({ success: true }, { headers: corsHeaders });
    response.cookies.set("permissions", permissionsEncrypted, PERMISSIONS_OPTS);
    return response;
  } catch (error) {
    console.error("[session PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE — logout ───────────────────────────────────────────────────────────
export async function DELETE() {
  const response = NextResponse.json({ success: true }, { headers: corsHeaders });
  response.cookies.delete("token");
  response.cookies.delete("permissions");
  return response;
}
