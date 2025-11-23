import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaUser,
  FaLock,
  FaHome,
  FaSignInAlt,
  FaHouseUser,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
} from "react-icons/fa";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import "../styles/Login.css";
import logo from "../assets/logo.png";

const Login = () => {
  const [role, setRole] = useState("sinhvien");
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "/api/auth/login",
        { ten_dang_nhap: tenDangNhap, mat_khau: matKhau, role },
        { withCredentials: true }
      );

      toast.success("Đăng nhập thành công!", { theme: "colored" });

      const redirect = {
        sinhvien: "/sinhvien",
        giangvien: "/giangvien",
        khoa: "/khoa",
        nhanvien: "/phongdaotao",
        admin: "/admin",
      }[role];

      setTimeout(() => (window.location.href = redirect || "/home"), 800);
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại";

      // 🔍 Tìm role thật từ BE
      const regex = /vai trò "(.+?)"/i;
      const match = msg.match(regex);

      if (match) {
        const realRole = match[1]; // vai trò đúng (admin, sinhvien…)
        const wrongRole = role;

        confirmAlert({
          closeOnClickOutside: false,
          closeOnEscape: true,
          customUI: ({ onClose }) => {
            return (
              <div
                className="custom-confirm"
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "12px",
                  width: "420px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  textAlign: "center",
                }}
              >
                <h2 style={{ marginBottom: "10px", fontSize: "22px" }}>
                  ⚠ Sai vai trò đăng nhập
                </h2>

                <p style={{ fontSize: "16px", lineHeight: "22px", textAlign: "left" }}>
                  Tài khoản này thuộc vai trò
                  <span style={{ color: "#0066ff", fontWeight: "bold" }}> {realRole}</span>,
                  không phải
                  <span style={{ color: "#cc0000", fontWeight: "bold" }}> {wrongRole}</span>.
                  <br /><br />
                  Bạn có muốn chuyển sang vai trò
                  <span style={{ color: "#0066ff", fontWeight: "bold" }}> {realRole} </span>
                  để đăng nhập đúng không?
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px"
                  }}
                >
                  <button
                    onClick={() => {
                      setRole(realRole);
                      toast.info(`Đã chuyển sang vai trò: ${realRole}`, {
                        theme: "colored",
                      });
                      setTimeout(() => passwordRef.current?.focus(), 200);
                      onClose();
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    ✔ Có
                  </button>

                  <button
                    onClick={() => {
                      toast.error("Hãy chọn lại vai trò phù hợp!", { theme: "colored" });
                      onClose();
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    ✖ Không
                  </button>
                </div>
              </div>
            );
          },
        });


        setLoading(false);
        return;
      }

      // ❌ Lỗi khác (không phải lỗi vai trò)
      toast.error(msg, { theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2>Đăng nhập tài khoản</h2>

        <form onSubmit={handleSubmit} autoComplete="on">
          {/* Vai trò */}
          <div className="login-select">
            <FaHome className="icon-left" />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="sinhvien">Sinh Viên</option>
              <option value="giangvien">Giảng Viên</option>
              <option value="khoa">Khoa</option>
              <option value="nhanvien">Phòng Đào Tạo</option>
              <option value="admin">Quản Trị Viên</option>
            </select>
            <FaChevronDown className="icon-right" />
          </div>

          {/* Username */}
          <div className="login-input">
            <FaUser className="icon-left" />
            <input
              type="text"
              placeholder="Tài khoản"
              value={tenDangNhap}
              onChange={(e) => setTenDangNhap(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="login-input">
            <FaLock className="icon-left" />
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span
              className="icon-right"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Buttons */}
          <div className="login-btns">
            <button type="submit" className="btn-login" disabled={loading}>
              <FaSignInAlt />
              {loading ? " Đang đăng nhập..." : " Đăng nhập"}
            </button>

            <a href="/home" className="btn-home">
              <FaHouseUser />
              Trang chủ
            </a>
          </div>

          <div className="login-forgot">
            <a href="#">[ Quên mật khẩu sinh viên ]</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
