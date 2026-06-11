// pages/api/getPincodeDetails.js
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const pincode = req.nextUrl.searchParams.get("pincode");

    if (!pincode) {
      return NextResponse.json(
        { error: "Pincode is required" },
        { status: 200 }
      );
    }
    const url = "http://www.postalpincode.in";
    const response = await axios.get(`${url}/api/pincode/${pincode}`);
    const data = response.data;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch pincode details", error);
    return NextResponse.json(
      { error: "Failed to fetch pincode details" },
      { status: 500 }
    );
  }
}
