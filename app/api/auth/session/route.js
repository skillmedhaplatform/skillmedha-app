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

// List of trusted domains that are allowed to make login requests
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:2025",
  "https://skillmedha.com",
  "https://www.skillmedha.com"
];

const getCorsHeaders = (request) => {
  const origin = request ? request.headers.get("origin") : null;
  // If the origin is in our safe list, allow it. Otherwise, fallback to a safe default (or block).
  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
};

export async function OPTIONS(request) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) });
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

    const response = NextResponse.json({ success: true }, { headers: getCorsHeaders(request) });
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

    const response = NextResponse.json({ success: true }, { headers: getCorsHeaders(request) });
    response.cookies.set("permissions", permissionsEncrypted, PERMISSIONS_OPTS);
    return response;
  } catch (error) {
    console.error("[session PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE — logout ───────────────────────────────────────────────────────────
export async function DELETE(request) {
  const response = NextResponse.json({ success: true }, { headers: getCorsHeaders(request) });
  response.cookies.delete("token");
  response.cookies.delete("permissions");
  return response;
}
