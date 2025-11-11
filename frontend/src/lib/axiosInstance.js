import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:5001/api"
    : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
