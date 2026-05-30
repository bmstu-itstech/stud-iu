import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v0";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "Произошла неизвестная ошибка";
    toast.error(message);
    console.warn("[API Error]:", message);
    return Promise.reject(error);
  },
);

export default apiClient;
