import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
  "your-secret-key-change-this-in-production";

export async function POST(request) {
  try {
    const { permissions } = await request.json();

    if (!permissions) {
      return NextResponse.json(
        { success: false, error: "Permissions data required" },
        { status: 400 }
      );
    }

    // Extract only section permissions
    const sectionPermissions = {
      course: permissions.course || false,
      internship: permissions.internship || false,
      practice: permissions.practice || false,
      skill: permissions.skill || false,
    };

    // Encrypt permissions
    const jsonString = JSON.stringify(sectionPermissions);
    const encryptedPermissions = CryptoJS.AES.encrypt(
      jsonString,
      SECRET_KEY
    ).toString();

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Permissions set successfully",
    });

    // Set encrypted permissions cookie
    response.cookies.set("permissions", encryptedPermissions, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error setting permissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set permissions" },
      { status: 500 }
    );
  }
}
