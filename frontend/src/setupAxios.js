// src/setupAxios.js
import axios from "axios";
import { toast } from "react-toastify"; // nếu bạn đã dùng react-toastify

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// 🔧 Cấu hình mặc định
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true; // ✅ Gửi cookie HTTP-only trong mọi request

// 🧠 Interceptor bắt lỗi token hết hạn / không hợp lệ
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Nếu token hết hạn hoặc không hợp lệ
      if (status === 401 || status === 403) {
        const msg = data?.message;
        if (msg === "TOKEN_EXPIRED" || msg === "TOKEN_INVALID") {
          toast.info("🔒 Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", {
            position: "top-center",
          });

          // Xoá thông tin user lưu cục bộ (nếu có)
          localStorage.removeItem("user");

          // Chuyển hướng về login
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
