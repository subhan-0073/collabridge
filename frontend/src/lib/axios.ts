import axios from "axios";
import { useAuthState } from "./store/auth";

const PORT = import.meta.env.VITE_BACKEND_PORT;
const API_BASE_URL = `http://localhost:${PORT}/api`;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthState.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthState.getState().logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
