// src/lib/axios.js
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";
import axios from "axios";

const API_BASE_URL = restUrl + "/api/dashboard";

// Helper to get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return getLstorage("token");
  }
  return null;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
