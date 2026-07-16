import axios from "axios";
import { NextResponse } from "next/server";

/**
 * Same-origin image proxy used by the resume builder's profile photo.
 *
 * Student profile photos are served from a storage bucket that doesn't
 * send CORS headers. A browser `<img>`/CSS background-image loads such a
 * URL fine, but any canvas-based read of that pixel data (html2canvas for
 * the PDF download, or the client-side base64 conversion this app does
 * beforehand) is blocked by the browser as a cross-origin taint, so the
 * downloaded PDF ends up with a blank photo even though the on-screen
 * preview looks correct. Fetching the bytes here (server-side, no CORS
 * involved) and handing them back as a same-origin data URI sidesteps
 * that restriction entirely.
 */
export async function GET(req) {
  try {
    const imageUrl = req.nextUrl.searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    let parsed;
    try {
      parsed = new URL(imageUrl);
    } catch {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });

    const contentType = response.headers?.["content-type"] || "";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 });
    }

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Failed to proxy image", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }
}
