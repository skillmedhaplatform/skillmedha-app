"use client";
import { getLstorage } from "./windowMW";

export const GetToken = () => {
  try {
    const token = getLstorage("token");
    return token || null;
  } catch (error) {
    console.error("Error getting token from localStorage:", error);
    return null;
  }
};
