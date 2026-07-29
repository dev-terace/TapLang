import axios from "axios";
import { getToken } from "./auth.service";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

axios.defaults.withCredentials = true;

api.interceptors.request.use(
  async (config) => {
    console.log("interceptor 시작");

    try {
      const token = await getToken();

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      console.log("request 준비 완료");

      return config;

    } catch (error) {
      console.error("token 가져오기 실패:", error);
      throw error;
    }
  },
  (error) => {
    console.error("axios interceptor error:", error);
    return Promise.reject(error);
  }
);

export default api;