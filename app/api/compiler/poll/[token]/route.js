import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req, { params }) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const JUDGE0_RAPIDAPI_HOST = process.env.JUDGE0_RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";
    const JUDGE0_RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY;

    if (!JUDGE0_RAPIDAPI_KEY) {
      return NextResponse.json({ error: "Compiler credentials not configured" }, { status: 500 });
    }

    const res = await axios.get(
      `https://${JUDGE0_RAPIDAPI_HOST}/submissions/${token}?base64_encoded=true&fields=*`,
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_RAPIDAPI_KEY,
          "X-RapidAPI-Host": JUDGE0_RAPIDAPI_HOST,
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (error) {
    console.error("Compiler poll error:", error?.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to poll result" },
      { status: error?.response?.status || 500 }
    );
  }
}
