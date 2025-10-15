import React, { useState } from "react";
import { login } from "../services/authService";
import InputField from "../components/InputField";

const Login = () => {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await login(tenDangNhap, matKhau);
      setSuccess(`Xin chào ${data.role.toUpperCase()}!`);
      window.location.href = "/home"; 
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-8 w-[380px]">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          CỔNG THÔNG TIN SINH VIÊN
        </h2>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Tên đăng nhập"
            value={tenDangNhap}
            onChange={setTenDangNhap}
            placeholder="Nhập tên đăng nhập"
          />
          <InputField
            label="Mật khẩu"
            type="password"
            value={matKhau}
            onChange={setMatKhau}
            placeholder="Nhập mật khẩu"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
