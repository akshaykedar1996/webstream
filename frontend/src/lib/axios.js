// axios.js
import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ important
});


// import axios from "axios";
// import { axiosInstance } from "./axiosInstance";

// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://127.0.0.1:8000/api"
//     : "/api";


// export const login = async (data) => {
//   const res = await axiosInstance.post("/auth/login/", data);  // ✅ slash added
//   return res.data;
// };

// export const getAuthUser = async () => {
//   const res = await axiosInstance.get("/auth/me/");  // ✅ slash added
//   return res.data;
// };


// export const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: false,
// });

// // ✅ Auto attach JWT token
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
