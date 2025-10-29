import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./GiangVienLayout.css";

const GiangVienLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("ma_giang_vien");
    navigate("/login");
  };

  return (
    <div className="layout-wrapper">
      <header className="navbar-gv">
        <div className="logo">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="logo"
            className="logo-img"
          />
          <span>Cổng thông tin giảng viên</span>
        </div>
        <nav>
          <ul>
            <li><Link to="/giangvien">🏠 Trang chủ</Link></li>
            <li><Link to="/giangvien/thongtin">👤 Thông tin cá nhân</Link></li>
            <li><Link to="/giangvien/lichday">📅 Lịch giảng dạy</Link></li>
            <li><Link to="/giangvien/lophocphan">📚 Lớp học phần</Link></li>

            <li><Link to="/giangvien/diem">🧾 Quản lý điểm</Link></li>
            <li><Link to="/giangvien/diemdanh">✅ Điểm danh</Link></li>
            <li><Link to="/giangvien/taichinh">💰 Tài chính</Link></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">🚪 Đăng xuất</button>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        © 2025 Trường Đại học XYZ — Cổng thông tin giảng viên
      </footer>
    </div>
  );
};

export default GiangVienLayout;
