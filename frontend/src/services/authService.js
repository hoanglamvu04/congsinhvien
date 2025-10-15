import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL + "/api/auth";

export const login = async (ten_dang_nhap, mat_khau) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { ten_dang_nhap, mat_khau });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("ma_sinh_vien", res.data.ma_sinh_vien || "");
    return res.data;
  } catch (err) {
    throw err.response?.data || { error: "Không thể đăng nhập" };
  }
};
