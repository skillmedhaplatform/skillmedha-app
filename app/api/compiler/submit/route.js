import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { language_id, source_code, stdin } = await req.json();

    const JUDGE0_RAPIDAPI_HOST = process.env.JUDGE0_RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";
    const JUDGE0_RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY;

    if (!JUDGE0_RAPIDAPI_KEY) {
      return NextResponse.json({ error: "Compiler credentials not configured" }, { status: 500 });
    }

    const res = await axios.post(
      `https://${JUDGE0_RAPIDAPI_HOST}/submissions/?base64_encoded=true&fields=*`,
      { language_id, source_code, stdin },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_RAPIDAPI_KEY,
          "X-RapidAPI-Host": JUDGE0_RAPIDAPI_HOST,
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (error) {
    console.error("Compiler submit error:", error?.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to submit code" },
      { status: error?.response?.status || 500 }
    );
  }
}
