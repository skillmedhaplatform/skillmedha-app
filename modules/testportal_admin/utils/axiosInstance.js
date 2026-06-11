import axios from "axios";
import { getLstorage } from "@/utils/windowMW";

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getLstorage("token");
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
